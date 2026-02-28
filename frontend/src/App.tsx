import { useState } from 'react';
import { useWallet } from './hooks/useWallet';
import { usePoll } from './hooks/usePoll';
import { WalletModal } from './components/WalletModal';
import { PollCard } from './components/PollCard';
import { TransactionStatus } from './components/TransactionStatus';

function App() {
    const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
    const { publicKey, isConnecting, error: walletError, kit, connectWallet, disconnectWallet } = useWallet();
    const { yesVotes, noVotes, isFetching, isVoting, hasVoted, txStatus, txHash, txError, vote, resetTxStatus } = usePoll(publicKey, kit);

    const handleConnect = async (walletId: string) => {
        await connectWallet(walletId);
        if (!walletError) {
            setIsWalletModalOpen(false);
        }
    };

    const truncateAddress = (address: string) =>
        `${address.slice(0, 4)}...${address.slice(-4)}`;

    return (
        <div className="min-h-screen bg-black text-white selection:bg-brand-orange/30 font-sans">
            {/* Navbar */}
            <nav className="border-b border-zinc-800/50 bg-black/50 backdrop-blur-md sticky top-0 z-40 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[100px] bg-brand-orange-glow blur-[120px] rounded-full pointer-events-none opacity-50"></div>

                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex justify-between h-20 items-center">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-brand-orange rounded-xl flex items-center justify-center font-bold text-xl shadow-[0_0_20px_rgba(249,115,22,0.4)]">
                                🟠
                            </div>
                            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
                                LivePoll
                            </span>
                        </div>

                        <div className="flex items-center">
                            {publicKey ? (
                                <div className="flex items-center space-x-4 bg-zinc-900 border border-zinc-800 rounded-full pl-4 pr-1 py-1">
                                    <span className="text-sm font-medium text-zinc-300">
                                        {truncateAddress(publicKey)}
                                    </span>
                                    <button
                                        onClick={disconnectWallet}
                                        className="bg-zinc-800 hover:bg-zinc-700 text-xs px-3 py-1.5 rounded-full transition-colors text-zinc-300"
                                    >
                                        Disconnect
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsWalletModalOpen(true)}
                                    className="bg-brand-orange hover:bg-brand-orange-dark text-white px-6 py-2.5 rounded-full font-medium transition-all shadow-[0_4px_14px_0_rgba(249,115,22,0.39)] hover:shadow-[0_6px_20px_rgba(249,115,22,0.23)] hover:-translate-y-0.5"
                                >
                                    Connect Wallet
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
                <div className="absolute top-40 left-0 w-72 h-72 bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none"></div>
                <div className="absolute bottom-0 right-0 w-72 h-72 bg-rose-500/10 blur-[120px] rounded-full pointer-events-none"></div>

                <div className="relative z-10">
                    <div className="text-center mb-16">
                        <span className="inline-block py-1 px-3 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-brand-orange text-sm font-semibold mb-6">
                            Soroban Smart Contract
                        </span>
                        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
                            Real-Time Consensus <br className="hidden md:block" />
                            <span className="text-zinc-500 text-4xl md:text-5xl">on Stellar Testnet</span>
                        </h1>
                        <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
                            Secure, instant voting powered by Rust and Soroban. Connect your Freighter or xBull wallet to participate in the live transparent poll.
                        </p>
                    </div>

                    <PollCard
                        yesVotes={yesVotes}
                        noVotes={noVotes}
                        isVoting={isVoting}
                        hasVoted={hasVoted}
                        onVote={vote}
                        connected={!!publicKey}
                        isFetching={isFetching}
                    />
                </div>
            </main>

            <WalletModal
                isOpen={isWalletModalOpen}
                onClose={() => setIsWalletModalOpen(false)}
                onConnect={handleConnect}
                isConnecting={isConnecting}
                error={walletError}
            />

            <TransactionStatus
                status={txStatus}
                hash={txHash}
                error={txError}
                onDismiss={resetTxStatus}
            />
        </div>
    );
}

export default App;
