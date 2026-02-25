import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const GridEngine = ({ data, onCorrect, onWrong, currentLevel }) => {
    const { levels, type } = data;
    const level = levels[currentLevel - 1] || levels[0];

    // For Matching/Memory
    const [flipped, setFlipped] = useState([]);
    const [solved, setSolved] = useState([]);
    const [cards, setCards] = useState([]);

    // For Treasure Hunt
    const [found, setFound] = useState([]);

    useEffect(() => {
        if (type === 'matching' || type === 'memory') {
            const allItems = level.pairs ? level.pairs.flat() : [...level.sounds, ...level.sounds];
            setCards(allItems.sort(() => Math.random() - 0.5).map((val, idx) => ({ id: idx, val })));
            setSolved([]);
            setFlipped([]);
        } else if (type === 'speed-find' || type === 'treasure-hunt') {
            setFound([]);
        }
    }, [currentLevel, level, type]);

    const handleCardClick = (card) => {
        if (flipped.length === 2 || flipped.includes(card.id) || solved.includes(card.id)) return;

        const newFlipped = [...flipped, card.id];
        setFlipped(newFlipped);

        if (newFlipped.length === 2) {
            const card1 = cards.find(c => c.id === newFlipped[0]);
            const card2 = cards.find(c => c.id === newFlipped[1]);

            let isMatch = false;
            if (level.pairs) {
                isMatch = level.pairs.some(p => p.includes(card1.val) && p.includes(card2.val));
            } else {
                isMatch = card1.val === card2.val;
            }

            if (isMatch) {
                setSolved([...solved, card1.id, card2.id]);
                setFlipped([]);
                onCorrect();
            } else {
                setFlipped([]);
                onWrong();
            }
        }
    };

    const handleTreasureClick = (item) => {
        if (found.includes(item)) return;

        if (level.answers.includes(item)) {
            const newFound = [...found, item];
            setFound(newFound);
            onCorrect();
        } else {
            onWrong();
        }
    };

    if (type === 'speed-find' || type === 'treasure-hunt') {
        const title = level.family ? `Find the /-${level.family}/ family!` : level.root ? `Rhymes with ${level.root}` : `Starts with /${level.sound || level.target}/`;
        return (
            <div className="w-full flex flex-col items-center">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-black text-slate-800 mb-4">{title}</h2>
                    <p className="text-brand-primary font-black uppercase tracking-widest text-sm italic">
                        Find {level.answers.length - found.length} more!
                    </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8 max-w-2xl px-4">
                    {level.targets.map((item, i) => (
                        <motion.button
                            key={`${item}-${i}`}
                            whileHover={{ scale: 1.1, rotate: 2 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleTreasureClick(item)}
                            className={`w-36 h-36 rounded-[40px] text-4xl font-black flex flex-col items-center justify-center shadow-xl border-4 transition-all duration-300 ${found.includes(item) ? 'bg-green-100 border-green-400 scale-95 opacity-50' : 'bg-white border-slate-100 hover:border-brand-primary'}`}
                        >
                            <span>{item}</span>
                            {found.includes(item) && <span className="text-xl mt-2">✅</span>}
                        </motion.button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col items-center p-4">
            <div className="text-center mb-12">
                <h2 className="text-4xl font-black text-slate-800 mb-2">Sound Memory</h2>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Find all the matching pairs</p>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-8 px-4">
                <AnimatePresence>
                    {cards.map((card) => {
                        const isFlipped = flipped.includes(card.id) || solved.includes(card.id);
                        return (
                            <motion.button
                                key={card.id}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleCardClick(card)}
                                className="w-28 h-36 rounded-3xl shadow-lg border-4 transition-all duration-500 relative cursor-pointer"
                                style={{ transformStyle: 'preserve-3d' }}
                                animate={{ rotateY: isFlipped ? 0 : 180 }}
                            >
                                {/* Front Face (The Value) */}
                                <div
                                    className={`absolute inset-0 w-full h-full flex items-center justify-center rounded-[20px] bg-white text-3xl font-black text-brand-primary border-4 border-brand-primary transition-opacity duration-300 ${isFlipped ? 'opacity-100' : 'opacity-0'}`}
                                    style={{ backfaceVisibility: 'hidden' }}
                                >
                                    {card.val}
                                </div>

                                {/* Back Face (The Question Mark) */}
                                <div
                                    className={`absolute inset-0 w-full h-full flex items-center justify-center rounded-[20px] bg-brand-primary text-5xl text-white font-black transition-opacity duration-300 ${isFlipped ? 'opacity-0' : 'opacity-100'}`}
                                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                                >
                                    ?
                                </div>
                            </motion.button>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default GridEngine;
