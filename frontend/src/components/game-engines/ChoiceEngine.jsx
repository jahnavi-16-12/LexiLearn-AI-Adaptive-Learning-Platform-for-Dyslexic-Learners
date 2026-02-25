import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ChoiceEngine = ({ data, onCorrect, onWrong, currentLevel }) => {
    const { levels } = data;
    const level = levels[currentLevel - 1] || levels[0];

    const [isSpeaking, setIsSpeaking] = useState(false);

    const handleAnswer = (choice) => {
        if (choice === level.answer) {
            onCorrect();
        } else {
            onWrong();
        }
    };

    const speak = (text) => {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.8;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
    };

    return (
        <div className="w-full flex flex-col items-center">
            {/* Themed Challenge Card - Refined & Theme Aware */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-[var(--card-bg)] p-6 md:p-10 rounded-[40px] mb-10 w-full max-w-2xl text-center shadow-[0_15px_30px_rgba(0,0,0,0.02)] border-2 border-white/50 relative group transition-colors duration-500"
            >
                <h2 className="text-2xl md:text-3xl font-black text-[var(--foreground)] tracking-tight leading-tight mb-8 px-4">
                    {level.prompt || data.instructions}
                </h2>

                {/* Visual/Audio Trigger - Playground Style */}
                <div className="flex justify-center relative">
                    {(level.sound || level.prompt?.includes('...')) && (
                        <div className="relative">
                            <motion.button
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => speak(level.sound || level.prompt)}
                                className={`w-20 h-20 rounded-[28px] text-4xl flex items-center justify-center shadow-lg transition-all relative z-10 
                                    ${isSpeaking
                                        ? 'bg-brand-primary text-white scale-110 shadow-brand-primary/30'
                                        : 'bg-[var(--background)] text-brand-primary border-2 border-white/40 hover:border-brand-primary/20 hover:bg-[var(--card-bg)]'
                                    }
                                `}
                            >
                                <span>🔊</span>
                            </motion.button>
                            {isSpeaking && (
                                <div className="absolute inset-0 rounded-[28px] border-4 border-brand-primary animate-ping z-0 scale-125"></div>
                            )}
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Options Grid - Individual Play Cards - Refined & Theme Aware */}
            <div className={`grid gap-6 w-full ${level.options.length > 3 ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-3'} max-w-4xl`}>
                {level.options.map((opt, i) => (
                    <motion.button
                        key={`${opt}-${i}`}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        whileHover={{ y: -8, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAnswer(opt)}
                        className="bg-[var(--card-bg)] border-2 border-white/40 p-5 md:p-8 rounded-[40px] shadow-[0_8px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:border-brand-primary/40 transition-all flex flex-col items-center justify-center min-h-[140px] group relative overflow-hidden"
                    >
                        {/* Option Content */}
                        <div className="text-4xl md:text-5xl group-hover:scale-110 transition-transform duration-300 flex items-center justify-center z-10 font-bold text-[var(--foreground)]">
                            {opt}
                        </div>

                        {/* Playful Label Overlay */}
                        <div className="absolute bottom-3 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                            <span className="text-[9px] font-black text-brand-primary uppercase tracking-[0.2em] bg-brand-primary/5 px-3 py-1 rounded-full border border-brand-primary/10">
                                CHOOSE ➜
                            </span>
                        </div>
                    </motion.button>
                ))}
            </div>

            <div className="mt-12 flex items-center gap-3 opacity-60">
                <div className="w-6 h-[1px] bg-[var(--foreground)]/20"></div>
                <p className="text-[var(--foreground)] font-bold uppercase tracking-[0.2em] text-[9px]">
                    Pick the best match!
                </p>
                <div className="w-6 h-[1px] bg-[var(--foreground)]/20"></div>
            </div>
        </div>
    );
};

export default ChoiceEngine;
