import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const RhythmEngine = ({ data, onCorrect, onWrong, currentLevel }) => {
    const { levels, type } = data;
    const levelIdx = Math.max(0, currentLevel - 1);
    const level = levels[levelIdx] || levels[0];
    const [active, setActive] = useState(false);
    const [taps, setTaps] = useState(0);
    const [currentSound, setCurrentSound] = useState('?');
    const intervalRef = useRef(null);

    // Reset taps when level changes
    useEffect(() => {
        setTaps(0);
        setActive(false);
    }, [currentLevel]);

    // Audio Context for Drum/Clap sounds
    const playDrum = () => {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(150, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
            gain.gain.setValueAtTime(1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.1);
        } catch (e) {
            console.error("Audio error", e);
        }
    };

    const speak = (text) => {
        if (!text) return;
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.rate = 1.2;
        window.speechSynthesis.speak(u);
    };

    // Reaction Game logic (Phoneme Freeze)
    useEffect(() => {
        if (type === 'reaction' && level) {
            const startInterval = () => {
                if (intervalRef.current) clearInterval(intervalRef.current);
                intervalRef.current = setInterval(() => {
                    const pool = level.sounds || [];
                    if (pool.length === 0) return;

                    const nextSound = pool[Math.floor(Math.random() * pool.length)];
                    setCurrentSound(nextSound);
                    speak(nextSound);

                    if (nextSound === level.target) {
                        setActive(true);
                        // Give them 1.5 seconds to react
                        setTimeout(() => setActive(false), 1500);
                    } else {
                        setActive(false);
                    }
                }, 2500);
            };

            // Initial delay before starting
            const timeout = setTimeout(startInterval, 1000);
            return () => {
                clearTimeout(timeout);
                if (intervalRef.current) clearInterval(intervalRef.current);
            };
        }
    }, [currentLevel, type, level]);

    const handleTap = () => {
        if (type === 'reaction') {
            if (active) {
                onCorrect();
                setActive(false);
                if (intervalRef.current) clearInterval(intervalRef.current);
            } else {
                onWrong();
            }
        } else {
            // Rhythm Game (Syllable Symphony / Blend the Beat)
            playDrum();
            setTaps(prev => {
                const newTaps = prev + 1;
                const targetBeats = level.beats || level.rhythm?.length || 1;
                if (newTaps >= targetBeats) {
                    onCorrect();
                    return 0;
                }
                return newTaps;
            });
        }
    };

    if (!level) return null;

    return (
        <div className="w-full flex flex-col items-center">
            <div className="mb-12 text-center">
                <h2 className="text-4xl font-black text-slate-800 mb-2">
                    {type === 'reaction' ? `Listen for /${level.target?.toUpperCase()}/` : level.word}
                </h2>
                <p className="text-xl text-slate-500 font-bold uppercase tracking-widest">
                    {type === 'reaction' ? 'Tap FREEZE when you hear it!' : 'Drum the syllables!'}
                </p>
            </div>

            <div className="relative mb-16">
                <motion.div
                    animate={active ? {
                        scale: [1, 1.2, 1],
                        rotate: [0, 10, -10, 0],
                    } : {}}
                    transition={{ duration: 0.5 }}
                    className={`w-64 h-64 rounded-[60px] flex items-center justify-center text-8xl shadow-2xl transition-all border-8 ${active ? 'bg-blue-500 text-white border-blue-400' : 'bg-white text-slate-200 border-slate-100'}`}
                >
                    {type === 'reaction' ? (active ? '🧊' : currentSound.toUpperCase()) : '🥁'}
                </motion.div>

                {/* Visual Feedback for Rhythm */}
                {(type === 'drum-rhythm' || type === 'rhythm') && (
                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex gap-3">
                        {[...Array(level.beats || level.rhythm?.length || 0)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className={`w-6 h-6 rounded-full border-4 ${i < taps ? 'bg-brand-primary border-brand-primary' : 'bg-white border-slate-200'}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
                onMouseDown={handleTap}
                className={`px-16 py-8 rounded-[40px] shadow-[0_15px_0_rgb(203,213,225)] hover:shadow-[0_10px_0_rgb(203,213,225)] hover:translate-y-[5px] active:translate-y-[15px] active:shadow-none transition-all text-4xl font-black ${type === 'reaction' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-400'}`}
            >
                {type === 'reaction' ? (active ? 'FREEZE!' : 'Wait...') : 'TAP!'}
            </motion.button>
        </div>
    );
};

export default RhythmEngine;
