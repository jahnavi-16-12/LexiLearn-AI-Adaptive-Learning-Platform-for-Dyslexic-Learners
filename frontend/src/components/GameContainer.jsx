import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import Avatar from './Avatar';
import BadgeSystem from './BadgeSystem';

const GameContainer = ({
    gameId,
    title,
    instructions,
    children,
    onRestart,
    score,
    totalLevels,
    currentLevel,
    isFinished,
    gameState, // 'playing', 'won', 'lost'
    time = 0,
    category = "Phoneme Awareness",
    stars = 0
}) => {
    const navigate = useNavigate();
    const [showInstructions, setShowInstructions] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        getUser();

        if (instructions) {
            speak(instructions);
        }
    }, [instructions]);

    const speak = useCallback((text) => {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        window.speechSynthesis.speak(utterance);
    }, []);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const calculateStars = () => {
        return stars;
    };

    const handleBack = () => {
        window.speechSynthesis.cancel();
        navigate('/games');
    };

    if (gameState === 'won' || gameState === 'lost') {
        const stars = calculateStars();
        return (
            <div className="min-h-screen flex items-center justify-center p-6 transition-colors duration-500" style={{ backgroundColor: 'var(--background)' }}>
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-[var(--card-bg)] p-12 rounded-[60px] shadow-2xl text-center max-w-lg w-full border-8 border-white relative overflow-hidden"
                >
                    {/* Background Decorative Element */}
                    <div className={`absolute top-0 left-0 w-full h-32 ${gameState === 'won' ? 'bg-green-400' : 'bg-red-400'} opacity-10 -skew-y-6 -translate-y-12`}></div>

                    <div className="text-8xl mb-6 relative z-10 animate-pop">
                        {gameState === 'won' ? '🏆' : '💪'}
                    </div>

                    <h2 className={`text-6xl font-black mb-2 relative z-10 ${gameState === 'won' ? 'text-green-600' : 'text-red-500'}`}>
                        {gameState === 'won' ? 'GAME WIN!' : 'GAME OVER'}
                    </h2>

                    <p className="text-2xl font-bold text-[var(--foreground)] opacity-60 mb-8 relative z-10 italic">
                        {gameState === 'won' ? "You're a superstar!" : "Don't give up, try again!"}
                    </p>

                    <div className="flex justify-center gap-4 mb-8">
                        {[1, 2, 3].map((s) => (
                            <motion.span
                                key={s}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: s * 0.2 }}
                                className={`text-6xl ${s <= (gameState === 'won' ? stars : 1) ? 'text-yellow-400' : 'text-slate-200'}`}
                            >
                                ⭐
                            </motion.span>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-10">
                        <div className="bg-[var(--background)]/50 rounded-3xl p-4 border-2 border-white/50 text-center">
                            <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Time</div>
                            <div className="text-2xl font-black text-[var(--foreground)]">{formatTime(time)}</div>
                        </div>
                        <div className="bg-[var(--background)]/50 rounded-3xl p-4 border-2 border-white/50 text-center">
                            <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Score</div>
                            <div className="text-2xl font-black text-[var(--foreground)]">{score}</div>
                        </div>
                    </div>

                    <BadgeSystem category={category} isWon={gameState === 'won'} />

                    <div className="flex flex-col gap-4 mt-8">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleBack}
                            className="w-full bg-slate-800 text-white py-5 rounded-[30px] text-2xl font-black shadow-xl hover:bg-slate-900 transition-all"
                        >
                            Return to Arcade
                        </motion.button>
                        <button
                            onClick={onRestart}
                            className="w-full bg-[var(--background)] text-slate-600 py-5 rounded-[30px] text-xl font-black hover:opacity-80 transition-opacity"
                        >
                            Try Again
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative overflow-x-hidden selection:bg-brand-primary/20 transition-colors duration-500" style={{ backgroundColor: 'var(--background)' }}>
            {/* Themed Playfield Background */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-transparent to-accent/5 opacity-40"></div>

                {/* Abstract Animated Shapes */}
                <div className="absolute top-[15%] left-[5%] text-6xl opacity-20 animate-float">☁️</div>
                <div className="absolute top-[30%] right-[12%] text-5xl opacity-15 animate-float" style={{ animationDelay: '2s' }}>⛵</div>
                <div className="absolute bottom-[20%] left-[10%] text-6xl opacity-20 animate-float" style={{ animationDelay: '1s' }}>🎈</div>

                {/* Visual Depth Orbs */}
                <div className="absolute top-20 left-[10%] w-64 h-64 bg-brand-primary/10 rounded-full blur-[100px] opacity-20 animate-pulse-glow"></div>
                <div className="absolute bottom-20 right-[10%] w-80 h-80 bg-accent/10 rounded-full blur-[120px] opacity-25 animate-pulse-glow" style={{ animationDelay: '1s' }}></div>

                {/* Decorative Pattern Layer */}
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(var(--foreground) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

                {/* Ground Gradient */}
                <div className="absolute bottom-0 left-0 w-full h-1/4 bg-gradient-to-t from-white/30 to-transparent opacity-40"></div>
            </div>

            {/* Professional EdTech Header - Theme Aware */}
            <header className="bg-[var(--card-bg)]/90 backdrop-blur-md border-b-4 border-white/50 px-8 py-4 sticky top-0 z-50 shadow-sm transition-colors duration-500">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: -5 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleBack}
                            className="w-12 h-12 bg-white/50 rounded-2xl flex items-center justify-center text-2xl hover:bg-brand-primary hover:text-white transition-all shadow-sm border border-white/20"
                        >
                            ←
                        </motion.button>
                        <div>
                            <h1 className="text-2xl font-black text-[var(--foreground)] tracking-tight leading-tight">{title}</h1>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{category}</span>
                                <div className="w-32 h-2.5 bg-white/50 rounded-full overflow-hidden p-0.5 border border-white/20">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(currentLevel / totalLevels) * 100}%` }}
                                        className="h-full bg-gradient-to-r from-brand-primary to-blue-400 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex flex-col items-end">
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Clock</div>
                            <div className="text-xl font-black text-[var(--foreground)] opacity-80 font-mono">{formatTime(time)}</div>
                        </div>
                        <motion.div
                            whileHover={{ scale: 1.05, rotate: 2 }}
                            className="bg-amber-100 px-6 py-2.5 rounded-2xl border-2 border-amber-200 flex items-center gap-3 shadow-md"
                        >
                            <span className="text-2xl animate-bounce-slow">⭐</span>
                            <span className="font-black text-amber-800 text-xl">{score}</span>
                        </motion.div>
                        <Avatar variant={user?.id || 'guest'} size="sm" className="hidden sm:flex border-2 border-brand-primary/20 shadow-sm" />
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col items-center">
                <main className="w-full relative min-h-[60vh] flex items-center justify-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full max-w-4xl bg-[var(--card-bg)]/80 backdrop-blur-xl rounded-[60px] p-8 md:p-12 border-4 border-white shadow-[0_30px_60px_-20px_rgba(0,0,0,0.08)] relative z-10 transition-all duration-500 overflow-hidden"
                    >
                        {/* Interactive Background Glow for Content Area */}
                        <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-primary/10 rounded-full blur-[100px] pointer-events-none animate-pulse-glow"></div>
                        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-accent/10 rounded-full blur-[100px] pointer-events-none animate-pulse-glow" style={{ animationDelay: '1.5s' }}></div>

                        {/* Speaker Hint - Refined Style */}
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => speak(instructions)}
                            className="absolute top-6 right-6 w-14 h-14 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-white flex items-center justify-center text-2xl hover:border-brand-primary hover:text-brand-primary transition-all z-20 group"
                            title="Hear Instructions"
                        >
                            <span className="group-hover:animate-pulse">🔊</span>
                            <div className="absolute inset-0 rounded-2xl border-2 border-brand-primary/0 group-hover:border-brand-primary/20 animate-ping"></div>
                        </motion.button>

                        <div className="w-full relative z-10">
                            {children}
                        </div>
                    </motion.div>
                </main>
            </div>

            {/* Instruction Overlay */}
            <AnimatePresence>
                {showInstructions && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ y: 50, scale: 0.95, opacity: 0 }}
                            animate={{ y: 0, scale: 1, opacity: 1 }}
                            className="bg-[var(--card-bg)] rounded-[60px] p-12 max-w-2xl w-full text-center shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)] border-8 border-white relative"
                        >
                            <div className="absolute -top-16 left-1/2 -translate-x-1/2">
                                <div className="relative">
                                    <Avatar variant="lexi" size="xl" className="border-8 border-white shadow-2xl" />
                                    <div className="absolute -bottom-2 -right-2 bg-green-500 w-10 h-10 rounded-full border-4 border-white flex items-center justify-center text-white text-xl animate-bounce-slow shadow-lg">👋</div>
                                </div>
                            </div>

                            <h2 className="text-3xl font-black text-[var(--foreground)] mt-8 mb-6 tracking-tight">Let's Play!</h2>
                            <div className="relative group">
                                <p className="text-xl text-[var(--foreground)] opacity-80 mb-10 leading-relaxed font-bold bg-[var(--background)]/50 p-6 rounded-[30px] border-2 border-dashed border-white/40 transition-colors group-hover:border-brand-primary/20">
                                    {instructions}
                                </p>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                    setShowInstructions(false);
                                    window.speechSynthesis.cancel();
                                }}
                                className="w-full bg-brand-primary text-white py-5 rounded-[25px] text-2xl font-black shadow-[0_8px_0_rgb(29,78,216)] active:translate-y-[4px] active:shadow-[0_4px_0_rgb(29,78,216)] transition-all flex items-center justify-center gap-4"
                            >
                                I'M READY! 🚀
                            </motion.button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default GameContainer;
