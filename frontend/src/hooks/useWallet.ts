import { useState, useCallback } from "react";
import {
    StellarWalletsKit,
    WalletNetwork,
    FreighterModule,
    xBullModule,
    FREIGHTER_ID,
    XBULL_ID,
} from "@creit.tech/stellar-wallets-kit";

export interface WalletState {
    publicKey: string | null;
    isConnecting: boolean;
    error: string | null;
    kit: StellarWalletsKit | null;
}

export function useWallet() {
    const [state, setState] = useState<WalletState>({
        publicKey: null,
        isConnecting: false,
        error: null,
        kit: null,
    });

    const connectWallet = useCallback(async (walletId: string) => {
        setState((s) => ({ ...s, isConnecting: true, error: null }));
        try {
            const kit = new StellarWalletsKit({
                network: WalletNetwork.TESTNET,
                selectedWalletId: walletId,
                modules: [new FreighterModule(), new xBullModule()],
            });

            const { address } = await kit.getAddress();
            setState({ publicKey: address, isConnecting: false, error: null, kit });
        } catch (err: unknown) {
            let message = "Failed to connect wallet";
            if (err instanceof Error) {
                if (err.message.includes("not installed"))
                    message = "Wallet not installed. Please install the extension.";
                else if (err.message.includes("denied") || err.message.includes("reject"))
                    message = "Connection rejected by user.";
                else if (err.message.includes("balance"))
                    message = "Insufficient balance to proceed.";
                else message = err.message;
            }
            setState((s) => ({ ...s, isConnecting: false, error: message }));
        }
    }, []);

    const disconnectWallet = useCallback(() => {
        setState({ publicKey: null, isConnecting: false, error: null, kit: null });
    }, []);

    return { ...state, connectWallet, disconnectWallet };
}

export { FREIGHTER_ID, XBULL_ID };
