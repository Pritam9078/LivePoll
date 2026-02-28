import React from "react";
import { LoadingSpinner } from "./LoadingSpinner";
import { CONTRACT_ID } from "../utils/stellarUtils";

interface PollCardProps {
    yesVotes: number;
    noVotes: number;
    isVoting: boolean;
    hasVoted: boolean;
    onVote: (choice: boolean) => void;
    connected: boolean;
    isFetching: boolean;
}

export const PollCard: React.FC<PollCardProps> = ({
    yesVotes,
    noVotes,
    isVoting,
    hasVoted,
    onVote,
    connected,
    isFetching,
}) => {
    const totalVotes = yesVotes + noVotes;
    const yesPercent = totalVotes > 0 ? Math.round((yesVotes / totalVotes) * 100) : 0;
    const noPercent = totalVotes > 0 ? Math.round((noVotes / totalVotes) * 100) : 0;

    return (
        <div className="w-full max-w-2xl mx-auto bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
            {/* Decorative gradients */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500"></div>
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-orange-glow blur-[100px] rounded-full pointer-events-none"></div>

            <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">
                            Should Stellar power the Web3 future?
                        </h2>
                        <a
                            href={`https://stellar.expert/explorer/testnet/contract/${CONTRACT_ID}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm text-zinc-400 hover:text-brand-orange transition-colors"
                        >
                            <span>View contract on Stellar Expert</span>
                            <svg className="w-4 h-4 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </a>
                    </div>
                    {isFetching && (
                        <div className="flex items-center text-zinc-500 text-sm whitespace-nowrap">
                            <LoadingSpinner size="sm" color="currentColor" />
                            <span className="ml-2">Live syncing...</span>
                        </div>
                    )}
                </div>

                {/* Results Graph */}
                <div className="space-y-6 mb-10">
                    {/* YES Bar */}
                    <div className="relative">
                        <div className="flex justify-between text-sm font-medium mb-2">
                            <span className="text-emerald-400">YES ({yesVotes} votes)</span>
                            <span className="text-zinc-400">{yesPercent}%</span>
                        </div>
                        <div className="w-full h-4 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-emerald-500 transition-all duration-1000 ease-out"
                                style={{ width: `${yesPercent}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* NO Bar */}
                    <div className="relative">
                        <div className="flex justify-between text-sm font-medium mb-2">
                            <span className="text-rose-400">NO ({noVotes} votes)</span>
                            <span className="text-zinc-400">{noPercent}%</span>
                        </div>
                        <div className="w-full h-4 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-rose-500 transition-all duration-1000 ease-out"
                                style={{ width: `${noPercent}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => onVote(true)}
                        disabled={!connected || isVoting || hasVoted}
                        className="group relative flex items-center justify-center w-full py-4 px-6 rounded-2xl bg-zinc-800 border border-emerald-500/30 text-emerald-400 font-semibold hover:bg-emerald-500/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isVoting ? (
                            <LoadingSpinner size="md" color="currentColor" />
                        ) : (
                            <span>Vote YES</span>
                        )}
                    </button>

                    <button
                        onClick={() => onVote(false)}
                        disabled={!connected || isVoting || hasVoted}
                        className="group relative flex items-center justify-center w-full py-4 px-6 rounded-2xl bg-zinc-800 border border-rose-500/30 text-rose-400 font-semibold hover:bg-rose-500/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isVoting ? (
                            <LoadingSpinner size="md" color="currentColor" />
                        ) : (
                            <span>Vote NO</span>
                        )}
                    </button>
                </div>

                {!connected && (
                    <p className="text-center text-zinc-500 text-sm mt-6">
                        Connect wallet to cast your vote
                    </p>
                )}
                {connected && hasVoted && !isVoting && (
                    <p className="text-center text-emerald-400 font-medium text-sm mt-6 flex items-center justify-center">
                        <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Vote recorded successfully
                    </p>
                )}
            </div>
        </div>
    );
};
