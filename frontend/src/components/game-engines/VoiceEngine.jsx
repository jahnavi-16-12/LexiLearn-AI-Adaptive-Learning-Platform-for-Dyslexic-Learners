import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const VoiceEngine = ({ data, onCorrect, onWrong, currentLevel }) => {
    const { levels } = data;
    const level = levels[currentLevel - 1] || levels[0];
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');

    React.useEffect(() => {
        setTranscript('');
    }, [currentLevel]);

    const startListening = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Speech recognition is not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (event) => {
            const speechResult = event.results[0][0].transcript.toLowerCase();
            setTranscript(speechResult);

            const target = (level.target || level.word || level.sound || "").toLowerCase();
            if (speechResult.includes(target)) {
                onCorrect();
            } else {
                onWrong();
            }
        };

        recognition.start();
    };

    return (
        <div className="w-full flex flex-col items-center">
            {/* Professional Question Header */}
            <div className="bg-white/50 border-4 border-dashed border-slate-200 p-10 rounded-[50px] mb-12 w-full max-w-2xl text-center shadow-inner">
                <div className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Target Sound</div>
                <h2 className="text-7xl font-black text-slate-800 tracking-tight uppercase">
                    {level.sound || level.word || level.blend}
                </h2>
            </div>

            <div className="relative mb-16">
                <motion.div
                    animate={isListening ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className={`w-48 h-48 rounded-[40px] flex items-center justify-center text-6xl shadow-2xl border-8 border-white ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-brand-primary text-white'}`}
                >
                    {isListening ? '🛑' : '🎤'}
                </motion.div>

                {/* Sonic Waves Effect */}
                {isListening && [...Array(3)].map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                        transition={{ repeat: Infinity, duration: 2, delay: i * 0.6 }}
                        className="absolute inset-0 rounded-[40px] border-4 border-red-500 z-[-1]"
                    />
                ))}
            </div>

            <button
                onClick={startListening}
                disabled={isListening}
                className="bg-slate-800 text-white px-12 py-5 rounded-[30px] text-xl font-black shadow-xl hover:bg-slate-900 hover:scale-105 active:scale-95 transition-all mb-8"
            >
                {isListening ? 'LISTENING...' : 'TAP TO RECORD'}
            </button>

            <div className="text-center h-20">
                <AnimatePresence>
                    {!isListening && !transcript && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-slate-400 font-bold uppercase tracking-widest text-xs"
                        >
                            Speak clearly into the microphone
                        </motion.p>
                    )}
                    {transcript && (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-brand-primary/5 px-6 py-3 rounded-2xl border-2 border-brand-primary/10"
                        >
                            <span className="text-xs font-black text-brand-primary uppercase tracking-widest block mb-1">I heard:</span>
                            <span className="text-3xl font-black text-slate-800 italic">"{transcript}"</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default VoiceEngine;
