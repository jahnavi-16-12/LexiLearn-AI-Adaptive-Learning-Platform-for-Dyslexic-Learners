import React, { useState, useEffect, useRef } from 'react';
import AgentFeedback from './AgentFeedback';
import { useTheme } from '../context/ThemeContext';
import Avatar from './Avatar';

const LevelPlayer = ({ user, level, onComplete, onBack }) => {
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isListening, setIsListening] = useState(false);
    const [transcription, setTranscription] = useState("");
    const [feedbackData, setFeedbackData] = useState(null);
    const [showFeedback, setShowFeedback] = useState(false);

    const [chatOpen, setChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState("");

    const [activeWordIdx, setActiveWordIdx] = useState(-1);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const mediaRecorderRef = useRef(null);
    const startTimeRef = useRef(null);
    const { theme } = useTheme();

    const getIslandTheme = (island) => {
        switch (island) {
            case 'Beginner':
                return {
                    bg: 'from-green-100 via-green-50 to-yellow-50',
                    textBg: theme === 'cream' ? 'bg-[#FEF9EE]' : theme === 'yellow' ? 'bg-yellow-50' : 'bg-gray-50',
                    panelBg: 'bg-white/95',
                    accent: 'border-green-300',
                    decorations: ['🌳', '🌲', '🌿', '🦋', '🌻', '🍃'],
                    emoji: '🌱'
                };
            case 'Intermediate':
                return {
                    bg: 'from-blue-100 via-blue-50 to-cyan-50',
                    textBg: theme === 'cream' ? 'bg-[#FEF9EE]' : theme === 'yellow' ? 'bg-yellow-50' : 'bg-gray-50',
                    panelBg: 'bg-white/95',
                    accent: 'border-blue-300',
                    decorations: ['🌊', '🐚', '🐠', '⛵', '🏝️', '🦀'],
                    emoji: '🌊'
                };
            case 'Advanced':
                return {
                    bg: 'from-purple-100 via-purple-50 to-pink-50',
                    textBg: theme === 'cream' ? 'bg-[#FEF9EE]' : theme === 'yellow' ? 'bg-yellow-50' : 'bg-gray-50',
                    panelBg: 'bg-white/95',
                    accent: 'border-purple-300',
                    decorations: ['⛰️', '🏔️', '🦅', '⭐', '🌙', '☁️'],
                    emoji: '⛰️'
                };
            default:
                return {
                    bg: 'from-slate-100 to-slate-50',
                    textBg: 'bg-white',
                    panelBg: 'bg-white/95',
                    accent: 'border-slate-300',
                    decorations: ['✨'],
                    emoji: '📚'
                };
        }
    };

    useEffect(() => {
        fetchLevelContent();
        return () => window.speechSynthesis.cancel();
    }, [level]);

    const fetchLevelContent = async () => {
        setLoading(true);
        try {
            console.log(`LevelPlayer: Fetching Level ${level} for user ${user.id}`);
            const res = await fetch(`http://localhost:8000/api/ai/level?user_id=${user.id}&level=${level}`);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const data = await res.json();
            console.log("LevelPlayer: Data received:", data);

            setContent({
                ...data,
                words: data.content ? data.content.split(/\s+/) : []
            });
            setShowFeedback(false);
            setFeedbackData(null);
            setTranscription("");
            const initialHelp = data.focus_sounds
                ? `Hi! Ready for Level ${level}? Look out for "${data.focus_sounds[0]}" sounds!`
                : `Hi! Ready for Level ${level}? Click the mic when you're ready to read!`;
            setChatMessages([{ role: 'ai', content: initialHelp }]);
        } catch (e) {
            console.error("LevelPlayer: Fetch error:", e);
            setTranscription("Error loading level content.");
        } finally {
            setLoading(false);
        }
    };

    const speak = (text, cute = false) => {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.pitch = cute ? 1.4 : 1.0;
        utterance.rate = cute ? 1.1 : 0.8;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            let chunks = [];

            mediaRecorderRef.current.ondataavailable = e => chunks.push(e.data);
            mediaRecorderRef.current.onstop = () => handleProcessAudio(chunks);

            mediaRecorderRef.current.start();
            startTimeRef.current = Date.now();
            setIsListening(true);
            setTranscription("Listening...");
            setShowFeedback(false);
        } catch (err) {
            alert("Microphone access needed! 🎤");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current?.state !== 'inactive') {
            mediaRecorderRef.current.stop();
            setIsListening(false);
        }
    };

    const handleProcessAudio = async (chunks) => {
        const duration = (Date.now() - startTimeRef.current) / 1000;
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('file', blob, 'reading.webm');
        formData.append('expected_text', content.content);
        formData.append('user_id', user.id);
        formData.append('level', level);
        formData.append('duration_seconds', duration);

        setTranscription("Thinking...");

        try {
            const res = await fetch('http://localhost:8000/api/process-audio', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();

            if (data.status === 'success') {
                setTranscription(data.transcribed_text);
                const accuracy = 100 - data.wer;

                const feedbackRes = await fetch('http://localhost:8000/api/ai/feedback', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_id: user.id,
                        level: level,
                        text: content.content,
                        child_reading: data.transcribed_text,
                        accuracy: accuracy,
                        wpm: data.wpm,
                        errors: [],
                        island: content.island
                    })
                });
                const aiData = await feedbackRes.json();

                let unlocked = false;
                let stars = 0;

                if (accuracy >= 85) {
                    const completeRes = await fetch('http://localhost:8000/api/user/complete-level', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            user_id: user.id,
                            level: level,
                            accuracy: accuracy,
                            wpm: data.wpm
                        })
                    });
                    const completeData = await completeRes.json();
                    unlocked = completeData.unlocked;
                    stars = completeData.stars;

                    // Progression and history recording are now handled by the backend /complete-level endpoint
                }

                setFeedbackData({
                    stars: stars,
                    accuracy: accuracy,
                    wpm: data.wpm,
                    feedback: aiData.feedback,
                    unlocked: unlocked
                });
                setShowFeedback(true);

            } else {
                setTranscription("Oops, didn't catch that.");
            }
        } catch (e) {
            console.error("Processing error:", e);
            setTranscription("Error processing audio.");
        }
    };

    const handleChatSend = async () => {
        if (!chatInput.trim()) return;
        const msg = chatInput;
        setChatInput("");
        setChatMessages(prev => [...prev, { role: 'user', content: msg }]);

        try {
            const res = await fetch('http://localhost:8000/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.id,
                    message: msg,
                    history: chatMessages,
                    plan: {
                        current_level: level,
                        mode: "reading_practice",
                        current_sentence: content.content,
                        island: content.island,
                        focus: content.focus_sounds ? content.focus_sounds[0] : ""
                    }
                })
            });
            const data = await res.json();
            setChatMessages(prev => [...prev, { role: 'ai', content: data.response }]);
            speak(data.response, true);
        } catch (e) {
            setChatMessages(prev => [...prev, { role: 'ai', content: "I'm here to help! Try sounding out each letter." }]);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-2xl font-black text-brand-primary animate-pulse flex flex-col items-center gap-4">
                <span className="text-6xl">🏃</span>
                Loading Level {level}...
            </div>
        </div>
    );

    if (!content) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center">
                <div className="text-6xl mb-4">⚠️</div>
                <h2 className="text-2xl font-black text-slate-800 mb-2">Adventure Paused</h2>
                <p className="text-slate-500 mb-8">We couldn't load this level right now.</p>
                <button onClick={onBack} className="bg-brand-primary text-white px-8 py-3 rounded-2xl font-bold">
                    Return to Map
                </button>
            </div>
        </div>
    );

    const islandTheme = getIslandTheme(content?.island);

    return (
        <div className={`min-h-screen relative overflow-hidden transition-all duration-500 ${chatOpen ? 'pr-0 md:pr-[400px]' : ''}`}>

            {/* Themed Environment Backgrounds - NO TRANSPARENCY */}
            {content?.island === 'Beginner' && (
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 via-green-50 to-lime-100 z-0">
                    {/* Sky gradient */}
                    <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-sky-200/60 to-transparent"></div>

                    {/* Rolling hills - bottom layer */}
                    <div className="absolute bottom-0 left-0 w-full h-2/5">
                        <svg className="w-full h-full" viewBox="0 0 1200 400" preserveAspectRatio="none">
                            <path d="M0,200 Q300,120 600,180 T1200,200 L1200,400 L0,400 Z" fill="#86efac" opacity="0.6" />
                            <path d="M0,250 Q400,180 800,220 T1200,260 L1200,400 L0,400 Z" fill="#4ade80" opacity="0.5" />
                            <path d="M0,300 Q300,240 600,280 T1200,320 L1200,400 L0,400 Z" fill="#22c55e" opacity="0.7" />
                        </svg>
                    </div>

                    {/* Decorative elements - with better positioning */}
                    <div className="absolute top-16 left-[5%] text-7xl opacity-40 animate-float" style={{ animationDelay: '0s' }}>🌳</div>
                    <div className="absolute top-32 right-[10%] text-6xl opacity-35 animate-float" style={{ animationDelay: '1s' }}>🌲</div>
                    <div className="absolute bottom-[45%] left-[15%] text-5xl opacity-50 animate-float" style={{ animationDelay: '2s' }}>🦋</div>
                    <div className="absolute bottom-[35%] right-[20%] text-4xl opacity-45 animate-float" style={{ animationDelay: '3s' }}>🌻</div>
                    <div className="absolute top-[40%] left-[80%] text-5xl opacity-40 animate-float" style={{ animationDelay: '1.5s' }}>🍄</div>
                    <div className="absolute top-[25%] left-[45%] text-3xl opacity-30 animate-float" style={{ animationDelay: '2.5s' }}>🦌</div>
                </div>
            )}

            {content?.island === 'Intermediate' && (
                <div className="absolute inset-0 bg-gradient-to-br from-sky-200 via-blue-100 to-cyan-100 z-0">
                    {/* Ocean waves - multiple layers */}
                    <div className="absolute bottom-0 left-0 w-full h-3/5">
                        <svg className="w-full h-full" viewBox="0 0 1200 500" preserveAspectRatio="none">
                            {/* Deep water */}
                            <path d="M0,200 Q300,150 600,180 T1200,200 L1200,500 L0,500 Z" fill="#3b82f6" opacity="0.5" />
                            {/* Mid water with waves */}
                            <path d="M0,280 Q200,240 400,260 Q600,280 800,250 Q1000,220 1200,260 L1200,500 L0,500 Z" fill="#60a5fa" opacity="0.6" />
                            {/* Surface waves */}
                            <path d="M0,350 Q150,320 300,340 Q450,360 600,330 Q750,300 900,330 Q1050,360 1200,340 L1200,500 L0,500 Z" fill="#93c5fd" opacity="0.7" />
                        </svg>
                    </div>

                    {/* Sky with clouds */}
                    <div className="absolute top-10 left-[10%] text-6xl opacity-30">☁️</div>
                    <div className="absolute top-24 right-[15%] text-7xl opacity-25">☁️</div>
                    <div className="absolute top-16 left-[60%] text-5xl opacity-20">☁️</div>

                    {/* Ocean decorations */}
                    <div className="absolute top-[30%] left-[8%] text-6xl opacity-45 animate-float" style={{ animationDelay: '0s' }}>⛵</div>
                    <div className="absolute bottom-[40%] right-[12%] text-5xl opacity-50 animate-float" style={{ animationDelay: '1.5s' }}>🏝️</div>
                    <div className="absolute bottom-[25%] left-[25%] text-4xl opacity-40" style={{ animationDelay: '2s' }}>🐚</div>
                    <div className="absolute bottom-[30%] right-[35%] text-5xl opacity-35 animate-float" style={{ animationDelay: '3s' }}>🌴</div>
                    <div className="absolute top-[45%] right-[70%] text-3xl opacity-45">⚓</div>
                </div>
            )}

            {content?.island === 'Advanced' && (
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-200 via-purple-100 to-pink-100 z-0">
                    {/* Mountain peaks */}
                    <div className="absolute bottom-0 left-0 w-full h-3/5">
                        <svg className="w-full h-full" viewBox="0 0 1200 500" preserveAspectRatio="none">
                            {/* Distant mountains */}
                            <path d="M0,400 L200,200 L400,350 L600,180 L800,300 L1000,220 L1200,380 L1200,500 L0,500 Z" fill="#a78bfa" opacity="0.4" />
                            {/* Mid mountains */}
                            <path d="M0,450 L150,280 L350,400 L550,250 L750,380 L950,300 L1150,420 L1200,500 L0,500 Z" fill="#8b5cf6" opacity="0.5" />
                            {/* Foreground mountains */}
                            <path d="M0,480 L250,350 L450,480 L700,320 L900,450 L1200,400 L1200,500 L0,500 Z" fill="#7c3aed" opacity="0.6" />
                        </svg>
                    </div>

                    {/* Sky and atmospheric elements */}
                    <div className="absolute top-0 left-0 w-full h-2/5 bg-gradient-to-b from-purple-200/40 to-transparent"></div>

                    {/* Clouds floating */}
                    <div className="absolute top-12 left-[5%] text-7xl opacity-35 animate-float" style={{ animationDelay: '0s' }}>☁️</div>
                    <div className="absolute top-28 right-[8%] text-8xl opacity-30 animate-float" style={{ animationDelay: '2s' }}>☁️</div>
                    <div className="absolute top-[35%] left-[70%] text-6xl opacity-25 animate-float" style={{ animationDelay: '4s' }}>☁️</div>

                    {/* Mountain decorations */}
                    <div className="absolute top-[25%] right-[15%] text-5xl opacity-40 animate-float" style={{ animationDelay: '1s' }}>🦅</div>
                    <div className="absolute bottom-[45%] left-[20%] text-6xl opacity-35">🏰</div>
                    <div className="absolute top-20 left-[40%] text-4xl opacity-30 animate-float" style={{ animationDelay: '3s' }}>⭐</div>
                    <div className="absolute top-[40%] right-[50%] text-3xl opacity-25 animate-float" style={{ animationDelay: '2.5s' }}>❄️</div>
                </div>
            )}

            {/* Main Content */}
            <div className="relative z-10 p-4 md:p-8 max-w-7xl mx-auto h-full flex flex-col min-h-screen">
                {/* Header */}
                <div className="flex justify-between items-center bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-md mb-8 border border-slate-200">
                    <button onClick={onBack} className="bg-slate-50 px-6 py-2.5 rounded-xl font-bold hover:bg-slate-100 transition-all text-slate-600 border border-slate-200 flex items-center gap-2">
                        <span>⬅️</span> Map
                    </button>
                    <div className="flex items-center gap-5">
                        <Avatar variant="lexi" size="sm" className="border-2 border-white shadow-sm" />
                        <div className="flex flex-col items-center">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">LEVEL</span>
                            <span className="text-3xl font-bold text-brand-primary leading-none">{level}</span>
                        </div>
                    </div>
                    <div className="bg-brand-primary text-white px-6 py-2.5 rounded-xl font-bold shadow-md">
                        {content.island.toUpperCase()}
                    </div>
                </div>

                {/* Parchment Reading Card */}
                <div className={`flex-1 flex flex-col items-center justify-center mb-8 relative ${showFeedback ? 'mt-32' : ''} transition-all duration-300`}>

                    {/* Inline Feedback Popup */}
                    {showFeedback && (
                        <AgentFeedback
                            show={showFeedback}
                            data={feedbackData}
                            onNext={() => {
                                setShowFeedback(false);
                                onComplete(level + 1);
                            }}
                            onRetry={() => {
                                setShowFeedback(false);
                                setTranscription("");
                            }}
                        />
                    )}

                    {/* Story Parchment Container */}
                    <div className={`
                        w-full max-w-4xl mx-auto
                        bg-gradient-to-br from-amber-50 via-white to-amber-50/50
                        rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.12)]
                        border-2 ${islandTheme.accent}
                        p-8 md:p-12
                        relative
                        animate-fade-in
                        ${!showFeedback ? 'backdrop-blur-sm' : ''}
                    `}>
                        {/* Parchment texture overlay */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(251,191,36,0.05),transparent),radial-gradient(circle_at_80%_10%,rgba(251,191,36,0.03),transparent)] rounded-3xl pointer-events-none"></div>

                        {/* Inner shadow for depth */}
                        <div className="absolute inset-0 rounded-3xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] pointer-events-none"></div>

                        {/* Sentence Content */}
                        <div className="relative z-10 text-center font-dyslexic text-3xl md:text-5xl leading-[1.7] text-slate-800 flex flex-wrap justify-center gap-x-4 gap-y-3 max-w-4xl mx-auto tracking-normal">
                            {content.words.map((word, i) => (
                                <span
                                    key={i}
                                    onClick={() => { setActiveWordIdx(i); speak(word); setTimeout(() => setActiveWordIdx(-1), 800); }}
                                    className={`cursor-pointer px-3 py-1 rounded-lg transition-all duration-200 
                                        ${activeWordIdx === i
                                            ? 'bg-brand-yellow scale-105 shadow-md font-semibold border border-yellow-400'
                                            : 'hover:scale-102 border border-transparent hover:bg-amber-100/50'
                                        }
                                    `}
                                >
                                    {word}
                                </span>
                            ))}
                        </div>

                        {/* Transcription Feedback */}
                        {transcription && !showFeedback && (
                            <div className={`relative z-10 mt-8 text-xl text-slate-600 font-dyslexic italic bg-white/70 px-6 py-3 rounded-xl border ${islandTheme.accent} shadow-sm animate-fade-in`}>
                                "{transcription}"
                            </div>
                        )}
                    </div>
                </div>

                {/* Floating Control Bar */}
                <div className="relative z-20 pb-8 sticky bottom-0">
                    <div className="max-w-2xl mx-auto bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200 p-4 flex justify-center items-center gap-6">
                        {/* Left: Audio Button */}
                        <button
                            onClick={() => speak(content.content)}
                            className={`w-14 h-14 rounded-full bg-slate-50 text-2xl shadow-sm flex items-center justify-center hover:bg-slate-100 hover:shadow-md transition-all border border-slate-200 active:scale-95 group relative ${isSpeaking ? 'ring-4 ring-brand-primary/20' : ''}`}
                            title="Listen"
                        >
                            🔊
                            {isSpeaking && (
                                <span className="absolute inset-0 rounded-full border-4 border-brand-primary/30 animate-ping"></span>
                            )}
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                                Listen
                            </div>
                        </button>

                        {/* Center: READ Button (Primary CTA) */}
                        <button
                            onClick={isListening ? stopRecording : startRecording}
                            className={`
                                h-16 px-12 md:px-16 rounded-2xl flex items-center gap-3 text-xl font-bold shadow-md transition-all transform active:scale-95
                                ${isListening
                                    ? 'bg-red-500 text-white border-2 border-red-400'
                                    : 'bg-gradient-to-r from-brand-primary to-blue-500 text-white hover:shadow-lg border-2 border-blue-400 animate-breathe'
                                }
                            `}
                        >
                            {isListening ? (
                                <>
                                    <span className="text-2xl">⏺</span> STOP
                                </>
                            ) : (
                                <>
                                    <span className="text-3xl">🎙️</span> READ
                                </>
                            )}
                        </button>

                        {/* Right: AI Coach Button */}
                        <button
                            onClick={() => setChatOpen(true)}
                            className="w-14 h-14 bg-gradient-to-br from-brand-primary to-blue-500 rounded-full shadow-sm flex items-center justify-center hover:shadow-md transition-all border-2 border-white active:scale-95 relative group text-2xl"
                            title="AI Coach"
                        >
                            <span className="animate-bounce-slow">🤖</span>
                            {!chatOpen && (
                                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm animate-pulse">
                                    ?
                                </span>
                            )}
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                                Coach
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Left Side Chat Panel */}
            <div className={`fixed inset-y-0 right-0 w-full md:w-[400px] bg-white shadow-2xl z-50 transform transition-transform duration-500 ease-out ${chatOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="h-full flex flex-col">
                    <div className="bg-gradient-to-r from-brand-primary to-blue-600 p-6 flex justify-between items-center shadow-lg">
                        <div className="flex items-center gap-4">
                            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                                <span className="text-4xl">🤖</span>
                            </div>
                            <div>
                                <h3 className="text-white font-black text-xl tracking-tight">AI Coach</h3>
                                <p className="text-blue-100 text-sm font-medium">Level {level} Helper</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setChatOpen(false)}
                            className="bg-white/10 hover:bg-white/20 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 scroll-smooth">
                        {chatMessages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'ai' ? 'justify-start' : 'justify-end'} animate-slide-up`}>
                                {m.role === 'ai' && <span className="text-2xl mr-2 self-end">🤖</span>}
                                <div className={`px-5 py-3 rounded-2xl max-w-[85%] font-dyslexic text-[17px] leading-relaxed shadow-sm ${m.role === 'ai'
                                    ? 'bg-white text-slate-700 rounded-bl-sm border border-slate-100'
                                    : 'bg-brand-primary text-white rounded-br-sm'
                                    }`}>
                                    {m.content}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-4 bg-white border-t border-slate-100 safe-bottom">
                        <div className="flex gap-2 bg-slate-100 p-2 rounded-2xl border border-slate-200 focus-within:ring-2 focus-within:ring-brand-primary/50 transition-all">
                            <input
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleChatSend()}
                                className="flex-1 bg-transparent px-3 py-2 focus:outline-none font-dyslexic text-lg text-slate-800 placeholder:text-slate-400"
                                placeholder="Ask for help..."
                            />
                            <button
                                onClick={handleChatSend}
                                disabled={!chatInput.trim()}
                                className="bg-brand-primary disabled:bg-slate-300 text-white w-12 h-12 rounded-xl flex items-center justify-center font-bold hover:scale-105 active:scale-95 transition-all shadow-md"
                            >
                                ➤
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Backdrop for chat on mobile */}
            {chatOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setChatOpen(false)}
                ></div>
            )}
        </div>
    );
};

export default LevelPlayer;
