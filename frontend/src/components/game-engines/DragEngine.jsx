import React, { useState, useEffect } from 'react';
import { motion, Reorder } from 'framer-motion';

const DragEngine = ({ data, onCorrect, onWrong, currentLevel }) => {
    const { levels, type } = data;
    const level = levels[currentLevel - 1] || levels[0];
    const [items, setItems] = useState([]);

    const checkAnswer = (newOrder) => {
        setItems(newOrder);
        const target = normalize(level.word ? level.word.split('') : level.sequence);
        const current = normalize(newOrder);

        if (target.length === current.length && target.every((v, i) => v === current[i])) {
            onCorrect();
        }
    };

    const normalize = (arr) => (arr || []).map(i => (i || '').toString().trim().toUpperCase());

    useEffect(() => {
        if (level) {
            const toShuffle = level.letters || level.items || [];
            if (toShuffle.length > 0) {
                // Single pass shuffle
                let shuffled = [...toShuffle].sort(() => Math.random() - 0.5);
                setItems(shuffled);

                // Check if we got "lucky" (or unlucky) and it's already correct
                const target = normalize(level.word ? level.word.split('') : level.sequence);
                const current = normalize(shuffled);
                if (target.length === current.length && target.every((v, i) => v === current[i])) {
                    // If it's already correct, wait a moment and move on
                    setTimeout(() => onCorrect(), 1000);
                }
            }
        }
    }, [currentLevel, level]);

    if (!level) return <div className="p-20 text-center text-slate-400">Loading level...</div>;

    return (
        <div className="w-full flex flex-col items-center p-4">
            <div className="text-center mb-12">
                <h2 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">
                    {level.word ? 'Build the word!' : 'Put them in order!'}
                </h2>
                <div className="inline-block px-6 py-2 bg-brand-primary/10 rounded-full">
                    <p className="text-brand-primary font-black uppercase tracking-widest text-sm">
                        Drag and drop to rearrange
                    </p>
                </div>
            </div>

            {/* Visual slots for word building */}
            {level.word && (
                <div className="mb-12 flex flex-wrap justify-center gap-4 px-4">
                    {level.word.split('').map((_, i) => (
                        <div key={i} className="w-16 h-20 md:w-20 md:h-24 bg-white border-b-8 border-slate-200 rounded-2xl flex items-center justify-center text-4xl font-black text-slate-100 shadow-inner">
                            {" "}
                        </div>
                    ))}
                </div>
            )}

            <Reorder.Group
                axis="x"
                values={items}
                onReorder={checkAnswer}
                className="flex flex-nowrap overflow-x-auto overflow-y-hidden justify-start md:justify-center gap-10 p-16 bg-white/50 backdrop-blur-sm rounded-[60px] border-4 border-dashed border-brand-primary/20 shadow-xl w-full max-w-full no-scrollbar"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {items.map((item, idx) => (
                    <Reorder.Item
                        key={`${item}-${idx}-${currentLevel}`}
                        value={item}
                        whileDrag={{ scale: 1.1, rotate: 5, zIndex: 50 }}
                        className={`
                            min-w-[120px] w-auto h-28 px-10 bg-white border-4 border-slate-100 rounded-[35px] 
                            flex items-center justify-center font-black text-brand-primary 
                            shadow-[0_10px_0_rgb(241,245,249)] cursor-grab active:cursor-grabbing 
                            hover:border-brand-primary hover:text-brand-primary transition-all select-none
                            ${(item || '').toString().length > 8 ? 'text-2xl' : (item || '').toString().length > 5 ? 'text-3xl' : 'text-4xl'}
                        `}
                    >
                        {item}
                    </Reorder.Item>
                ))}
            </Reorder.Group>

            {/* Hint for sentence building or sequences */}
            {!level.word && (
                <div className="mt-12 flex items-center gap-4 text-slate-400 font-bold italic">
                    <span className="text-2xl">💡</span>
                    <span>Think about the first sounds...</span>
                </div>
            )}
        </div>
    );
};

export default DragEngine;
