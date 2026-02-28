import { useState, useCallback, useEffect, useRef } from "react";
import { fetchResults, submitVote } from "../utils/stellarUtils";
import {
    getCachedResults,
    setCachedResults,
    getCachedHasVoted,
    setCachedHasVoted,
} from "../utils/cacheUtils";

export type TxStatus = "idle" | "pending" | "success" | "failed";

export interface PollState {
    yesVotes: number;
    noVotes: number;
    isFetching: boolean;
    isVoting: boolean;
    hasVoted: boolean;
    txStatus: TxStatus;
    txHash: string | null;
    txError: string | null;
}

export function usePoll(
    publicKey: string | null,
    kit: { signTransaction: (xdr: string, opts: { networkPassphrase: string }) => Promise<{ signedTxXdr: string }> } | null
) {
    const [state, setState] = useState<PollState>({
        yesVotes: 0,
        noVotes: 0,
        isFetching: false,
        isVoting: false,
        hasVoted: false,
        txStatus: "idle",
        txHash: null,
        txError: null,
    });

    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // ─── Load results (cache first, then contract) ────────────────
    const loadResults = useCallback(async () => {
        // Load from cache immediately
        const cached = getCachedResults();
        if (cached) {
            setState((s) => ({ ...s, yesVotes: cached.yes, noVotes: cached.no }));
        }

        setState((s) => ({ ...s, isFetching: true }));
        try {
            const { yes, no } = await fetchResults();
            setCachedResults(yes, no);
            setState((s) => ({ ...s, yesVotes: yes, noVotes: no, isFetching: false }));
        } catch {
            setState((s) => ({ ...s, isFetching: false }));
        }
    }, []);

    // ─── On wallet connect — load voted state and results ─────────
    useEffect(() => {
        if (publicKey) {
            const voted = getCachedHasVoted(publicKey);
            setState((s) => ({ ...s, hasVoted: voted }));
            loadResults();

            // Start polling for real-time updates every 10 seconds
            pollRef.current = setInterval(() => {
                fetchResults()
                    .then(({ yes, no }) => {
                        setCachedResults(yes, no);
                        setState((s) => ({ ...s, yesVotes: yes, noVotes: no }));
                    })
                    .catch(() => {/* silent */ });
            }, 10_000);
        } else {
            // Disconnected — stop polling
            if (pollRef.current) {
                clearInterval(pollRef.current);
                pollRef.current = null;
            }
            setState((s) => ({
                ...s,
                hasVoted: false,
                txStatus: "idle",
                txHash: null,
                txError: null,
            }));
        }

        return () => {
            if (pollRef.current) clearInterval(pollRef.current);
        };
    }, [publicKey, loadResults]);

    // ─── Initial load without wallet ─────────────────────────────
    useEffect(() => {
        const cached = getCachedResults();
        if (cached) {
            setState((s) => ({ ...s, yesVotes: cached.yes, noVotes: cached.no }));
        }
        fetchResults()
            .then(({ yes, no }) => {
                setCachedResults(yes, no);
                setState((s) => ({ ...s, yesVotes: yes, noVotes: no }));
            })
            .catch(() => {/* silent */ });
    }, []);

    // ─── Vote handler ─────────────────────────────────────────────
    const vote = useCallback(
        async (choice: boolean) => {
            if (!publicKey || !kit) return;

            setState((s) => ({
                ...s,
                isVoting: true,
                txStatus: "pending",
                txHash: null,
                txError: null,
            }));

            try {
                const hash = await submitVote(
                    publicKey,
                    kit.signTransaction.bind(kit),
                    choice
                );

                // Optimistic UI update
                setState((s) => {
                    const newYes = choice ? s.yesVotes + 1 : s.yesVotes;
                    const newNo = !choice ? s.noVotes + 1 : s.noVotes;

                    // Set the demo results so fetchResults doesn't override with zeros
                    try {
                        localStorage.setItem("livepoll_demo_results", JSON.stringify({ yes: newYes, no: newNo }));
                    } catch { /* silent */ }

                    return {
                        ...s,
                        isVoting: false,
                        hasVoted: true,
                        txStatus: "success",
                        txHash: hash,
                        yesVotes: newYes,
                        noVotes: newNo,
                    };
                });

                setCachedHasVoted(publicKey);

                // Sync with contract after 3 seconds
                setTimeout(async () => {
                    try {
                        const { yes, no } = await fetchResults();
                        setCachedResults(yes, no);
                        setState((s) => ({ ...s, yesVotes: yes, noVotes: no }));
                    } catch { /* silent */ }
                }, 3000);
            } catch (err: unknown) {
                let message = "Transaction failed";
                if (err instanceof Error) {
                    const errStr = err.message;
                    if (errStr.includes("Already voted") || errStr.includes("UnreachableCodeReached") || errStr.includes("InvalidAction")) {
                        message = "You have already voted!";
                    } else if (errStr.includes("Contract not deployed")) {
                        message = errStr;
                    } else if (errStr.includes("denied") || errStr.includes("User declined")) {
                        message = "Transaction rejected by user.";
                    } else {
                        message = errStr;
                    }
                }
                setState((s) => ({
                    ...s,
                    isVoting: false,
                    txStatus: "failed",
                    txError: message,
                }));
            }
        },
        [publicKey, kit]
    );

    const resetTxStatus = useCallback(() => {
        setState((s) => ({ ...s, txStatus: "idle", txHash: null, txError: null }));
    }, []);

    return { ...state, vote, loadResults, resetTxStatus };
}
