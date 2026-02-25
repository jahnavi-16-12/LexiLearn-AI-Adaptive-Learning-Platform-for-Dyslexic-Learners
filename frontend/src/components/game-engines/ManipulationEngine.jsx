import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ManipulationEngine = ({ data, onCorrect, onWrong, currentLevel }) => {
    const { levels } = data;
    const level = levels[currentLevel - 1] || levels[0];

    const handleAnswer = (choice) => {
        if (choice === level.answer) {
            onCorrect();
        } else {
            onWrong();
        }
    };

    return (
        <div className="w-full flex flex-col items-center">
            {/* Professional Question Header */}
            <div className="bg-white/50 border-4 border-dashed border-slate-200 p-10 rounded-[50px] mb-12 w-full max-w-2xl text-center shadow-inner">
                <div className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Original Word</div>
                <h2 className="text-6xl font-black text-slate-800 mb-6 tracking-widest uppercase">
                    {level.word.replace('_', '?')}
                </h2>
                <div className="flex justify-center items-center gap-6 bg-white p-4 rounded-[30px] shadow-sm border-2 border-slate-50">
                    <span className="text-2xl font-bold text-slate-400 line-through">/{level.change}/</span>
                    <span className="text-4xl">➡️</span>
                    <span className="text-4xl font-black text-brand-primary">/{level.to}/</span>
                </div>
            </div>

            <p className="text-2xl font-bold text-slate-500 mb-12 italic">
                "What's the new word?"
            </p>

            <div className={`grid gap-10 w-full max-w-4xl ${level.options.length > 3 ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-1 md:grid-cols-3'}`}>
                {level.options.map((opt, i) => (
                    <motion.button
                        key={`${opt}-${i}`}
                        whileHover={{ scale: 1.05, rotate: i % 2 === 0 ? 1 : -1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAnswer(opt)}
                        className="bg-white border-4 border-slate-100 p-12 rounded-[40px] text-4xl font-black text-slate-800 shadow-lg hover:border-brand-primary hover:text-brand-primary transition-all uppercase tracking-wider min-h-[160px] flex items-center justify-center px-10"
                    >
                        {opt}
                    </motion.button>
                ))}
            </div>
        </div>
    );
};

export default ManipulationEngine;
