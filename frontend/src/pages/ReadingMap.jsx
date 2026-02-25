import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import WorldMap from '../components/WorldMap';

const ReadingMap = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [user, setUser] = useState(null);
    const [currentLevel, setCurrentLevel] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { navigate('/login'); return; }
            setUser(user);

            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('current_level, dyslexia_risk_score')
                    .eq('id', user.id)
                    .single();

                if (data) {
                    // Force Screening if risk score is missing (new user)
                    if (data.dyslexia_risk_score === null || data.dyslexia_risk_score === undefined) {
                        // Optional: Add a toast/alert here if your app has a toast system
                        // alert("Please complete the screening test first!"); 
                        navigate('/screening');
                        return;
                    }
                    setCurrentLevel(data.current_level || 1);
                }
            } catch (e) {
                console.error("Error fetching progress:", e);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [navigate, searchParams]);

    const handleLevelSelect = (level) => {
        navigate(`/reading-practice?level=${level}`);
    };

    if (loading) return (
        <div className="min-h-screen bg-sky-200 flex items-center justify-center">
            <div className="animate-spin text-6xl">🌍</div>
        </div>
    );

    return (
        <div className="min-h-screen relative overflow-x-hidden font-dyslexic">
            {/* SOLID WORLD MAP BACKGROUND - NO TRANSPARENCY */}
            <div className="fixed inset-0 bg-gradient-to-br from-sky-300 via-blue-200 to-cyan-200 z-0">

                {/* Sky with clouds */}
                <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-blue-100/40 to-transparent"></div>

                {/* Ocean waves - layered SVG */}
                <div className="absolute bottom-0 left-0 w-full h-2/5">
                    <svg className="w-full h-full" viewBox="0 0 1440 400" preserveAspectRatio="none">
                        {/* Deep ocean */}
                        <path d="M0,180 Q360,140 720,160 T1440,180 L1440,400 L0,400 Z" fill="#3b82f6" opacity="0.5" />
                        {/* Mid ocean */}
                        <path d="M0,240 Q300,200 600,220 Q900,240 1200,210 Q1350,195 1440,220 L1440,400 L0,400 Z" fill="#60a5fa" opacity="0.6" />
                        {/* Surface waves */}
                        <path d="M0,300 Q180,270 360,290 Q540,310 720,280 Q900,250 1080,280 Q1260,310 1440,290 L1440,400 L0,400 Z" fill="#93c5fd" opacity="0.7" />
                    </svg>
                </div>

                {/* Floating clouds - scattered */}
                <div className="absolute top-8 left-[8%] text-7xl opacity-35 animate-float" style={{ animationDelay: '0s' }}>☁️</div>
                <div className="absolute top-16 right-[12%] text-8xl opacity-30 animate-float" style={{ animationDelay: '2s' }}>☁️</div>
                <div className="absolute top-24 left-[45%] text-6xl opacity-25 animate-float" style={{ animationDelay: '4s' }}>☁️</div>
                <div className="absolute top-12 right-[60%] text-7xl opacity-28 animate-float" style={{ animationDelay: '3s' }}>☁️</div>

                {/* Ocean decorations - scattered across */}
                <div className="absolute top-[35%] left-[5%] text-5xl opacity-40 animate-float" style={{ animationDelay: '1s' }}>⛵</div>
                <div className="absolute top-[40%] right-[8%] text-6xl opacity-45 animate-float" style={{ animationDelay: '2.5s' }}>🏝️</div>
                <div className="absolute bottom-[35%] left-[70%] text-4xl opacity-35">🐚</div>
                <div className="absolute bottom-[30%] right-[75%] text-5xl opacity-38 animate-float" style={{ animationDelay: '3.5s' }}>🌴</div>
                <div className="absolute top-[50%] left-[35%] text-3xl opacity-40">⚓</div>
                <div className="absolute bottom-[40%] right-[40%] text-4xl opacity-42 animate-float" style={{ animationDelay: '1.5s' }}>🐠</div>
            </div>

            <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 p-4 shadow-sm">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <button onClick={() => navigate('/dashboard')} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2">
                        🏠 <span className="hidden md:inline">Dashboard</span>
                    </button>

                    <div className="flex items-center gap-3 bg-brand-primary/10 px-6 py-2 rounded-full border border-brand-primary/20">
                        <span className="text-2xl">🗺️</span>
                        <span className="text-brand-primary font-bold tracking-wide text-sm md:text-base">LEVEL {currentLevel}</span>
                    </div>

                    <div className="w-20"></div>
                </div>
            </header>

            <main className="relative z-10 pt-16 pb-12 px-4">
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-5xl font-bold text-slate-800 drop-shadow-sm mb-2 tracking-tight">Your Learning Journey</h1>
                    <p className="text-slate-600 font-medium text-lg">Progress through levels to build your reading skills</p>
                </div>

                <WorldMap currentLevel={currentLevel} onLevelSelect={handleLevelSelect} />
            </main>
        </div>
    );
};

export default ReadingMap;
