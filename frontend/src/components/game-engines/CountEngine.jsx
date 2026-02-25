import React, { useState } from 'react';
import { motion } from 'framer-motion';

const CountEngine = ({ data, onCorrect, onWrong, currentLevel }) => {
    const { levels } = data;
    const [claps, setClaps] = useState(0);
    const level = levels[currentLevel - 1] || levels[0];

    React.useEffect(() => {
        setClaps(0);
    }, [currentLevel]);

    const handleSubmit = () => {
        if (claps === level.count) {
            onCorrect();
        } else {
            onWrong();
            setClaps(0);
        }
    };

    const speakWord = () => {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(level.word);
        utterance.rate = 0.7;
        window.speechSynthesis.speak(utterance);
    };

    // Synthesized clap sound
    const playClap = () => {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(800, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.5, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.1);
        } catch (e) { }
    };

    return (
        <div className="w-full flex flex-col items-center p-4">
            <div className="text-center mb-12">
                <h2 className="text-6xl font-black text-slate-800 mb-4 tracking-tight">
                    {level.word}
                </h2>
                <div className="inline-block px-6 py-2 bg-purple-50 rounded-full border-2 border-purple-100">
                    <p className="text-purple-600 font-black uppercase tracking-widest text-sm">
                        Clap for each syllable!
                    </p>
                </div>
            </div>

            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={speakWord}
                className="mb-16 w-24 h-24 bg-white rounded-[30px] flex items-center justify-center text-4xl shadow-xl border-4 border-slate-100 hover:border-brand-primary transition-all"
            >
                🔊
            </motion.button>

            {/* Visual Clap Tracker */}
            <div className="flex gap-4 mb-20">
                {[...Array(Math.max(claps, level.count))].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`w-16 h-16 rounded-3xl border-8 transition-all ${i < claps ? 'bg-brand-primary border-brand-primary shadow-[0_0_20px_rgba(59,130,246,0.3)]' : 'bg-white border-slate-100 shadow-inner'}`}
                    >
                        {i < claps && (
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1.5 }}
                                className="flex items-center justify-center h-full text-white text-2xl"
                            >
                                ✨
                            </motion.span>
                        )}
                    </motion.div>
                ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-6 w-full max-w-xl">
                <button
                    onClick={() => {
                        setClaps(claps + 1);
                        playClap();
                    }}
                    className="flex-1 bg-white border-4 border-slate-100 p-10 rounded-[40px] text-5xl shadow-lg hover:border-brand-primary hover:shadow-2xl transition-all flex flex-col items-center gap-4 group"
                >
                    <span className="group-active:scale-125 transition-transform">👏</span>
                    <span className="text-sm font-black text-slate-400 uppercase tracking-widest">TAP CLAP</span>
                </button>

                <button
                    onClick={handleSubmit}
                    className="flex-1 bg-brand-primary text-white p-10 rounded-[40px] text-3xl font-black shadow-[0_10px_0_rgb(29,78,216)] hover:translate-y-[5px] hover:shadow-[0_5px_0_rgb(29,78,216)] active:translate-y-[10px] active:shadow-none transition-all"
                >
                    CHECK!
                </button>
            </div>

            <button
                onClick={() => setClaps(0)}
                className="mt-12 text-slate-400 font-bold hover:text-red-500 transition-colors uppercase tracking-widest text-xs"
            >
                Reset Claps
            </button>
        </div>
    );
};

export default CountEngine;
