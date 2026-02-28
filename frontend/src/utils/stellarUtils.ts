import {
    Contract,
    Networks,
    rpc,
    TransactionBuilder,
    Account,
    Keypair,
    BASE_FEE,
    xdr,
    scValToNative,
    nativeToScVal,
} from "@stellar/stellar-sdk";

// ─── Network Configuration ───────────────────────────────────
export const NETWORK_PASSPHRASE = Networks.TESTNET;
export const RPC_URL = "https://soroban-testnet.stellar.org";

// Replace this with your deployed contract ID after running:
// soroban contract deploy --wasm target/wasm32-unknown-unknown/release/live_poll.wasm --network testnet
export const CONTRACT_ID =
    "CBJCFW6AE36XHD5DZCMYAT2UXXJT2UMZPEO5ACH3HMZJUT4S5AOOCLLS";

// ─── RPC Server ───────────────────────────────────────────────
export const server = new rpc.Server(RPC_URL, {
    allowHttp: false,
});

// ─── Fetch Poll Results ───────────────────────────────────────
export async function fetchResults(): Promise<{ yes: number; no: number }> {
    if (!CONTRACT_ID) {
        return { yes: 0, no: 0 };
    }

    const contract = new Contract(CONTRACT_ID);

    // Build a simulated read transaction using a valid but dummy account
    // since we only need to read data and not submit it to the network.
    const account = new Account(Keypair.random().publicKey(), "0");

    const tx = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: NETWORK_PASSPHRASE,
    })
        .addOperation(contract.call("get_results"))
        .setTimeout(30)
        .build();

    const sim = await server.simulateTransaction(tx);

    if (rpc.Api.isSimulationError(sim)) {
        throw new Error(`Simulation failed: ${sim.error}`);
    }

    // Extract return value
    const retVal = (sim as rpc.Api.SimulateTransactionSuccessResponse)
        .result?.retval;
    if (!retVal) throw new Error("No return value from simulation");

    const native = scValToNative(retVal) as [bigint, bigint];
    return { yes: Number(native[0]), no: Number(native[1]) };
}

// ─── Submit Vote ──────────────────────────────────────────────
export async function submitVote(
    publicKey: string,
    signTransaction: (xdr: string, opts: { networkPassphrase: string }) => Promise<{ signedTxXdr: string }>,
    choice: boolean
): Promise<string> {
    if (!CONTRACT_ID) {
        throw new Error("Contract not deployed");
    }

    const contract = new Contract(CONTRACT_ID);
    const account = await server.getAccount(publicKey);

    const tx = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: NETWORK_PASSPHRASE,
    })
        .addOperation(
            contract.call(
                "vote",
                ...[
                    nativeToScVal(publicKey, { type: "address" }),
                    xdr.ScVal.scvBool(choice),
                ]
            )
        )
        .setTimeout(30)
        .build();

    // Simulate first to get footprint
    const sim = await server.simulateTransaction(tx);
    if (rpc.Api.isSimulationError(sim)) {
        throw new Error(`Simulation error: ${sim.error}`);
    }

    // Assemble with simulation data
    const assembled = rpc.assembleTransaction(
        tx,
        sim as rpc.Api.SimulateTransactionSuccessResponse
    ).build();

    // Sign via wallet
    const { signedTxXdr } = await signTransaction(assembled.toXDR(), {
        networkPassphrase: NETWORK_PASSPHRASE,
    });

    // Submit
    const response = await server.sendTransaction(
        TransactionBuilder.fromXDR(signedTxXdr, NETWORK_PASSPHRASE)
    );

    if (response.status === "ERROR") {
        throw new Error(`Transaction failed: ${JSON.stringify(response.errorResult)}`);
    }

    const hash = response.hash;

    // Poll for completion
    let attempts = 0;
    while (attempts < 30) {
        await new Promise((r) => setTimeout(r, 2000));
        const result = await server.getTransaction(hash);
        if (result.status === rpc.Api.GetTransactionStatus.SUCCESS) {
            return hash;
        }
        if (result.status === rpc.Api.GetTransactionStatus.FAILED) {
            throw new Error("Transaction failed on-chain");
        }
        attempts++;
    }

    throw new Error("Transaction timed out waiting for confirmation");
}

// ─── Stellar Expert Link ──────────────────────────────────────
export function getTxLink(hash: string): string {
    return `https://stellar.expert/explorer/testnet/tx/${hash}`;
}
