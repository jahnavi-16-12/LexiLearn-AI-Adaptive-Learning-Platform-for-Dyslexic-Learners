import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from '../components/Avatar';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

const Games = () => {
    const navigate = useNavigate();
    const [userStars, setUserStars] = useState(0);

    useEffect(() => {
        const fetchStars = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                console.log("Games: Fetching fresh stars for", user.email);
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('total_stars')
                    .eq('id', user.id)
                    .single();

                if (profile) {
                    console.log("Games: Stars found:", profile.total_stars);
                    setUserStars(profile.total_stars || 0);
                }
            }
        };
        fetchStars();
    }, []);

    const gameCategories = [
        {
            title: "Phoneme Awareness",
            emoji: "👂",
            color: "from-blue-500 to-blue-600",
            bg: "bg-blue-50",
            border: "border-blue-100",
            text: "text-blue-900",
            games: [
                { id: "sound-hunt", name: "I Spy Sound Hunt", desc: "Find objects starting with /b/!", unlocked: true },
                { id: "sound-detective", name: "Sound Detective", desc: "Guess the mystery sound.", unlocked: true },
                { id: "phoneme-clap", name: "Phoneme Clap", desc: "Clap for every sound you hear.", unlocked: true },
                { id: "sound-swap", name: "Sound Swap", desc: "Change 'Cat' to 'Hat'!", unlocked: true },
                { id: "robot-talk", name: "Robot Talk", desc: "Speak like a robot: C-A-T", unlocked: true },
                { id: "treasure-hunt", name: "Treasure Hunt", desc: "Find 5 things starting with /s/", unlocked: true },
                { id: "sound-lineup", name: "Sound Lineup", desc: "Order cards by first sound.", unlocked: true },
                { id: "missing-sound", name: "Missing Sound", desc: "What's missing in 'C_T'?", unlocked: true },
                { id: "sound-mirror", name: "Sound Mirror", desc: "Copy the sound exactly.", unlocked: true },
                { id: "phoneme-freeze", name: "Phoneme Freeze", desc: "Freeze on sound cue (/m/)", unlocked: true },
            ]
        },
        {
            title: "Rhyming & Blending",
            emoji: "🎤",
            color: "from-green-500 to-green-600",
            bg: "bg-green-50",
            border: "border-green-100",
            text: "text-green-900",
            games: [
                { id: "rhyme-dominoes", name: "Rhyme Dominoes", desc: "Match cat-hat, dog-log.", unlocked: true },
                { id: "sound-match", name: "Sound Match", desc: "Match sounds to win stars!", unlocked: true },
                { id: "word-builder", name: "Blend Builder", desc: "Combine sounds to make words.", unlocked: true },
                { id: "word-family-tree", name: "Word Family Tree", desc: "Grow the 'at' family tree.", unlocked: true },
                { id: "silly-rhymes", name: "Silly Rhymes", desc: "Make funny rhyming sentences.", unlocked: true },
                { id: "sound-hopscotch", name: "Sound Hopscotch", desc: "Jump on the right sounds.", unlocked: true },
                { id: "rhyme-relay", name: "Rhyme Relay", desc: "Race against the clock!", unlocked: true },
                { id: "blend-the-beat", name: "Blend the Beat", desc: "Clap to the rhythm.", unlocked: true },
                { id: "magic-door", name: "Magic Door", desc: "Say the password to enter.", unlocked: true },
                { id: "sound-chain", name: "Sound Chain", desc: "Ship -> Clip -> Flip!", unlocked: true },
            ]
        },
        {
            title: "Syllable & Fluency",
            emoji: "🚀",
            color: "from-purple-500 to-purple-600",
            bg: "bg-purple-50",
            border: "border-purple-100",
            text: "text-purple-900",
            games: [
                { id: "syllable-clap", name: "Syllable Clap", desc: "Clap parts of a word.", unlocked: true },
                { id: "syllable-sort", name: "Syllable Sort", desc: "Sort words by length.", unlocked: true },
                { id: "telephone-sounds", name: "Telephone Sounds", desc: "Whisper and pass it on.", unlocked: true },
                { id: "alliteration-alley", name: "Alliteration Alley", desc: "Sally sells seashells!", unlocked: true },
                { id: "pig-latin-challenge", name: "Pig Latin Challenge", desc: "Speak the secret code.", unlocked: true },
                { id: "memory-match-sounds", name: "Memory Match", desc: "Find the matching pairs.", unlocked: true },
                { id: "word-wheel", name: "Word Wheel", desc: "Spin and read fast!", unlocked: true },
                { id: "syllable-symphony", name: "Syllable Symphony", desc: "Drum the word beats.", unlocked: true },
                { id: "sound-scavenger", name: "Sound Scavenger", desc: "Find real world sounds.", unlocked: true },
                { id: "fluency-ladder", name: "Fluency Ladder", desc: "Climb by reading faster.", unlocked: true },
            ]
        }
    ];

    return (
        <div className="min-h-screen relative overflow-hidden pb-32 transition-colors duration-500" style={{ backgroundColor: 'var(--background)' }}>
            {/* Playful Arcade Background - Blends with global theme */}
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/10 via-transparent to-accent/10 opacity-60"></div>

                {/* Decorative Shapes (Animated) */}
                <div className="absolute top-[10%] left-[5%] text-6xl opacity-30 animate-float translate-y-10">✨</div>
                <div className="absolute top-[20%] right-[10%] text-7xl opacity-20 animate-float" style={{ animationDelay: '2s' }}>⭐</div>
                <div className="absolute bottom-[30%] left-[12%] text-5xl opacity-30 animate-float" style={{ animationDelay: '1s' }}>🎨</div>
                <div className="absolute bottom-[10%] right-[8%] text-6xl opacity-20 animate-float" style={{ animationDelay: '3s' }}>🧩</div>

                {/* Large Background Blur Orbs */}
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-brand-primary/5 rounded-full blur-[100px] pointer-events-none animate-pulse-glow" style={{ animationDuration: '4s' }}></div>
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] pointer-events-none animate-pulse-glow" style={{ animationDuration: '6s', animationDelay: '1s' }}></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10 px-4 pt-12">
                {/* Premium Arcade Header - Theme Aware */}
                <header className="flex flex-col md:flex-row justify-between items-center bg-[var(--card-bg)]/80 backdrop-blur-xl p-6 md:p-10 rounded-[40px] shadow-[0_15px_40px_rgba(0,0,0,0.03)] border-4 border-white mb-12 relative overflow-hidden group animate-fade-in shadow-xl">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-brand-primary/5 rounded-full blur-[50px] -translate-x-1/2 -translate-y-1/2" />

                    <div className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left">
                        <motion.button
                            whileHover={{ x: -4 }}
                            onClick={() => navigate('/dashboard')}
                            className="group/back text-slate-400 hover:text-brand-primary font-black flex items-center gap-2 transition mb-4 uppercase tracking-widest text-[10px]"
                        >
                            <span>←</span> Back to Dashboard
                        </motion.button>
                        <h1 className="text-4xl md:text-5xl font-black text-[var(--foreground)] mb-1 tracking-tight animate-pop">Fun Arcade 🎮</h1>
                        <p className="text-lg text-slate-500 font-bold max-w-xl italic opacity-80">
                            Play, earn, and learn. Let's find a mission!
                        </p>
                    </div>

                    <div className="mt-6 md:mt-0 relative z-10 animate-pop" style={{ animationDelay: '0.2s' }}>
                        <div className="bg-gradient-to-br from-yellow-400 to-amber-500 p-0.5 rounded-[22px] shadow-lg hover:rotate-3 transition-transform">
                            <div className="bg-white/95 px-6 py-3 rounded-[20px] flex items-center gap-3">
                                <span className="text-2xl drop-shadow-md animate-bounce-slow inline-block">⭐</span>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Collection</span>
                                    <span className="font-black text-slate-800 text-2xl leading-none">{userStars}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Categories - Themed Game Zone Container - Interactive Staggered Entry */}
                <div className="space-y-16 bg-white/20 backdrop-blur-sm rounded-[50px] p-6 md:p-12 border-2 border-white/50 shadow-inner mb-20">
                    {gameCategories.map((cat, i) => (
                        <div key={i} className="animate-slide-up" style={{ animationDelay: `${i * 0.2}s` }}>
                            <div className="flex items-center gap-5 mb-8 px-2 group">
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    className={`w-14 h-14 bg-gradient-to-br ${cat.color} rounded-[18px] flex items-center justify-center text-2xl text-white shadow-lg`}
                                >
                                    {cat.emoji}
                                </motion.div>
                                <div>
                                    <h2 className="text-2xl font-black text-[var(--foreground)] tracking-tight group-hover:text-brand-primary transition-colors">{cat.title}</h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="h-0.5 w-10 bg-brand-primary/20 rounded-full group-hover:w-20 transition-all duration-500"></div>
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Playground Mode Active</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {cat.games.map((game, j) => (
                                    <motion.div
                                        key={j}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: (i * 0.2) + (j * 0.1) }}
                                        whileHover={{ y: -10, scale: 1.02 }}
                                        onClick={() => game.unlocked ? navigate(`/games/${game.id}`) : null}
                                        className={`
                                            relative bg-[var(--card-bg)] rounded-[35px] p-6 border-b-6 transition-all duration-300 group overflow-hidden
                                            ${game.unlocked
                                                ? `border-slate-100 shadow-[0_10px_25px_rgba(0,0,0,0.03)] hover:shadow-[0_25px_50px_rgba(0,0,0,0.1)] cursor-pointer hover:border-brand-primary`
                                                : 'border-slate-100 opacity-60 grayscale cursor-not-allowed shadow-none'
                                            }
                                        `}
                                    >
                                        <div className={`w-12 h-12 rounded-[16px] mb-5 flex items-center justify-center text-2xl shadow-sm border-2 border-white/50
                                            ${game.unlocked ? cat.bg : 'bg-slate-50'}
                                        `}>
                                            <span className="group-hover:animate-bounce-slow">
                                                {j % 3 === 0 ? '🧩' : j % 3 === 1 ? '🎧' : '🎯'}
                                            </span>
                                        </div>

                                        <h3 className="text-lg font-black text-[var(--foreground)] mb-2 leading-tight group-hover:text-brand-primary transition-colors">{game.name}</h3>
                                        <p className="text-slate-500 font-bold text-[13px] mb-6 leading-relaxed opacity-70">{game.desc}</p>

                                        <div className="flex justify-between items-center mt-auto">
                                            {game.unlocked ? (
                                                <div className="flex flex-col gap-2 w-full">
                                                    <div className="h-1 w-full bg-slate-50 rounded-full overflow-hidden">
                                                        <div className={`h-full bg-gradient-to-r ${cat.color} w-1/3 animate-pulse`}></div>
                                                    </div>
                                                    <span className="bg-brand-primary text-white py-2.5 rounded-xl font-black text-[10px] shadow-md transition-all group-hover:shadow-brand-primary/30 flex items-center justify-center gap-2">
                                                        PLAY MISSION ➜
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 font-black text-[10px] flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl w-full justify-center">
                                                    🔒 LOCKED
                                                </span>
                                            )}
                                        </div>

                                        {/* Hover Glow Effect */}
                                        <div className="absolute inset-0 rounded-[35px] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500 shadow-[0_0_40px_rgba(59,130,246,0.1)] ring-2 ring-brand-primary/5 scale-105 -z-10"></div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Games;
