import React from "react";
import { TxStatus } from "../hooks/usePoll";
import { getTxLink } from "../utils/stellarUtils";
import { LoadingSpinner } from "./LoadingSpinner";

interface TransactionStatusProps {
    status: TxStatus;
    hash: string | null;
    error: string | null;
    onDismiss: () => void;
}

export const TransactionStatus: React.FC<TransactionStatusProps> = ({
    status,
    hash,
    error,
    onDismiss,
}) => {
    if (status === "idle") return null;

    return (
        <div className="fixed bottom-6 right-6 z-40 max-w-sm w-full animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div className="bg-zinc-900 border border-zinc-700/50 p-4 rounded-xl shadow-2xl flex items-start space-x-4">
                <div className="mt-0.5">
                    {status === "pending" && (
                        <div className="text-amber-500">
                            <LoadingSpinner size="md" color="currentColor" />
                        </div>
                    )}
                    {status === "success" && (
                        <div className="text-emerald-500 bg-emerald-500/10 rounded-full p-1">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    )}
                    {status === "failed" && (
                        <div className="text-rose-500 bg-rose-500/10 rounded-full p-1">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white mb-1">
                        {status === "pending" && "Submitting vote..."}
                        {status === "success" && "Vote submitted!"}
                        {status === "failed" && "Transaction failed"}
                    </p>

                    {status === "pending" && (
                        <p className="text-xs text-zinc-400">Waiting for blockchain confirmation...</p>
                    )}

                    {status === "success" && hash && (
                        <a
                            href={getTxLink(hash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-brand-orange hover:text-brand-orange-dark transition-colors inline-flex items-center"
                        >
                            View on Stellar Expert
                            <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </a>
                    )}

                    {status === "failed" && error && (
                        <p className="text-xs text-rose-400 break-words">{error}</p>
                    )}
                </div>

                {(status === "success" || status === "failed") && (
                    <button
                        onClick={onDismiss}
                        className="text-zinc-500 hover:text-white transition-colors p-1"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
};
