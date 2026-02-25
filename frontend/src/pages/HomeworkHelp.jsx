import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import {
    FileText, Upload, BookOpen, HelpCircle,
    MessageCircle, Download, Settings, Type,
    Sun, Moon, Volume2, CheckCircle, ChevronLeft, X,
    Layout, Zap, ClipboardList, Tag, Sparkles, Loader2,
    RotateCcw, Trash2, AlertCircle, ArrowLeft, Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as pdfjsLib from 'pdfjs-dist';
// Vite-specific worker import
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import mammoth from 'mammoth';
import { useTheme } from '../context/ThemeContext';

// Setup PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const STUDY_FEATURES = [
    {
        id: 'reader',
        icon: <BookOpen className="w-10 h-10" />,
        illustration: "📖",
        title: 'Read Comfortably',
        subtitle: 'Easy reading tools',
        badge: 'Recommended',
        color: 'from-blue-50 to-indigo-50',
        textColor: 'text-indigo-600',
        iconBg: 'bg-indigo-100/50'
    },
    {
        id: 'summary',
        icon: <ClipboardList className="w-10 h-10" />,
        illustration: "✨",
        title: 'Smart Summary',
        subtitle: 'Key takeaways',
        color: 'from-purple-50 to-fuchsia-50',
        textColor: 'text-purple-600',
        iconBg: 'bg-purple-100/50'
    },
    {
        id: 'quiz',
        icon: <Zap className="w-10 h-10" />,
        illustration: "⚡",
        title: 'Smart Quiz',
        subtitle: 'Test your knowledge',
        color: 'from-emerald-50 to-teal-50',
        textColor: 'text-emerald-600',
        iconBg: 'bg-emerald-100/50'
    },
    {
        id: 'keywords',
        icon: <Tag className="w-10 h-10" />,
        illustration: "🏷️",
        title: 'Key Words',
        subtitle: 'Master new terms',
        color: 'from-amber-50 to-orange-50',
        textColor: 'text-amber-600',
        iconBg: 'bg-amber-100/50'
    },
    {
        id: 'chat',
        icon: <MessageCircle className="w-10 h-10" />,
        illustration: "🤖",
        title: 'Study Buddy',
        subtitle: 'AI Tutor chat',
        color: 'from-rose-50 to-pink-50',
        textColor: 'text-rose-600',
        iconBg: 'bg-rose-100/50'
    }
];

const HomeworkHelp = () => {
    const navigate = useNavigate();
    const { user, profile } = useAuth();
    const { theme: globalTheme, font: globalFont } = useTheme();

    // UI STEPS: 'select' | 'upload' | 'process' | 'view'
    const [step, setStep] = useState('select');
    const [selectedFeatures, setSelectedFeatures] = useState([]);
    const [activeView, setActiveView] = useState('');

    // DATA STATE
    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState("");
    const [stats, setStats] = useState({ pages: 0, words: 0 });
    const [chapterText, setChapterText] = useState("");
    const [studyData, setStudyData] = useState({ summary: "", quiz: [], keywords: [] });

    // UI FLAGS
    const [isExtracting, setIsExtracting] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [buddyState, setBuddyState] = useState('idle');

    // READER LOCAL PREFS (Overrides for manual adjustment)
    const [localFontSize, setLocalFontSize] = useState(18);
    const [lineSpacing, setLineSpacing] = useState(1.8);

    // CHAT STATE
    const [messages, setMessages] = useState([
        { role: 'ai', content: "Hello! I'm your Study Buddy. Once your chapter is ready, I can help you with questions. What can I help you learn today?" }
    ]);
    const [chatInput, setChatInput] = useState("");
    const [chatLoading, setChatLoading] = useState(false);
    const chatEndRef = useRef(null);

    // QUIZ STATE
    const [activeQuizIdx, setActiveQuizIdx] = useState(0);
    const [quizAnswers, setQuizAnswers] = useState({});
    const [showQuizResults, setShowQuizResults] = useState(false);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // BTN HANDLERS
    const toggleFeature = (id) => {
        setSelectedFeatures(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    // 1. FILE EXTRACTION
    const handleFileChange = async (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        setFile(selectedFile);
        setFileName(selectedFile.name);
        setIsExtracting(true);
        setError(null);
        setStep('upload');

        try {
            let extracted = "";
            let pages = 1;
            const ext = selectedFile.name.split('.').pop().toLowerCase();

            if (selectedFile.type === "application/pdf" || ext === 'pdf') {
                const arrayBuffer = await selectedFile.arrayBuffer();
                const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
                const pdf = await loadingTask.promise;
                pages = pdf.numPages;
                for (let i = 1; i <= pages; i++) {
                    const page = await pdf.getPage(i);
                    const content = await page.getTextContent();
                    extracted += content.items.map(item => item.str).join(" ") + " ";
                }
            } else if (selectedFile.type.includes("word") || ext === 'docx') {
                const arrayBuffer = await selectedFile.arrayBuffer();
                const res = await mammoth.extractRawText({ arrayBuffer });
                extracted = res.value;
            } else if (selectedFile.type === "text/plain" || ext === 'txt') {
                extracted = await selectedFile.text();
            } else {
                throw new Error("Unsupported file type. Please use PDF, DOCX, or TXT.");
            }

            const cleanText = extracted
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                .replace(/[^\x20-\x7E\n\r\t]/g, " ")
                .replace(/\s+/g, ' ');

            if (cleanText.trim().length < 100) {
                throw new Error("This file is too short. Please upload a full chapter for analysis!");
            }

            setChapterText(cleanText);
            setStats({ pages, words: cleanText.split(' ').length });
            setIsExtracting(false);
        } catch (err) {
            setError(err.message || "I couldn't read that file. Try a different PDF!");
            setIsExtracting(false);
        }
    };

    // 2. RUN AGENT
    const runStudyAgent = async () => {
        if (!chapterText || selectedFeatures.length === 0) return;

        setStep('process');
        setIsProcessing(true);
        setBuddyState('thinking');
        setError(null);

        try {
            const res = await fetch('http://localhost:8000/api/study-insight', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    child_id: user?.id || "guest",
                    child_age: profile?.age || 8,
                    child_level: profile?.current_level || "beginner",
                    dyslexia_risk: profile?.dyslexia_risk_score ? "High" : "Moderate",
                    subject: "Chapter Analysis",
                    content: chapterText.slice(0, 10000),
                    features: selectedFeatures
                }),
                signal: AbortSignal.timeout(120000)
            });

            if (!res.ok) throw new Error("Our brains got a bit tired! Let's try again.");

            const data = await res.json();
            setStudyData({
                summary: data.summary || "",
                quiz: Array.isArray(data.quiz) ? data.quiz : [],
                keywords: Array.isArray(data.keywords) ? data.keywords : []
            });

            setIsProcessing(false);
            setBuddyState('idle');
            setStep('view');

            // Auto-select first active view
            if (selectedFeatures.includes('reader')) setActiveView('reader');
            else if (selectedFeatures.includes('summary')) setActiveView('summary');
            else setActiveView(selectedFeatures[0]);

        } catch (err) {
            setError(err.message);
            setIsProcessing(false);
            setBuddyState('idle');
            setStep('upload');
        }
    };

    const sendChatMessage = async () => {
        if (!chatInput.trim() || chatLoading) return;
        const msg = chatInput;
        setChatInput("");
        setMessages(prev => [...prev, { role: 'user', content: msg }]);
        setChatLoading(true);
        setBuddyState('thinking');

        try {
            const res = await fetch('http://localhost:8000/api/study-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user?.id || "guest",
                    message: msg,
                    context: chapterText,
                    history: messages.slice(-6).map(m => ({ role: m.role === 'ai' ? 'ai' : 'user', content: m.content }))
                })
            });
            const data = await res.json();
            setMessages(prev => [...prev, { role: 'ai', content: data.response }]);
            setBuddyState('speaking');
            setTimeout(() => setBuddyState('idle'), 3000);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'ai', content: "I'm having trouble thinking right now. Let's try again!" }]);
            setBuddyState('idle');
        } finally {
            setChatLoading(false);
        }
    };

    const speakText = (txt) => {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(txt);
        u.onstart = () => setBuddyState('speaking');
        u.onend = () => setBuddyState('idle');
        window.speechSynthesis.speak(u);
    };

    // UI COMPONENTS
    const Nav = () => (
        <nav className="flex items-center justify-between px-8 py-4 bg-[var(--card-bg)]/80 backdrop-blur-xl sticky top-0 z-[100] border-b border-brand-lavender transition-colors duration-500 h-20">
            <div className="flex items-center gap-4">
                <motion.button
                    whileHover={{ x: -4 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                        if (step === 'select') navigate('/student/dashboard');
                        else if (step === 'upload') setStep('select');
                        else if (step === 'view') setStep('upload');
                    }}
                    className="w-10 h-10 rounded-xl bg-brand-lavender/50 backdrop-blur-sm shadow-sm flex items-center justify-center text-brand-primary hover:bg-brand-lavender transition-all"
                >
                    <ArrowLeft size={20} />
                </motion.button>
                <div className="flex flex-col">
                    <h1 className="text-xl font-black text-brand-primary tracking-tight leading-none">
                        Homework Help
                    </h1>
                    <span className="text-[10px] font-bold text-brand-primary opacity-40 uppercase tracking-[0.2em]">
                        Your Smart Study Assistant
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="hidden md:flex flex-col items-end mr-2">
                    <span className="text-[10px] font-black text-brand-primary opacity-30 uppercase tracking-widest">Studying with</span>
                    <span className="text-xs font-black text-brand-primary">Lexi Coach</span>
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-brand-lavender p-0.5 overflow-hidden bg-white shadow-sm">
                    <Avatar variant="lexi" size="xs" className="!w-full !h-full !border-0 !shadow-none" />
                </div>
            </div>
        </nav>
    );

    const BuddyAvatar = ({ state, size = "md" }) => (
        <div className={`relative ${size === 'lg' ? 'w-32 h-32' : 'w-20 h-20'} transition-all duration-500 mx-auto`}>
            {/* Soft Gradient Halo Glow */}
            <div className="absolute inset-0 bg-brand-lavender rounded-[35px] blur-[20px] animate-pulse-glow" style={{ animationDuration: '4s' }}></div>

            <div className={`absolute inset-0 bg-white/95 rounded-[30px] shadow-[0_15px_30px_rgba(0,0,0,0.08)] border-2 border-brand-lavender/30 flex items-center justify-center overflow-hidden relative z-10 transition-colors duration-500`}>
                <motion.div
                    animate={state === 'thinking' ? { scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] } : state === 'speaking' ? { y: [0, -3, 0] } : {}}
                    transition={{ repeat: Infinity, duration: 2.5 }}
                >
                    <Avatar variant="lexi" size={size === 'lg' ? 'lg' : 'md'} className="!border-0 !shadow-none !bg-transparent" />
                </motion.div>

                {state === 'thinking' && (
                    <div className="absolute top-3 right-3 flex gap-1 bg-white/50 backdrop-blur-sm p-1 rounded-full border border-brand-lavender/30">
                        <motion.div animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-brand-primary rounded-full" />
                        <motion.div animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-brand-primary rounded-full" />
                    </div>
                )}
            </div>

            <AnimatePresence>
                {state === 'speaking' && (
                    <motion.div
                        initial={{ scale: 0, rotate: -20, opacity: 0 }}
                        animate={{ scale: 1, rotate: 0, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-br from-brand-primary to-slate-800 rounded-2xl flex items-center justify-center shadow-lg border-2 border-brand-lavender z-20"
                    >
                        <Volume2 size={18} className="text-white" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Status Indicator */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-3 py-1 bg-white shadow-sm border border-brand-lavender/50 rounded-full z-20">
                <span className="text-[8px] font-black text-brand-primary uppercase tracking-widest whitespace-nowrap">
                    {state === 'thinking' ? 'Thinking...' : state === 'speaking' ? 'Talking' : 'Coach'}
                </span>
            </div>
        </div>
    );

    return (
        <div className={`min-h-screen transition-colors duration-500 font-dyslexic overflow-hidden relative selection:bg-brand-primary/20 font-${globalFont}`} style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
            {/* Animated Background Decorative Elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                <motion.div
                    animate={{
                        x: [0, 100, 0],
                        y: [0, 50, 0],
                        rotate: [0, 10, 0]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-[10%] -left-[5%] w-[40%] h-[40%] bg-brand-primary/5 rounded-full blur-[80px]"
                />
                <motion.div
                    animate={{
                        x: [0, -80, 0],
                        y: [0, 120, 0],
                        rotate: [0, -15, 0]
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[20%] -right-[10%] w-[35%] h-[35%] bg-amber-400/5 rounded-full blur-[100px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-[10%] left-[15%] w-[30%] h-[30%] bg-indigo-500/5 rounded-full blur-[90px]"
                />
            </div>

            <Nav />

            <main className="max-w-6xl mx-auto px-6 py-4 h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar relative z-10">
                <AnimatePresence mode="wait">

                    {/* 1. SELECTION STEP */}
                    {step === 'select' && (
                        <motion.div
                            key="select"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="flex flex-col items-center min-h-[80vh] justify-center py-10 relative"
                        >
                            {/* Background Surface for Content */}
                            <div className="absolute inset-0 bg-brand-lavender/10 rounded-[60px] blur-[100px] -z-10" />

                            <div className="bg-[var(--card-bg)]/60 backdrop-blur-xl p-12 rounded-[50px] border-2 border-white shadow-[0_20px_50px_rgba(0,0,0,0.04)] w-full max-w-5xl flex flex-col items-center relative overflow-hidden">
                                {/* Subtle Background Pattern */}
                                <div className="absolute inset-0 bg-pattern-dots opacity-20 pointer-events-none" />

                                <div className="flex flex-col items-center text-center mb-10 relative z-10 w-full">
                                    <BuddyAvatar state={buddyState} size="lg" />
                                    <div className="mt-6">
                                        <h2 className="text-2xl md:text-3xl font-black mb-1 text-brand-primary tracking-tight leading-tight">
                                            How can I help you study today?
                                        </h2>
                                        <p className="text-[10px] text-brand-primary opacity-40 font-bold uppercase tracking-[0.3em] leading-none">
                                            CHOOSE YOUR LEARNING TOOLS
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full relative z-10 mb-10">
                                    {STUDY_FEATURES.map((f, i) => {
                                        const active = selectedFeatures.includes(f.id);
                                        return (
                                            <motion.button
                                                key={f.id}
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: i * 0.05 }}
                                                whileHover={{ y: -5, scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => toggleFeature(f.id)}
                                                className={`
                                                    relative p-6 rounded-[35px] text-center transition-all duration-500 border-2 flex flex-col items-center gap-4 group overflow-hidden
                                                    ${active
                                                        ? 'bg-white shadow-[0_20px_40px_rgba(0,0,0,0.08)] border-brand-primary'
                                                        : 'bg-white/40 shadow-sm border-white backdrop-blur-sm hover:border-brand-lavender hover:bg-white/80'
                                                    }
                                                `}
                                            >
                                                {f.badge && (
                                                    <span className="absolute top-4 right-4 bg-brand-primary text-white text-[8px] uppercase font-black px-2.5 py-1 rounded-full tracking-widest z-10 shadow-sm">
                                                        {f.badge}
                                                    </span>
                                                )}

                                                <div className={`w-14 h-14 bg-gradient-to-br ${f.color} ${f.textColor} rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-white/50 group-hover:rotate-6 transition-transform duration-500`}>
                                                    {f.icon}
                                                </div>

                                                <div className="flex flex-col items-center">
                                                    <h3 className="text-lg font-black leading-tight tracking-tight text-brand-primary">{f.title}</h3>
                                                    <p className="text-brand-primary opacity-40 font-bold text-[9px] uppercase tracking-widest mt-1">{f.subtitle}</p>
                                                </div>

                                                {active && (
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        className="absolute bottom-4 right-4 w-8 h-8 bg-brand-primary text-white rounded-full flex items-center justify-center border-4 border-white shadow-md"
                                                    >
                                                        <CheckCircle size={16} />
                                                    </motion.div>
                                                )}
                                            </motion.button>
                                        );
                                    })}
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setStep('upload')}
                                    disabled={selectedFeatures.length === 0}
                                    className="bg-brand-primary text-white px-16 py-5 rounded-[28px] text-xl font-black shadow-xl hover:shadow-brand-primary/20 transition-all flex items-center gap-4 disabled:opacity-20 disabled:grayscale group relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                    <span className="relative z-10 uppercase tracking-widest text-sm">Continue to Upload</span>
                                    <ArrowLeft className="rotate-180 relative z-10" size={20} />
                                </motion.button>
                            </div>
                        </motion.div>
                    )}

                    {/* 2. UPLOAD STEP */}
                    {step === 'upload' && (
                        <motion.div
                            key="upload"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center min-h-[80vh] justify-center py-6"
                        >
                            <div className="bg-[var(--card-bg)]/80 backdrop-blur-xl p-10 rounded-[50px] shadow-[0_30px_60px_rgba(0,0,0,0.05)] w-full max-w-xl text-center flex flex-col items-center border-2 border-white transition-colors duration-500 relative overflow-hidden">
                                {/* Decorative Gradient Blobs */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-lavender/20 blur-3xl -z-10" />
                                <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-pink/20 blur-3xl -z-10" />

                                <div className="w-20 h-20 bg-brand-lavender/30 text-brand-primary rounded-[30px] flex items-center justify-center mb-6 shadow-inner border border-white">
                                    <Upload size={32} />
                                </div>
                                <h2 className="text-2xl font-black mb-2 text-brand-primary tracking-tight">Upload material</h2>
                                <p className="text-[10px] text-brand-primary opacity-40 font-bold uppercase tracking-[0.3em] mb-8">PDF • DOCX • TXT</p>

                                <label className="w-full h-48 border-4 border-dashed border-brand-lavender/50 rounded-[40px] flex flex-col items-center justify-center gap-3 hover:border-brand-primary/40 hover:bg-brand-lavender/10 transition-all cursor-pointer group mb-8 relative overflow-hidden transition-colors duration-500">
                                    <div className="z-10 flex flex-col items-center">
                                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-md mb-2 group-hover:scale-110 transition-all duration-300">
                                            <FileText size={28} className="text-brand-primary opacity-40 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        <span className="text-sm font-black text-brand-primary opacity-60">Drag & drop or click to upload</span>
                                        <span className="text-[9px] font-bold text-brand-primary opacity-30 uppercase tracking-widest mt-1">Maximum file size: 10MB</span>
                                    </div>
                                    <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.docx,.txt" />
                                    <AnimatePresence>
                                        {isExtracting && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-20 gap-4"
                                            >
                                                <div className="relative">
                                                    <Loader2 size={40} className="animate-spin text-brand-primary" />
                                                    <div className="absolute inset-0 blur-lg bg-brand-primary/20 animate-pulse" />
                                                </div>
                                                <span className="text-xs font-black text-brand-primary uppercase tracking-[0.2em] animate-pulse">Scanning pages...</span>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </label>

                                {fileName && (
                                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-4 bg-white/80 backdrop-blur-sm px-6 py-4 rounded-[30px] w-full mb-8 overflow-hidden border border-brand-lavender shadow-sm group">
                                        <div className="w-12 h-12 bg-brand-lavender/30 rounded-2xl flex items-center justify-center text-brand-primary shadow-inner"><FileText size={20} /></div>
                                        <div className="text-left flex-1 truncate">
                                            <p className="font-black text-base truncate text-brand-primary">{fileName}</p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] text-brand-primary font-black uppercase tracking-widest leading-none bg-brand-lavender/50 px-2 py-0.5 rounded-full">{stats.words} Words</span>
                                                <span className="text-[9px] text-brand-primary font-black uppercase tracking-widest leading-none bg-brand-pink/50 px-2 py-0.5 rounded-full">{stats.pages} Pages</span>
                                            </div>
                                        </div>
                                        <button onClick={() => { setFile(null); setFileName(""); }} className="text-brand-primary opacity-20 hover:opacity-100 transition-all p-2 bg-white rounded-full shadow-sm hover:scale-110 active:scale-95"><X size={20} /></button>
                                    </motion.div>
                                )}

                                {error && (
                                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="bg-red-50 text-red-600 p-5 rounded-[25px] w-full mb-8 font-black flex items-center gap-3 border border-red-100 text-xs text-left shadow-sm">
                                        <div className="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <AlertCircle size={18} />
                                        </div>
                                        {error}
                                    </motion.div>
                                )}

                                <motion.button
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={runStudyAgent}
                                    disabled={!file || isExtracting}
                                    className="w-full bg-brand-primary text-white py-6 rounded-[30px] text-lg font-black shadow-xl hover:shadow-brand-primary/30 transition-all disabled:opacity-20 disabled:grayscale group relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                    <div className="relative z-10 flex items-center justify-center gap-3">
                                        ANALYZE CHAPTER <Sparkles size={22} className="group-hover:rotate-12 transition-transform" />
                                    </div>
                                </motion.button>
                            </div>
                        </motion.div>
                    )}

                    {/* 3. PROCESS STEP */}
                    {step === 'process' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center min-h-[80vh] text-center"
                        >
                            <div className="relative mb-12">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                                    className="w-64 h-64 border-[4px] border-dashed border-brand-lavender rounded-full"
                                />
                                <motion.div
                                    animate={{ rotate: -360 }}
                                    transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
                                    className="absolute inset-4 border-[2px] border-dashed border-brand-pink/40 rounded-full"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <BuddyAvatar state="thinking" size="lg" />
                                </div>
                            </div>
                            <h2 className="text-3xl font-black mb-4 text-brand-primary tracking-tight">Reading carefully...</h2>
                            <div className="flex flex-col items-center gap-2">
                                <p className="text-[10px] text-brand-primary opacity-40 font-bold uppercase tracking-[0.3em]">LEXI IS PREPARING YOUR LESSON</p>
                                <div className="flex gap-1.5">
                                    <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 bg-brand-primary rounded-full" />
                                    <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 bg-brand-primary rounded-full" />
                                    <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 bg-brand-primary rounded-full" />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* 4. VIEW STEP */}
                    {step === 'view' && (
                        <div className="flex flex-col gap-8 pb-20">

                            {/* TOOLS BAR - Modern & Guided */}
                            <div className="flex bg-[var(--card-bg)]/80 backdrop-blur-xl p-3 rounded-[35px] shadow-[0_15px_30px_rgba(0,0,0,0.03)] h-fit gap-2 overflow-x-auto scrollbar-hide border-2 border-white transition-colors duration-500 self-center md:self-start">
                                {selectedFeatures.map(fId => {
                                    const tool = STUDY_FEATURES.find(sf => sf.id === fId);
                                    const active = activeView === fId;
                                    return (
                                        <motion.button
                                            key={fId}
                                            whileHover={{ scale: active ? 1 : 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setActiveView(fId)}
                                            className={`flex items-center gap-3 px-8 py-4 rounded-[28px] font-black transition-all whitespace-nowrap relative overflow-hidden ${active ? 'bg-brand-primary text-white shadow-lg' : 'text-brand-primary opacity-40 hover:opacity-100 hover:bg-brand-lavender/30'}`}
                                        >
                                            <span className="text-xl relative z-10">{tool.illustration}</span>
                                            <span className="text-[10px] uppercase tracking-widest relative z-10">{tool.title}</span>
                                            {active && (
                                                <motion.div layoutId="activeTool" className="absolute inset-0 bg-brand-primary -z-10" />
                                            )}
                                        </motion.button>
                                    );
                                })}
                            </div>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeView}
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.02 }}
                                    className="bg-[var(--card-bg)] rounded-[60px] shadow-[0_30px_70px_rgba(0,0,0,0.05)] min-h-[700px] overflow-hidden flex flex-col border border-white relative transition-colors duration-500"
                                >
                                    {/* CONTENT VIEWER */}
                                    {activeView === 'reader' && (
                                        <div className="flex flex-col h-full bg-brand-lavender/5 transition-colors duration-500">
                                            {/* Reader Controls */}
                                            <div className="p-6 border-b border-brand-lavender/30 flex flex-wrap gap-6 items-center bg-white/40 backdrop-blur-md">
                                                <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white border border-brand-lavender shadow-sm text-brand-primary">
                                                    <Type size={16} className="opacity-40" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                                                        {globalFont.replace('font-', '')}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4 px-5 py-2 rounded-xl bg-white border border-brand-lavender shadow-sm">
                                                    <span className="text-[9px] font-black opacity-30 uppercase tracking-widest text-brand-primary">Size</span>
                                                    <input
                                                        type="range" min="16" max="42"
                                                        value={localFontSize}
                                                        onChange={(e) => setLocalFontSize(parseInt(e.target.value))}
                                                        className="w-20 h-1 bg-brand-lavender rounded-full appearance-none accent-brand-primary"
                                                    />
                                                    <span className="text-[10px] font-black text-brand-primary w-4 leading-none">{localFontSize}</span>
                                                </div>

                                                <div className="flex items-center gap-2 ml-auto">
                                                    <span className="text-[9px] font-black opacity-30 uppercase tracking-widest text-brand-primary mr-2">Theme</span>
                                                    {['cream', 'gray', 'yellow'].map(t => (
                                                        <div
                                                            key={t}
                                                            className={`w-6 h-6 rounded-full border-2 border-white shadow-sm cursor-pointer transition-transform ${t === 'cream' ? 'bg-[#FFF4E6]' : t === 'gray' ? 'bg-slate-200' : 'bg-amber-100'} ${globalTheme === t ? 'ring-2 ring-brand-primary scale-110' : 'opacity-40 hover:opacity-100'}`}
                                                        />
                                                    ))}
                                                </div>

                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => speakText(chapterText)}
                                                    className="bg-brand-primary text-white p-3.5 rounded-xl shadow-lg hover:shadow-brand-primary/20 transition-all flex items-center justify-center"
                                                >
                                                    <Volume2 size={20} />
                                                </motion.button>
                                            </div>

                                            {/* Soft Paper Reading Surface */}
                                            <div className="flex-1 overflow-hidden p-4 md:p-8 relative">
                                                <div
                                                    className={`
                                                        h-full overflow-y-auto p-10 md:p-20 rounded-[40px] shadow-inner font-body leading-relaxed custom-scrollbar transition-all duration-500 relative
                                                        font-${globalFont} ${globalTheme === 'cream' ? 'bg-[#FFFBF5] text-slate-800' : globalTheme === 'gray' ? 'bg-[#F8FAFC] text-slate-700' : 'bg-[#FFF8E1] text-slate-900'}
                                                    `}
                                                    style={{
                                                        fontSize: `${localFontSize}px`,
                                                        lineHeight: lineSpacing,
                                                    }}
                                                >
                                                    {/* Subtle texture for paper */}
                                                    <div className="absolute inset-0 bg-pattern-grid opacity-[0.03] pointer-events-none" />
                                                    <div className="max-w-3xl mx-auto relative z-10">{chapterText}</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeView === 'summary' && (
                                        <div className="p-10 md:p-16 flex-1 flex flex-col items-center relative overflow-hidden">
                                            {/* Pattern background */}
                                            <div className="absolute inset-0 bg-pattern-dots opacity-10" />

                                            <div className="flex flex-col items-center text-center gap-4 mb-12 relative z-10">
                                                <div className="w-20 h-20 bg-brand-lavender text-brand-primary rounded-[30px] flex items-center justify-center shadow-inner border border-white">
                                                    <ClipboardList size={32} />
                                                </div>
                                                <div>
                                                    <h3 className="text-3xl font-black text-brand-primary tracking-tight">Academic Summary</h3>
                                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary opacity-40">THE BIG PICTURE IN SMALL BITES</p>
                                                </div>
                                            </div>
                                            <div className={`max-w-3xl w-full text-base md:text-lg font-medium leading-[1.7] text-brand-primary bg-white/70 backdrop-blur-md p-8 md:p-10 rounded-[40px] border-2 border-white shadow-lg relative z-10 font-${globalFont}`}>
                                                {/* Decorative Quote Mark */}
                                                <span className="absolute -top-6 -left-4 text-[120px] opacity-[0.05] select-none text-brand-primary">“</span>
                                                <p className="relative z-10 italic opacity-80">
                                                    {studyData.summary}
                                                </p>
                                                <span className="absolute -bottom-16 -right-4 text-[120px] opacity-[0.05] select-none text-brand-primary">”</span>
                                            </div>
                                        </div>
                                    )}

                                    {activeView === 'quiz' && (
                                        <div className="p-8 md:p-12 flex-1 flex flex-col h-full max-h-[700px] overflow-y-auto custom-scrollbar relative">
                                            <div className="absolute inset-0 bg-pattern-dots opacity-[0.05]" />

                                            {!showQuizResults ? (
                                                <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full relative z-10">
                                                    <div className="flex items-center justify-between mb-8 pb-6 border-b border-brand-lavender/30">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-14 h-14 bg-brand-lavender text-brand-primary rounded-2xl flex items-center justify-center shadow-inner border border-white"><Zap size={24} /></div>
                                                            <div>
                                                                <h3 className="text-xl font-black text-brand-primary tracking-tight">Smart Check</h3>
                                                                <p className="text-[9px] font-black text-brand-primary opacity-40 uppercase tracking-widest leading-none mt-1">Question {activeQuizIdx + 1} of {studyData.quiz.length}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            {studyData.quiz.map((_, i) => (
                                                                <div key={i} className={`h-2.5 rounded-full transition-all duration-500 shadow-sm ${i === activeQuizIdx ? 'bg-brand-primary w-12' : quizAnswers[i] ? 'bg-brand-primary opacity-30 w-4' : 'bg-brand-lavender w-4'}`} />
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="flex-1 flex flex-col justify-center min-h-0 py-4">
                                                        <motion.div
                                                            key={activeQuizIdx}
                                                            initial={{ opacity: 0, x: 20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            className="flex flex-col"
                                                        >
                                                            <h4 className={`text-xl md:text-2xl font-black text-brand-primary leading-tight mb-10 px-6 border-l-4 border-brand-primary font-${globalFont}`}>
                                                                {studyData.quiz[activeQuizIdx]?.question}
                                                            </h4>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                {studyData.quiz[activeQuizIdx]?.options.map((opt, i) => (
                                                                    <motion.button
                                                                        key={i}
                                                                        whileHover={{ scale: 1.02 }}
                                                                        whileTap={{ scale: 0.98 }}
                                                                        onClick={() => setQuizAnswers({ ...quizAnswers, [activeQuizIdx]: opt })}
                                                                        className={`p-5 rounded-[20px] font-black text-left text-base transition-all border-2 flex items-center gap-4 group ${quizAnswers[activeQuizIdx] === opt ? 'bg-brand-primary text-white border-brand-primary shadow-lg scale-[1.02]' : 'bg-white/60 text-brand-primary opacity-60 border-brand-lavender hover:border-brand-primary/40 hover:opacity-100 hover:bg-white'}`}
                                                                    >
                                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold border-2 transition-colors flex-shrink-0 ${quizAnswers[activeQuizIdx] === opt ? 'bg-white/20 text-white border-white/40' : 'bg-brand-lavender text-brand-primary border-white shadow-sm group-hover:bg-white'}`}>
                                                                            {String.fromCharCode(65 + i)}
                                                                        </div>
                                                                        <span className="flex-1 text-left leading-snug">{opt}</span>
                                                                    </motion.button>
                                                                ))}
                                                            </div>
                                                        </motion.div>
                                                    </div>

                                                    <div className="mt-8 pt-6 border-t border-brand-lavender/30 flex justify-between items-center">
                                                        <button
                                                            onClick={() => setActiveQuizIdx(prev => Math.max(0, prev - 1))}
                                                            className="px-6 py-3 rounded-xl font-black text-[10px] text-brand-primary opacity-30 hover:opacity-100 transition-all uppercase tracking-widest disabled:opacity-0"
                                                            disabled={activeQuizIdx === 0}
                                                        >
                                                            PREVIOUS
                                                        </button>
                                                        {activeQuizIdx === studyData.quiz.length - 1 ? (
                                                            <motion.button
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                                onClick={() => setShowQuizResults(true)}
                                                                disabled={Object.keys(quizAnswers).length < studyData.quiz.length}
                                                                className="bg-brand-primary text-white px-10 py-4 rounded-[20px] font-black shadow-lg hover:shadow-brand-primary/20 transition-all text-sm disabled:opacity-20 uppercase tracking-widest"
                                                            >
                                                                See Results
                                                            </motion.button>
                                                        ) : (
                                                            <motion.button
                                                                whileHover={{ x: 5 }}
                                                                onClick={() => setActiveQuizIdx(prev => prev + 1)}
                                                                disabled={!quizAnswers[activeQuizIdx]}
                                                                className="bg-brand-primary text-white px-10 py-4 rounded-[20px] font-black shadow-lg hover:shadow-brand-primary/20 transition-all text-sm flex items-center gap-3 disabled:opacity-20 uppercase tracking-widest"
                                                            >
                                                                Next <ArrowLeft className="rotate-180" size={16} />
                                                            </motion.button>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex-1 flex flex-col p-10 max-w-4xl mx-auto w-full relative z-10 overflow-y-auto custom-scrollbar">
                                                    <div className="flex flex-col items-center text-center mb-12">
                                                        <motion.div
                                                            initial={{ scale: 0, rotate: -20 }}
                                                            animate={{ scale: 1, rotate: 0 }}
                                                            className="text-8xl mb-6 drop-shadow-2xl"
                                                        >
                                                            {studyData.quiz.reduce((acc, q, i) => acc + (quizAnswers[i] === q.answer ? 1 : 0), 0) === studyData.quiz.length ? '🏆' : '⭐'}
                                                        </motion.div>
                                                        <h4 className="text-4xl font-black mb-2 text-brand-primary">
                                                            {studyData.quiz.reduce((acc, q, i) => acc + (quizAnswers[i] === q.answer ? 1 : 0), 0) === studyData.quiz.length ? 'Perfect Score!' : 'Great Effort!'}
                                                        </h4>
                                                        <p className="text-xs text-brand-primary opacity-40 font-bold uppercase tracking-[0.3em] mb-4">
                                                            YOU SCORED {studyData.quiz.reduce((acc, q, i) => acc + (quizAnswers[i] === q.answer ? 1 : 0), 0)} OUT OF {studyData.quiz.length}
                                                        </p>
                                                    </div>

                                                    <div className="space-y-4 mb-12">
                                                        {studyData.quiz.map((q, i) => {
                                                            const isCorrect = quizAnswers[i] === q.answer;
                                                            return (
                                                                <div key={i} className={`p-6 rounded-[30px] border-2 transition-all ${isCorrect ? 'bg-green-50/50 border-green-100' : 'bg-red-50/50 border-red-100'}`}>
                                                                    <div className="flex items-start gap-4">
                                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                                                            {isCorrect ? <CheckCircle size={16} /> : <X size={16} />}
                                                                        </div>
                                                                        <div className="flex-1 text-left">
                                                                            <p className={`text-base font-black text-brand-primary mb-3 font-${globalFont}`}>{q.question}</p>
                                                                            <div className="flex flex-col gap-2">
                                                                                <div className="flex items-center gap-2">
                                                                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-30">Your Answer:</span>
                                                                                    <span className={`text-sm font-black ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>{quizAnswers[i]}</span>
                                                                                </div>
                                                                                {!isCorrect && (
                                                                                    <div className="flex items-center gap-2">
                                                                                        <span className="text-[10px] font-black uppercase tracking-widest opacity-30">Correct Answer:</span>
                                                                                        <span className="text-sm font-black text-green-600">{q.answer}</span>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>

                                                    <button
                                                        onClick={() => { setShowQuizResults(false); setActiveQuizIdx(0); setQuizAnswers({}); }}
                                                        className="px-12 py-5 rounded-[25px] bg-brand-primary text-white text-base font-black shadow-xl hover:scale-105 active:scale-95 transition-all self-center"
                                                    >
                                                        TRY AGAIN
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {activeView === 'keywords' && (
                                        <div className="p-8 md:p-12 flex-1 relative overflow-hidden">
                                            <div className="absolute inset-0 bg-pattern-grid opacity-10" />

                                            <div className="flex flex-col items-center text-center gap-4 mb-14 relative z-10">
                                                <div className="w-20 h-20 bg-brand-lavender text-brand-primary rounded-[30px] flex items-center justify-center shadow-inner border border-white">
                                                    <Tag size={32} />
                                                </div>
                                                <div>
                                                    <h3 className="text-3xl font-black text-brand-primary tracking-tight">Power Words</h3>
                                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary opacity-40">MASTER THESE IMPORTANT TERMS</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto relative z-10">
                                                {studyData.keywords.map((kw, i) => (
                                                    <motion.div
                                                        key={i}
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: i * 0.1 }}
                                                        whileHover={{ y: -5, scale: 1.02 }}
                                                        className="p-8 bg-white/60 backdrop-blur-md rounded-[40px] border-2 border-white shadow-sm flex flex-col gap-4 group relative transition-all duration-500"
                                                    >
                                                        <div className={`text-lg font-black text-brand-primary flex items-center gap-3 font-${globalFont}`}>
                                                            <div className="w-2.5 h-2.5 rounded-full bg-brand-primary shadow-sm group-hover:scale-125 transition-transform" />
                                                            {kw.term}
                                                        </div>
                                                        <div className="text-sm text-brand-primary opacity-80 font-medium leading-relaxed bg-brand-lavender/10 p-5 rounded-[20px] border border-white/50">
                                                            {kw.definition}
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {activeView === 'chat' && (
                                        <div className="flex flex-col h-full bg-brand-lavender/5 overflow-hidden">
                                            {/* Chat Header */}
                                            <div className="p-6 border-b border-brand-lavender/30 bg-white/40 backdrop-blur-md flex items-center justify-between transition-colors duration-500">
                                                <div className="flex items-center gap-4">
                                                    <BuddyAvatar state={chatLoading ? 'thinking' : buddyState} size="md" />
                                                    <div className="flex flex-col">
                                                        <h3 className="text-xl font-black text-brand-primary tracking-tight">Study Buddy</h3>
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                                            <span className="text-[9px] text-brand-primary opacity-40 font-black uppercase tracking-[0.2em]">LIVE COACH</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Messages Area */}
                                            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                                                {messages.map((m, i) => (
                                                    <motion.div
                                                        key={i}
                                                        initial={{ opacity: 0, x: m.role === 'ai' ? -20 : 20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        className={`flex ${m.role === 'ai' ? 'justify-start' : 'justify-end'}`}
                                                    >
                                                        <div className={`
                                                            max-w-[85%] p-6 rounded-[30px] font-black text-lg leading-relaxed shadow-sm transition-all duration-500 font-${globalFont}
                                                            ${m.role === 'ai'
                                                                ? 'bg-white text-brand-primary rounded-bl-sm border border-brand-lavender'
                                                                : 'bg-brand-primary text-white rounded-br-sm shadow-md'
                                                            }
                                                        `}>
                                                            {m.content}
                                                        </div>
                                                    </motion.div>
                                                ))}
                                                {chatLoading && (
                                                    <div className="flex justify-start">
                                                        <div className="bg-white/60 backdrop-blur-sm px-6 py-4 rounded-[25px] shadow-sm flex items-center gap-3 text-brand-primary opacity-40 font-black italic text-sm border border-brand-lavender/30">
                                                            <Loader2 size={16} className="animate-spin" /> Thinking...
                                                        </div>
                                                    </div>
                                                )}
                                                <div ref={chatEndRef} />
                                            </div>

                                            {/* Input Area */}
                                            <div className="p-6 bg-white/60 border-t border-brand-lavender/30 backdrop-blur-xl">
                                                <div className="flex gap-3 bg-white p-3 rounded-[30px] shadow-lg border-2 border-brand-lavender/50 focus-within:border-brand-primary transition-all max-w-4xl mx-auto items-center">
                                                    <input
                                                        value={chatInput}
                                                        onChange={(e) => setChatInput(e.target.value)}
                                                        onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
                                                        placeholder="Ask me anything about the chapter..."
                                                        className={`flex-1 px-5 py-2 bg-transparent focus:outline-none text-lg font-black placeholder:text-brand-primary/20 text-brand-primary font-${globalFont}`}
                                                    />
                                                    <motion.button
                                                        whileHover={{ scale: 1.05, rotate: 5 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={sendChatMessage}
                                                        disabled={!chatInput.trim() || chatLoading}
                                                        className="bg-brand-primary text-white w-12 h-12 rounded-[20px] flex items-center justify-center hover:bg-slate-800 transition-all shadow-md disabled:opacity-20 flex-shrink-0"
                                                    >
                                                        <Send size={18} />
                                                    </motion.button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    )}
                </AnimatePresence>
            </main>
        </div >
    );
};

export default HomeworkHelp;
