import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import {
    Users, Activity, TrendingUp, Award, Calendar, ChevronRight,
    Plus, Settings, LogOut, Layout, BookOpen, ShieldAlert
} from 'lucide-react';

const ParentDashboard = () => {
    const navigate = useNavigate();
    const { user, profile } = useAuth();
    const [children, setChildren] = useState([]);
    const [activeChildId, setActiveChildId] = useState(null);
    const [childStats, setChildStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'screening' | 'activity'

    useEffect(() => {
        const fetchParentData = async () => {
            if (!user) return;
            try {
                const { data: linkedChildren } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('linked_child_id', user.id);

                setChildren(linkedChildren || []);
                if (linkedChildren?.length > 0 && !activeChildId) {
                    setActiveChildId(linkedChildren[0].id);
                }
            } catch (err) {
                console.error("Parent dashboard error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchParentData();
    }, [user]);

    useEffect(() => {
        const fetchChildStats = async () => {
            if (!activeChildId) return;
            try {
                console.log("ParentDashboard: Fetching comprehensive stats for child:", activeChildId);
                const [lcRes, gameRes, screeningRes, chatRes, profRes] = await Promise.all([
                    supabase.from('level_completions').select('*').eq('user_id', activeChildId).order('created_at', { ascending: true }),
                    supabase.from('game_scores').select('*').eq('user_id', activeChildId).order('created_at', { ascending: true }),
                    supabase.from('screening_results').select('*').eq('user_id', activeChildId).order('created_at', { ascending: false }),
                    supabase.from('ai_chat_logs').select('id, started_at').eq('user_id', activeChildId),
                    supabase.from('profiles').select('*').eq('id', activeChildId).single()
                ]);

                if (lcRes.error) console.error("ParentDashboard: LC Fetch Error:", lcRes.error.message);
                if (gameRes.error) console.error("ParentDashboard: Game Fetch Error:", gameRes.error.message);
                if (chatRes.error) console.error("ParentDashboard: Chat Fetch Error:", chatRes.error.message);

                const childProfile = profRes.data || children.find(c => c.id === activeChildId);

                console.log("ParentDashboard: Data received for", childProfile?.full_name, {
                    levels: lcRes.data?.length || 0,
                    games: gameRes.data?.length || 0,
                    stars: childProfile?.total_stars,
                    words: childProfile?.words_read
                });

                setChildStats({
                    profile: childProfile,
                    level: childProfile?.current_level || 1,
                    stars: childProfile?.total_stars || 0,
                    words: childProfile?.words_read || 0,
                    history: lcRes.data || [],
                    games: gameRes.data || [],
                    allScreenings: screeningRes.data || [],
                    latestScreening: screeningRes.data?.[0] || null,
                    chats: chatRes.data || []
                });
            } catch (err) {
                console.error("Child stats fetch error:", err);
            }
        };

        fetchChildStats();
    }, [activeChildId, children]);

    const handleLinkChild = async () => {
        const childId = prompt("Enter Child's unique ID:");
        if (childId) {
            const { error } = await supabase.from('profiles').update({ linked_child_id: user.id }).eq('id', childId);
            if (!error) window.location.reload();
            else alert("Error linking child. Verify ID.");
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const activeChild = children.find(c => c.id === activeChildId);

    // Derived Analytics
    const lastActivityDate = activeChild ? (() => {
        const dates = [
            ...(childStats?.history || []).map(h => new Date(h.created_at)),
            ...(childStats?.games || []).map(g => new Date(g.created_at)),
            ...(childStats?.chats || []).map(c => new Date(c.started_at))
        ];
        if (dates.length === 0) return 'Never';
        return new Date(Math.max(...dates)).toLocaleDateString();
    })() : 'Never';

    // Prepare chart data
    const chartData = childStats?.history.map(h => ({
        date: new Date(h.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        accuracy: h.accuracy,
        wpm: h.wpm
    })) || [];

    // Prepare radar data with real skills
    const radarData = childStats?.latestScreening ? [
        { subject: 'Phonemes', A: childStats.latestScreening.phoneme_score || 0, fullMark: 100 },
        { subject: 'Rhyming', A: childStats.latestScreening.rhyme_score || 0, fullMark: 100 },
        { subject: 'Letters', A: childStats.latestScreening.letter_score || 0, fullMark: 100 },
        { subject: 'Reading', A: ((childStats.latestScreening.reading_wpm || 0) / 100) * 100, fullMark: 100 },
        { subject: 'Practice', A: Math.min((childStats.history.length / 20) * 100, 100), fullMark: 100 },
    ] : [];

    // Prepare bar chart data for weekly stars
    const weeklyStarsData = activeChild ? (() => {
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return d.toISOString().split('T')[0];
        });

        return last7Days.map(dateStr => {
            const dayHistory = (childStats?.history || []).filter(h => h.created_at.startsWith(dateStr));
            const dayGames = (childStats?.games || []).filter(g => g.created_at.startsWith(dateStr));
            const totalStars = [...dayHistory, ...dayGames].reduce((acc, curr) => acc + (curr.stars || curr.stars_earned || 0), 0);
            return { day: new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' }), stars: totalStars };
        });
    })() : [];

    const handleUnlinkChild = async (childId) => {
        if (!window.confirm("Are you sure you want to remove this child from your account? This will not delete their data, only the management link.")) return;
        const { error } = await supabase.from('profiles').update({ linked_child_id: null }).eq('id', childId);
        if (!error) window.location.reload();
        else alert("Error unlinking child.");
    };

    const LearningCalendar = ({ history, screenings }) => {
        const days = Array.from({ length: 28 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (27 - i));
            const dateStr = date.toISOString().split('T')[0];
            const hasActivity = history.some(h => h.created_at.startsWith(dateStr));
            const hasScreening = screenings.some(s => s.created_at.startsWith(dateStr));
            return { date, dateStr, hasActivity, hasScreening, dayNum: date.getDate() };
        });

        return (
            <div className="grid grid-cols-7 gap-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d} className="text-[10px] font-black text-slate-300 text-center">{d}</div>)}
                {days.map((d, i) => (
                    <div
                        key={i}
                        className={`aspect-square rounded-lg flex items-center justify-center text-[10px] font-bold border-2 transition-all
                            ${d.hasScreening ? 'bg-purple-100 border-purple-200 text-purple-600' :
                                d.hasActivity ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' :
                                    'bg-slate-50 border-slate-50 text-slate-300'}
                        `}
                        title={d.dateStr}
                    >
                        {d.dayNum}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#F1F5F9] font-sans flex text-slate-900">
            {/* Sidebar Navigation */}
            <aside className="w-80 bg-white border-r border-slate-200 flex flex-col p-8 sticky top-0 h-screen overflow-y-auto">
                <div className="flex items-center gap-3 mb-12">
                    <div className="bg-blue-600 text-white w-10 h-10 rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-blue-200">L</div>
                    <span className="text-2xl font-black tracking-tighter text-slate-800">LexiLearn <span className="text-blue-600">Pro</span></span>
                </div>

                <div className="space-y-2 mb-12">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 px-2">Main Menu</p>
                    {[
                        { id: 'overview', label: 'Overview', icon: Layout },
                        { id: 'screening', label: 'Screening Results', icon: ShieldAlert },
                        { id: 'activity', label: 'Learning Activity', icon: Activity },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            <tab.icon size={20} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="mt-auto space-y-4 pt-8 border-t border-slate-100">
                    <div className="flex items-center gap-3 px-2 mb-4">
                        <Avatar variant={profile?.avatar_variant || user?.id} size="sm" />
                        <div>
                            <p className="text-sm font-black text-slate-800">{profile?.full_name || 'Parent User'}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Premium Parent</p>
                        </div>
                    </div>
                    <button onClick={() => supabase.auth.signOut()} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-red-500 hover:bg-red-50 transition-all">
                        <LogOut size={20} /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 p-12 max-w-7xl">
                <header className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                            {activeTab === 'overview' && 'Parent Dashboard'}
                            {activeTab === 'screening' && 'Clinical Insights'}
                            {activeTab === 'activity' && 'Activity Logs'}
                        </h1>
                        <p className="text-slate-400 font-bold mt-1 uppercase tracking-widest text-[10px]">Real-time analytics for your child's progress</p>
                    </div>

                    <div className="flex items-center gap-4">
                        {activeChild && (
                            <button
                                onClick={() => navigate('/student/dashboard')}
                                className="bg-slate-900 text-white px-5 py-2.5 rounded-2xl font-black text-xs shadow-lg hover:bg-slate-800 transition-all flex items-center gap-2"
                            >
                                PREVIEW DASHBOARD 👁️
                            </button>
                        )}

                        <div className="flex items-center gap-4 bg-white p-1.5 rounded-3xl border border-slate-200 shadow-sm">
                            {children.map(child => (
                                <div key={child.id} className="relative group">
                                    <button
                                        onClick={() => setActiveChildId(child.id)}
                                        className={`px-5 py-2.5 rounded-2xl text-sm font-black transition-all ${activeChildId === child.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
                                    >
                                        {child.full_name?.split(' ')[0]}
                                    </button>
                                    {activeChildId === child.id && (
                                        <button
                                            onClick={() => handleUnlinkChild(child.id)}
                                            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Remove Child"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button onClick={handleLinkChild} className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-blue-50 transition-all">
                                <Plus size={20} />
                            </button>
                        </div>
                    </div>
                </header>

                {!activeChild ? (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-16 rounded-[40px] text-center shadow-xl shadow-slate-200/50 border border-slate-100">
                        <div className="w-32 h-32 bg-blue-50 text-blue-600 rounded-[40px] flex items-center justify-center text-6xl mx-auto mb-8 shadow-inner shadow-blue-100/50">👦</div>
                        <h2 className="text-4xl font-black text-slate-800 mb-4">No child account linked yet</h2>
                        <p className="text-slate-500 max-w-md mx-auto text-xl italic font-bold leading-relaxed mb-12">
                            To unlock insights and track progress, link your child's account using the unique ID from their dashboard.
                        </p>
                        <button onClick={handleLinkChild} className="bg-blue-600 text-white px-12 py-5 rounded-[25px] font-black text-xl shadow-2xl shadow-blue-200 hover:scale-105 transition-all">Link Account Now</button>
                    </motion.div>
                ) : (
                    <AnimatePresence mode="wait">
                        {activeTab === 'overview' && (
                            <motion.div key="overview" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-12 gap-8">
                                {/* QUICK STATS */}
                                <div className="col-span-12 grid grid-cols-4 gap-6">
                                    {[
                                        { label: 'Games Played', value: childStats?.games.length || 0, icon: Layout, color: 'text-yellow-600', bg: 'bg-yellow-50' },
                                        { label: 'Words Read', value: childStats?.words || 0, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
                                        { label: 'Current Level', value: `Level ${childStats?.level || 1}`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
                                        { label: 'Last Activity', value: lastActivityDate, icon: Calendar, color: 'text-green-600', bg: 'bg-green-50' },
                                    ].map((stat, i) => (
                                        <div key={i} className="bg-white p-6 rounded-[35px] border border-slate-100 shadow-sm flex items-center gap-6">
                                            <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center shadow-inner`}>
                                                <stat.icon size={24} />
                                            </div>
                                            <div>
                                                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-1">{stat.label}</p>
                                                <p className="text-2xl font-black text-slate-800">{stat.value}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Reading Progress Graph */}
                                <div className="col-span-8 space-y-8">
                                    <div className="bg-white p-10 rounded-[50px] shadow-sm border border-slate-100 h-[400px]">
                                        <h3 className="text-xl font-black text-slate-800 mb-8 px-4 flex items-center gap-3">
                                            <TrendingUp className="text-blue-600" /> Reading Improvement
                                        </h3>
                                        <div className="h-[250px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={chartData}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} />
                                                    <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                                                    <Line type="monotone" dataKey="accuracy" stroke="#2563eb" strokeWidth={4} dot={{ r: 6 }} />
                                                    <Line type="monotone" dataKey="wpm" stroke="#e2e8f0" strokeWidth={4} dot={{ r: 6 }} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    <div className="bg-white p-10 rounded-[50px] shadow-sm border border-slate-100 h-[300px]">
                                        <h3 className="text-xl font-black text-slate-800 mb-8 px-4 flex items-center gap-3">
                                            <Award className="text-yellow-500" /> Weekly Star Distribution
                                        </h3>
                                        <div className="h-[150px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={weeklyStarsData}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} />
                                                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }} />
                                                    <Bar dataKey="stars" fill="#facc15" radius={[10, 10, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>

                                {/* Practice Habits & AI Intelligence */}
                                <div className="col-span-4 space-y-8">
                                    <div className="bg-white p-8 rounded-[50px] shadow-sm border border-slate-100 flex flex-col">
                                        <h3 className="text-lg font-black text-slate-800 mb-6 flex justify-between items-center">
                                            Practice Habits
                                            <Calendar size={18} className="text-blue-600" />
                                        </h3>
                                        <LearningCalendar history={childStats?.history || []} screenings={childStats?.allScreenings || []} />
                                        <div className="mt-6 flex flex-wrap gap-2">
                                            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-slate-400">
                                                <div className="w-2 h-2 bg-blue-600 rounded-full" /> Practice
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-slate-400">
                                                <div className="w-2 h-2 bg-purple-100 border border-purple-200 rounded-full" /> Screening
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white p-8 rounded-[50px] shadow-sm border border-slate-100">
                                        <h3 className="text-lg font-black text-slate-800 mb-2">Teacher Intelligence</h3>
                                        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-6 italic">AI Intervention Strategy</p>
                                        <div className="p-6 bg-blue-50/50 rounded-[35px] border-2 border-dashed border-blue-100 leading-relaxed text-slate-600 font-bold text-xs italic">
                                            {childStats?.history.length > 0 ? (
                                                `"Your child mastered Level ${childStats.level - 1} with ${childStats.history[childStats.history.length - 1].accuracy}% accuracy. I recommend focusing on vowel sounds in today's session."`
                                            ) : (
                                                "\"I'm still collecting data on your child's learning patterns. Encourage them to play their first game!\""
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'screening' && (
                            <motion.div key="screening" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-12 gap-8">
                                <div className="col-span-12 grid grid-cols-3 gap-8">
                                    <div className="col-span-2 bg-slate-900 rounded-[50px] p-12 text-white shadow-2xl relative overflow-hidden h-[450px]">
                                        <h3 className="text-2xl font-black mb-10 relative z-10">Cognitive Skill Radar</h3>
                                        <div className="h-[300px] w-full flex items-center justify-center relative z-10">
                                            {radarData.length > 0 ? (
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <RadarChart data={radarData}>
                                                        <PolarGrid stroke="#334155" />
                                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }} />
                                                        <Radar name="Skills" dataKey="A" stroke="#2563eb" fill="#2563eb" fillOpacity={0.6} />
                                                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '15px' }} />
                                                    </RadarChart>
                                                </ResponsiveContainer>
                                            ) : (
                                                <div className="text-center opacity-40">
                                                    <ShieldAlert size={64} className="mx-auto mb-4" />
                                                    <p className="font-black">No screening data available</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-8">
                                        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col justify-between h-full">
                                            <div>
                                                <h4 className="text-lg font-black text-slate-800 mb-6 underline decoration-blue-500 decoration-4">Latest Scan</h4>
                                                <div className="flex items-center gap-6 mb-8">
                                                    <div className={`text-4xl p-6 rounded-3xl ${childStats?.latestScreening?.risk_level?.toLowerCase() === 'low' ? 'bg-green-100' : 'bg-red-100'}`}>
                                                        {childStats?.latestScreening?.risk_level?.toLowerCase() === 'low' ? '✅' : '⚠️'}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-800 uppercase tracking-widest">{childStats?.latestScreening?.risk_level || 'Pending'} Risk</p>
                                                        <p className="text-xs text-slate-400 font-bold">Clinical Assessment</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {childStats?.latestScreening?.audio_url ? (
                                                <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Recording Playback</p>
                                                    <audio src={childStats.latestScreening.audio_url} controls className="w-full h-10" />
                                                </div>
                                            ) : (
                                                <div className="p-4 rounded-3xl bg-slate-50 border border-dashed border-slate-200 text-center">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">No Audio Found</p>
                                                    <p className="text-[9px] text-slate-400 font-bold italic">Child didn't record audio during this test.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="col-span-12 bg-white p-10 rounded-[50px] shadow-sm border border-slate-100">
                                    <h3 className="text-xl font-black text-slate-800 mb-8 px-2 flex justify-between items-center">
                                        Clinical History
                                        <TrendingUp className="text-blue-600" />
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {childStats?.allScreenings.map((s, i) => (
                                            <div key={i} className="p-6 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                                                <div>
                                                    <p className="font-black text-sm text-slate-800">{new Date(s.created_at).toLocaleDateString()}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Score: {s.calculated_score}</p>
                                                </div>
                                                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${s.risk_level === 'LOW' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {s.risk_level}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'activity' && (
                            <motion.div key="activity" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    {/* Reading Sessions */}
                                    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 flex flex-col">
                                        <h3 className="text-lg font-black text-slate-800 mb-6 flex justify-between items-center">
                                            Reading Practice
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 py-1 bg-blue-50 rounded-lg">Levels</div>
                                        </h3>
                                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                            {childStats?.history.slice().reverse().map((h, i) => (
                                                <div key={i} className="flex items-center gap-4 p-4 rounded-3xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors">
                                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-xl text-blue-600 font-black">L{h.level}</div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-black text-slate-800 text-xs truncate">Reading Session</p>
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{new Date(h.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-black text-blue-600 text-[10px]">{h.accuracy}%</p>
                                                        <p className="text-[9px] font-black text-slate-400">{h.wpm} WPM</p>
                                                    </div>
                                                </div>
                                            ))}
                                            {childStats?.history.length === 0 && <p className="text-center py-20 text-slate-400 font-bold italic text-sm">No reading sessions yet.</p>}
                                        </div>
                                    </div>

                                    {/* Game Sessions */}
                                    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 flex flex-col">
                                        <h3 className="text-lg font-black text-slate-800 mb-6 flex justify-between items-center">
                                            Game Play
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 py-1 bg-yellow-50 rounded-lg">Arcade</div>
                                        </h3>
                                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                            {childStats?.games.slice().reverse().map((g, i) => (
                                                <div key={i} className="flex items-center gap-4 p-4 rounded-3xl bg-slate-50 border border-slate-100 hover:border-yellow-200 transition-colors">
                                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-xl">🎮</div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-black text-slate-800 text-xs truncate">{g.game_id.replace(/-/g, ' ')}</p>
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{new Date(g.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-black text-yellow-600 text-[10px]">{g.score} pts</p>
                                                        <p className="text-[9px] font-black text-slate-400">{g.stars_earned} ⭐</p>
                                                    </div>
                                                </div>
                                            ))}
                                            {childStats?.games.length === 0 && <p className="text-center py-20 text-slate-400 font-bold italic text-sm">No games played yet.</p>}
                                        </div>
                                    </div>

                                    {/* Coach Interactions */}
                                    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 flex flex-col">
                                        <h3 className="text-lg font-black text-slate-800 mb-6 flex justify-between items-center">
                                            Coach Sessions
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 py-1 bg-purple-50 rounded-lg">AI Support</div>
                                        </h3>
                                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                            {childStats?.chats.slice().reverse().map((c, i) => (
                                                <div key={i} className="flex items-center gap-4 p-4 rounded-3xl bg-slate-50 border border-slate-100 hover:border-purple-200 transition-colors">
                                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-xl text-purple-600">🤖</div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-black text-slate-800 text-xs truncate">AI Tutoring</p>
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{new Date(c.started_at).toLocaleDateString()}</p>
                                                    </div>
                                                    <ChevronRight className="text-slate-300" size={16} />
                                                </div>
                                            ))}
                                            {childStats?.chats.length === 0 && <p className="text-center py-20 text-slate-400 font-bold italic text-sm">No AI sessions yet.</p>}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </main>
        </div>
    );
};

export default ParentDashboard;
