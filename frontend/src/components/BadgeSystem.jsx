import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { GAMES } from '../data/gameData';

const BADGES = {
    'Phoneme Master': { icon: '👂', color: 'bg-blue-100 text-blue-600', border: 'border-blue-200' },
    'Rhyme Ruler': { icon: '🎤', color: 'bg-green-100 text-green-600', border: 'border-green-200' },
    'Blending Wizard': { icon: '🧩', color: 'bg-purple-100 text-purple-600', border: 'border-purple-200' },
    'Syllable Star': { icon: '👏', color: 'bg-yellow-100 text-yellow-600', border: 'border-yellow-200' },
    'Fluency Flyer': { icon: '🚀', color: 'bg-orange-100 text-orange-600', border: 'border-orange-200' },
    'Sound Detective': { icon: '🔍', color: 'bg-slate-100 text-slate-600', border: 'border-slate-200' }
};

const BadgeSystem = ({ category, isWon }) => {
    const isCategoryComplete = useMemo(() => {
        if (!isWon) return false;

        const completed = JSON.parse(localStorage.getItem('lexilearn_completed_games') || '{}');
        const categoryGames = GAMES.filter(g => g.category === category);

        // If they just finished the last game, count it
        return categoryGames.every(g => completed[g.id]);
    }, [category, isWon]);

    const getBadgeName = () => {
        if (category === 'Phoneme Awareness') return 'Phoneme Master';
        if (category === 'Rhyming & Blending') return 'Rhyme Ruler';
        if (category === 'Syllable & Fluency') return 'Syllable Star';
        return 'Sound Detective';
    };

    const badgeName = getBadgeName();
    const badge = BADGES[badgeName];

    if (!isCategoryComplete) {
        if (!isWon) return null;

        // Show progress towards badge
        const completed = JSON.parse(localStorage.getItem('lexilearn_completed_games') || '{}');
        const categoryGames = GAMES.filter(g => g.category === category);
        const count = categoryGames.filter(g => completed[g.id]).length;

        if (count === 0) return null;

        return (
            <div className="mt-6 p-4 rounded-3xl bg-slate-50 border-2 border-slate-100 text-center">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Category Progress</div>
                <div className="flex items-center gap-2">
                    <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(count / categoryGames.length) * 100}%` }}
                            className="h-full bg-brand-primary"
                        />
                    </div>
                    <span className="text-xs font-bold text-slate-600">{count}/{categoryGames.length}</span>
                </div>
                <p className="text-xs font-bold text-slate-400 mt-2">Complete {categoryGames.length} games to earn the {badgeName} badge!</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            className={`mt-6 p-6 rounded-[40px] border-4 shadow-xl flex flex-col items-center gap-2 ${badge.color} ${badge.border} relative overflow-hidden`}
        >
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 bg-white/20 opacity-50 flex items-center justify-center text-[200px]"
            >
                ✨
            </motion.div>

            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-5xl shadow-lg relative z-10">
                {badge.icon}
            </div>
            <div className="text-center relative z-10">
                <div className="text-xs font-black uppercase tracking-widest opacity-80">Category Milestone!</div>
                <div className="text-2xl font-black italic">"{badgeName}" Badge</div>
            </div>
        </motion.div>
    );
};

export default BadgeSystem;
