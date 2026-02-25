import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import AccessibilityPanel from '../components/AccessibilityPanel';
import { motion } from 'framer-motion';

const StudentDashboard = () => {
    const navigate = useNavigate();
    const { user, profile } = useAuth();
    const [stats, setStats] = useState({
        level: 1,
        stars: 0,
        words_read: 0,
        recentActivity: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudentData = async () => {
            if (!user) return;
            try {
                // Fetch FRESH profile to get updated screening status
                const { data: freshProfile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                // Fetch stats
                const [recentLevelsRes, recentGamesRes] = await Promise.all([
                    supabase.from('level_completions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
                    supabase.from('game_scores').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5)
                ]);

                const combined = [
                    ...(recentLevelsRes.data || []).map(l => ({ icon: '⭐', text: `Reached Level ${l.level}`, time: new Date(l.created_at).toLocaleDateString(), bg: "bg-yellow-100", ts: new Date(l.created_at) })),
                    ...(recentGamesRes.data || []).map(g => ({ icon: '🎮', text: `Played ${g.game_id.split('-').join(' ')}`, time: new Date(g.created_at).toLocaleDateString(), bg: "bg-blue-100", ts: new Date(g.created_at) }))
                ].sort((a, b) => b.ts - a.ts).slice(0, 5);

                setStats({
                    level: freshProfile?.current_level || 1,
                    stars: freshProfile?.total_stars || 0,
                    words_read: freshProfile?.words_read || 0,
                    dyslexia_risk_score: freshProfile?.dyslexia_risk_score, // Store verification status
                    recentActivity: combined
                });
            } catch (err) {
                console.error("Student dashboard error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStudentData();
    }, [user]); // Removed profile from dep array to avoid loops, as we fetch it inside

    if (loading) return <div className="min-h-screen flex items-center justify-center font-black">Loading your adventure...</div>;

    return (
        <div className="min-h-screen pb-12 selection:bg-brand-primary/20">
            <nav className="sticky top-0 z-[60] backdrop-blur-md bg-brand-card/90 border-b border-brand-muted/20 px-6 md:px-8 py-3 flex justify-between items-center transition-all duration-300">
                <span onClick={() => navigate('/')} className="text-2xl font-black text-brand-primary tracking-tighter cursor-pointer flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <span className="bg-brand-primary text-white w-9 h-9 rounded-lg flex items-center justify-center text-lg shadow-sm">L</span>
                    LexiLearn
                </span>
                <div className="flex items-center gap-4 md:gap-6">
                    <div className="hidden lg:flex flex-col items-end mr-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Linking ID</span>
                        <code className="text-[11px] bg-slate-50 border border-slate-200 px-2 py-0.5 rounded font-mono text-slate-600 select-all cursor-copy" title="Click to select and copy">
                            {user?.id}
                        </code>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 bg-yellow-50 px-4 py-1.5 rounded-full border border-yellow-200 shadow-sm">
                        <span className="text-lg">⭐</span>
                        <span className="font-bold text-yellow-700 text-lg leading-none">{stats.stars}</span>
                    </div>
                    <button
                        onClick={() => supabase.auth.signOut()}
                        className="bg-brand-card hover:bg-red-50 text-brand-muted hover:text-red-500 px-4 py-2 rounded-xl font-bold text-sm transition-all border border-brand-muted/20 hover:border-red-100"
                    >
                        Log Out
                    </button>
                    <Avatar variant={profile?.avatar_variant || user?.id} gender={profile?.gender} size="sm" className="shadow-none border-2 border-slate-100" />
                </div>
            </nav>

            <main className="max-w-6xl mx-auto px-4 md:px-6 mt-8 animate-fade-in space-y-8">

                {/* 1. Compact Header Section */}
                <header className="bg-brand-card rounded-2xl p-6 md:p-8 shadow-sm border border-brand-muted/10 flex flex-col md:flex-row items-center justify-between gap-6 transition-colors duration-300">
                    <div className="flex items-center gap-6">
                        <Avatar variant={profile?.full_name || profile?.avatar_variant || user?.id} gender={profile?.gender} size="lg" className="border-4 border-brand-card shadow-md hidden md:block" />
                        <div className="text-center md:text-left">
                            <h1 className="text-3xl md:text-4xl font-black text-brand-text mb-2 tracking-tight">
                                Hey, {profile?.full_name?.split(' ')[0] || 'Explorer'}! 👋
                            </h1>
                            <div className="flex items-center justify-center md:justify-start gap-3 text-brand-muted font-medium">
                                <span className="px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-full text-xs font-black uppercase tracking-wider border border-brand-primary/20">
                                    Level {stats.level} Explorer
                                </span>
                                <span>•</span>
                                <span>Ready for adventure?</span>
                            </div>
                        </div>
                    </div>

                    {/* Compact Stats for Mobile (or extra encouragement) */}
                    <div className="flex gap-4 p-4 bg-brand-primary/5 rounded-2xl border border-brand-primary/10 md:min-w-[200px] justify-center">
                        <div className="text-center">
                            <div className="text-2xl font-black text-brand-text">{stats.stars}</div>
                            <div className="text-xs font-bold text-brand-muted uppercase tracking-wider">Total Stars</div>
                        </div>
                        <div className="w-px bg-brand-muted/20"></div>
                        <div className="text-center">
                            <div className="text-2xl font-black text-brand-primary">{stats.words_read}</div>
                            <div className="text-xs font-bold text-brand-muted uppercase tracking-wider">Words Read</div>
                        </div>
                    </div>
                </header>

                {/* 2. Feature Navigation Dock */}
                <nav className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {[
                        {
                            id: 'quest',
                            label: 'Reading Quest',
                            icon: '🗺️',
                            bg: 'bg-indigo-50 hover:bg-indigo-100',
                            text: 'text-indigo-700',
                            border: 'border-indigo-100',
                            desc: 'Your Adventure of Reading'
                        },
                        {
                            id: 'arcade',
                            label: 'Fun Arcade',
                            icon: '🎮',
                            bg: 'bg-blue-50 hover:bg-blue-100',
                            text: 'text-blue-700',
                            border: 'border-blue-100',
                            desc: 'Play Games to Earn Stars'
                        },
                        {
                            id: 'homework',
                            label: 'Homework Help',
                            icon: '📝',
                            bg: 'bg-purple-50 hover:bg-purple-100',
                            text: 'text-purple-700',
                            border: 'border-purple-100',
                            desc: 'Ask Lexi for Help'
                        },
                        {
                            id: 'screening',
                            label: 'Screening Test',
                            icon: '📋',
                            bg: 'bg-rose-50 hover:bg-rose-100',
                            text: 'text-rose-700',
                            border: 'border-rose-100',
                            desc: 'Find Your Dyslexia Risk'
                        }
                    ].map((item) => (
                        <motion.button
                            key={item.id}
                            whileHover={{ y: -4 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                                if (item.id === 'quest') {
                                    if (stats.dyslexia_risk_score === null || stats.dyslexia_risk_score === undefined) {
                                        alert("Please take the Screening Test first so we can find the perfect level for you! 🎯");
                                        navigate('/screening');
                                        return;
                                    }
                                    navigate('/reading-map');
                                } else if (item.id === 'arcade') {
                                    navigate('/games');
                                } else if (item.id === 'homework') {
                                    navigate('/homework-help');
                                } else if (item.id === 'screening') {
                                    navigate('/screening');
                                }
                            }}
                            className={`
                                flex flex-col items-center justify-center 
                                p-6 rounded-2xl 
                                border-2 ${item.border} 
                                ${item.bg} 
                                transition-all duration-300 
                                shadow-sm hover:shadow-md
                                group
                                w-full
                            `}
                        >
                            <div className="text-4xl mb-3 transform group-hover:scale-110 transition-transform duration-300">{item.icon}</div>
                            <span className={`font-black text-lg ${item.text} tracking-tight`}>{item.label}</span>
                            <span className={`text-xs font-bold uppercase tracking-widest mt-1 opacity-60 ${item.text}`}>{item.desc}</span>
                        </motion.button>
                    ))}
                </nav>

                {/* 3. Recent Triumphs (Full Width) */}
                <section className="bg-brand-card rounded-3xl p-8 border border-brand-muted/10 shadow-sm transition-colors duration-300">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-black text-brand-text flex items-center gap-3">
                            <span className="text-2xl">🏅</span>
                            Recent Triumphs
                        </h3>
                        {stats.recentActivity.length > 0 && (
                            <span className="text-xs font-bold text-brand-muted uppercase tracking-widest bg-brand-primary/5 px-3 py-1 rounded-full border border-brand-primary/10">
                                Last 5 Activities
                            </span>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {stats.recentActivity.map((activity, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-brand-primary/5 border border-brand-muted/10 hover:border-brand-muted/30 transition-colors">
                                <div className={`w-12 h-12 shrink-0 ${activity.bg} rounded-xl flex items-center justify-center text-xl shadow-sm`}>
                                    {activity.icon}
                                </div>
                                <div className="min-w-0">
                                    <div className="text-sm font-bold text-brand-text truncate">{activity.text}</div>
                                    <div className="text-[10px] font-bold text-brand-muted uppercase tracking-wide mt-1">{activity.time}</div>
                                </div>
                            </div>
                        ))}
                        {stats.recentActivity.length === 0 && (
                            <div className="col-span-full py-12 text-center text-brand-muted bg-brand-primary/5 rounded-2xl border border-dashed border-brand-muted/20">
                                <div className="text-4xl mb-3 opacity-50">🌱</div>
                                <p className="font-bold text-sm">No recent activity yet</p>
                                <p className="text-xs mt-1 opacity-70">Start your first adventure above!</p>
                            </div>
                        )}
                    </div>
                </section>

            </main>

            {/* Accessibility Panel (Floating Button) */}
            <AccessibilityPanel />
        </div>
    );
};

export default StudentDashboard;
