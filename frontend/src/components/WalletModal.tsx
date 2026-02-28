import React from "react";
import { FREIGHTER_ID, XBULL_ID } from "../hooks/useWallet";

interface WalletModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConnect: (walletId: string) => void;
    isConnecting: boolean;
    error: string | null;
}

export const WalletModal: React.FC<WalletModalProps> = ({
    isOpen,
    onClose,
    onConnect,
    isConnecting,
    error,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm shadow-xl shadow-black/50"
                role="dialog"
                aria-modal="true"
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-white">Connect Wallet</h2>
                    <button
                        onClick={onClose}
                        disabled={isConnecting}
                        className="text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <div className="space-y-3">
                    <button
                        onClick={() => onConnect(FREIGHTER_ID)}
                        disabled={isConnecting}
                        className="w-full flex items-center justify-between px-4 py-3 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors border border-zinc-700/50"
                    >
                        <span className="text-white font-medium">Freighter</span>
                        <img
                            src="https://stellar.org/favicon.ico"
                            alt="Freighter"
                            className="w-6 h-6 rounded-full bg-white p-0.5"
                        />
                    </button>

                    <button
                        onClick={() => onConnect(XBULL_ID)}
                        disabled={isConnecting}
                        className="w-full flex items-center justify-between px-4 py-3 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors border border-zinc-700/50"
                    >
                        <span className="text-white font-medium">xBull</span>
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            X
                        </div>
                    </button>
                </div>

                {isConnecting && (
                    <p className="mt-4 text-center text-sm text-zinc-400 animate-pulse">
                        Connecting to wallet...
                    </p>
                )}
            </div>
        </div>
    );
};
