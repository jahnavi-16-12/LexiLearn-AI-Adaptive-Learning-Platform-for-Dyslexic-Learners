import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import AccessibilityPanel from '../components/AccessibilityPanel';

// ----------------------------------------------------
// 1. RESEARCH DATA (Expanded for Validity)
// ----------------------------------------------------
const TESTS = [
    { id: 'welcome', title: "Welcome" },
    { id: 'phoneme', title: "Sound Match", duration: 45 },
    { id: 'rhyme', title: "Rhyme Time", duration: 45 },
    { id: 'naming', title: "Fast Naming", duration: 60 },
    { id: 'letters', title: "Letter Sounds", duration: 60 },
    { id: 'reading', title: "Read Aloud", duration: 90 },
    { id: 'results', title: "Results" }
];

const PHONEME_QUESTIONS = [
    { id: 'ph1', target: 'Cat', sound: '/k/', options: [{ text: 'Dog', correct: false }, { text: 'Car', correct: true }, { text: 'Ball', correct: false }] },
    { id: 'ph2', target: 'Fish', sound: '/f/', options: [{ text: 'Fan', correct: true }, { text: 'Hat', correct: false }, { text: 'Pig', correct: false }] },
    { id: 'ph3', target: 'Sun', sound: '/s/', options: [{ text: 'Sock', correct: true }, { text: 'Bed', correct: false }, { text: 'Cup', correct: false }] },
    { id: 'ph4', target: 'Bed', sound: '/b/', options: [{ text: 'Box', correct: true }, { text: 'Fox', correct: false }, { text: 'Net', correct: false }] },
    { id: 'ph5', target: 'Man', sound: '/m/', options: [{ text: 'Map', correct: true }, { text: 'Zap', correct: false }, { text: 'Tap', correct: false }] },
    { id: 'ph6', target: 'Dog', sound: '/d/', options: [{ text: 'Dig', correct: true }, { text: 'Pig', correct: false }, { text: 'Wig', correct: false }] },
    { id: 'ph7', target: 'Pig', sound: '/p/', options: [{ text: 'Pen', correct: true }, { text: 'Ten', correct: false }, { text: 'Hen', correct: false }] },
    { id: 'ph8', target: 'Hat', sound: '/h/', options: [{ text: 'Hop', correct: true }, { text: 'Mop', correct: false }, { text: 'Top', correct: false }] },
    { id: 'ph9', target: 'Net', sound: '/n/', options: [{ text: 'Nut', correct: true }, { text: 'Cut', correct: false }, { text: 'But', correct: false }] },
    { id: 'ph10', target: 'Zip', sound: '/z/', options: [{ text: 'Zoo', correct: true }, { text: 'Boo', correct: false }, { text: 'Too', correct: false }] },
];

const RHYME_QUESTIONS = [
    { id: 'rh1', target: 'Cat', options: [{ text: 'Hat', correct: true }, { text: 'Dog', correct: false }, { text: 'Fish', correct: false }] },
    { id: 'rh2', target: 'Star', options: [{ text: 'Car', correct: true }, { text: 'Moon', correct: false }, { text: 'Sun', correct: false }] },
    { id: 'rh3', target: 'Bed', options: [{ text: 'Red', correct: true }, { text: 'Blue', correct: false }, { text: 'Green', correct: false }] },
    { id: 'rh4', target: 'Pig', options: [{ text: 'Wig', correct: true }, { text: 'Big', correct: true }, { text: 'Dog', correct: false }] },
    { id: 'rh5', target: 'Sun', options: [{ text: 'Run', correct: true }, { text: 'Sky', correct: false }, { text: 'Day', correct: false }] },
    { id: 'rh6', target: 'Moon', options: [{ text: 'Spoon', correct: true }, { text: 'Stars', correct: false }, { text: 'Night', correct: false }] },
    { id: 'rh7', target: 'Coat', options: [{ text: 'Boat', correct: true }, { text: 'Tie', correct: false }, { text: 'Sock', correct: false }] },
    { id: 'rh8', target: 'Tree', options: [{ text: 'Bee', correct: true }, { text: 'Leaf', correct: false }, { text: 'Root', correct: false }] },
    { id: 'rh9', target: 'Wall', options: [{ text: 'Ball', correct: true }, { text: 'Door', correct: false }, { text: 'Window', correct: false }] },
    { id: 'rh10', target: 'Lake', options: [{ text: 'Cake', correct: true }, { text: 'Fish', correct: false }, { text: 'Swim', correct: false }] },
];

const NAMING_ITEMS = [
    '🍎', '⚽', '🐱', '🐶', '🚗', '🍌',
    '🍎', '⚽', '🐱', '🐶', '🚗', '🍌',
    '🍎', '⚽', '🐱', '🐶', '🚗', '🍌',
    '🍎', '⚽', '🐱', '🐶', '🚗', '🍌',
    '🍎', '⚽', '🐱', '🐶', '🚗', '🍌'
]; // 30 items

const LETTER_ITEMS = [
    'm', 's', 'a', 't', 'p', 'b', 'c', 'd', 'e', 'f',
    'g', 'h', 'i', 'j', 'k', 'l', 'n', 'o', 'r', 'u'
]; // 20 items

const READING_SENTENCES = [
    "The cat sat on the mat.",
    "Sam has a red ball.",
    "I can see the big dog."
];

// ----------------------------------------------------
// 2. MAIN COMPONENT
// ----------------------------------------------------
function Screening() {
    const navigate = useNavigate();
    const [stage, setStage] = useState('welcome');
    const [currentQIdx, setCurrentQIdx] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [finalResult, setFinalResult] = useState(null);

    // Scores State
    const [scores, setScores] = useState({
        phoneme: 0,
        rhyme: 0,
        naming_time: 0,
        letter_score: 0,
        reading_wpm: 0,
        reading_wer: 100
    });

    // Timer & Recording
    const [timeLeft, setTimeLeft] = useState(0);
    const timerRef = useRef(null);
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const stageStartTimeRef = useRef(0);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    // --------------------------------------------------
    // 3. LOGIC HANDLERS
    // --------------------------------------------------
    const startStage = (newStage) => {
        // If ending a timer stage, record elapsed time for naming
        if (stage === 'naming') {
            const elapsed = 60 - timeLeft;
            setScores(prev => ({ ...prev, naming_time: elapsed }));
        }

        setStage(newStage);
        setCurrentQIdx(0);
        const stageConfig = TESTS.find(t => t.id === newStage);
        if (stageConfig && stageConfig.duration) {
            startTimer(stageConfig.duration);
        }

        // Auto-stop recording if changing stage
        if (isRecording) stopRecording();
    };

    const startTimer = (seconds) => {
        setTimeLeft(seconds);
        stageStartTimeRef.current = Date.now();
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const recordAnswer = (section, id, isCorrect) => {
        setAnswers(prev => [...prev, { section, id, isCorrect, timestamp: Date.now() }]);
        if (isCorrect) {
            setScores(prev => ({
                ...prev,
                [section]: (prev[section] || 0) + 1
            }));
        }
    };

    const startRecordingStage = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];
            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };
            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) {
            alert("Microphone access is needed for this game! Please enable it.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const processAudioTest = async (nextStage) => {
        setLoading(true);
        stopRecording();

        // In a real app, we might upload after each stage. 
        // For now, we only upload and analyze the LAST stage (Oral Reading)
        // For Naming/Letters, we just assume they were attempted correctly for the demo
        // but in a production app, Whisper would quantify the accuracy of Naming/Letters too.

        if (stage === 'reading') {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { navigate('/login'); return; }

            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const formData = new FormData();
            formData.append("file", audioBlob, `reading_${user.id}_${Date.now()}.webm`);
            formData.append("expected_text", READING_SENTENCES.join(" "));
            formData.append("duration_seconds", (90 - timeLeft).toString());
            formData.append("user_id", user.id);

            try {
                const res = await fetch('http://localhost:8000/api/process-audio', { method: 'POST', body: formData });
                const data = await res.json();

                const updatedScores = {
                    ...scores,
                    reading_wpm: data.wpm,
                    reading_wer: data.wer,
                    audio_url: data.audio_url
                };

                setScores(updatedScores);
                await submitFinalScreening(updatedScores);
            } catch (e) {
                console.error("Audio Process Error:", e);
                await submitFinalScreening(scores);
            }
        } else {
            setLoading(false);
            startStage(nextStage);
        }
    };

    const submitFinalScreening = async (finalScores) => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { navigate('/login'); return; }

            console.log("Submitting final screening data...", finalScores);
            const response = await fetch('http://localhost:8000/api/screening', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.id,
                    answers: answers.map(a => ({ question_id: a.id, answer: 'checked', is_correct: a.isCorrect })),
                    phoneme_score: finalScores.phoneme || 0,
                    rhyme_score: finalScores.rhyme || 0,
                    naming_time: finalScores.naming_time || 0,
                    letter_score: finalScores.letter_score || 0,
                    reading_wpm: finalScores.reading_wpm || 0,
                    reading_wer: finalScores.reading_wer || 0,
                    total_score: 0
                })
            });
            const result = await response.json();
            console.log("Backend Response:", result);

            // Calibrate starting level
            await fetch(`http://localhost:8000/api/user/initialize-level?user_id=${user.id}`, { method: 'POST' });

            setFinalResult(result);
            setStage('results');
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // --------------------------------------------------
    // 4. RENDERERS
    // --------------------------------------------------
    const renderWelcome = () => (
        <div className="text-center animate-fade-in py-8 max-w-3xl mx-auto relative">
            {/* Floating decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        y: [0, -20, 0],
                        rotate: [0, 5, 0]
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute top-10 left-10 text-3xl opacity-15"
                >
                    📚
                </motion.div>
                <motion.div
                    animate={{
                        y: [0, 20, 0],
                        rotate: [0, -5, 0]
                    }}
                    transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.5
                    }}
                    className="absolute top-20 right-10 text-3xl opacity-15"
                >
                    ✏️
                </motion.div>
                <motion.div
                    animate={{
                        y: [0, -15, 0],
                        rotate: [0, 3, 0]
                    }}
                    transition={{
                        duration: 4.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1
                    }}
                    className="absolute bottom-20 left-16 text-2xl opacity-15"
                >
                    🎯
                </motion.div>
                <motion.div
                    animate={{
                        y: [0, 15, 0],
                        rotate: [0, -3, 0]
                    }}
                    transition={{
                        duration: 5.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1.5
                    }}
                    className="absolute bottom-16 right-20 text-2xl opacity-15"
                >
                    ⭐
                </motion.div>
            </div>

            {/* Main content card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative z-10 bg-brand-card rounded-3xl p-8 shadow-xl border-2 border-brand-primary/10"
            >
                {/* Decorative corner accents */}
                <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-brand-primary/20 rounded-tl-3xl"></div>
                <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-brand-primary/20 rounded-br-3xl"></div>

                {/* Icon with pulse animation */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 15,
                        delay: 0.2
                    }}
                    className="relative inline-block mb-4"
                >
                    <div className="w-28 h-28 bg-gradient-to-br from-brand-primary/10 to-brand-primary/5 rounded-3xl mx-auto flex items-center justify-center text-6xl border-2 border-brand-primary/20 shadow-lg relative overflow-hidden">
                        {/* Animated background shimmer */}
                        <motion.div
                            animate={{
                                x: ['-100%', '100%']
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                        />
                        <span className="relative z-10">📋</span>
                    </div>
                    {/* Subtle glow ring */}
                    <motion.div
                        animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.3, 0.1, 0.3]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute inset-0 bg-brand-primary/10 rounded-3xl blur-xl -z-10"
                    />
                </motion.div>

                {/* Title */}
                <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="text-4xl font-black mb-4 tracking-tight leading-tight text-brand-text"
                >
                    Screening Test
                </motion.h1>

                {/* Description */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="text-base text-brand-muted mb-6 font-medium max-w-xl mx-auto leading-relaxed"
                >
                    A quick assessment to help us find your perfect starting level and personalize your learning journey.
                </motion.p>

                {/* Feature highlights */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="grid grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto"
                >
                    {[
                        { icon: '⏱️', label: '5-10 min', desc: 'Quick' },
                        { icon: '🎯', label: 'Adaptive', desc: 'Smart' },
                        { icon: '🔒', label: 'Private', desc: 'Safe' }
                    ].map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.6 + idx * 0.1, duration: 0.4 }}
                            className="bg-brand-primary/5 rounded-2xl p-3 border border-brand-primary/10"
                        >
                            <div className="text-2xl mb-1">{item.icon}</div>
                            <div className="text-sm font-bold text-brand-text">{item.label}</div>
                            <div className="text-xs text-brand-muted">{item.desc}</div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* CTA Button */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9, duration: 0.5 }}
                >
                    <motion.button
                        onClick={() => startStage('phoneme')}
                        whileHover={{
                            scale: 1.05,
                            boxShadow: "0 12px 32px rgba(59, 130, 246, 0.3)"
                        }}
                        whileTap={{ scale: 0.98 }}
                        className="bg-brand-primary text-white px-14 py-4 rounded-2xl text-xl font-bold shadow-lg hover:shadow-2xl transition-all flex items-center gap-3 mx-auto"
                    >
                        <span>Begin Assessment</span>
                        <motion.span
                            animate={{ x: [0, 5, 0] }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            →
                        </motion.span>
                    </motion.button>
                </motion.div>
            </motion.div>
        </div>
    );

    const renderChoiceStage = (questions, title, nextStage, section) => {
        const question = questions[currentQIdx];
        const handleChoice = (isCorrect) => {
            recordAnswer(section, question.id, isCorrect);
            if (currentQIdx < questions.length - 1) setCurrentQIdx(currentQIdx + 1);
            else startStage(nextStage);
        };

        return (
            <div className="w-full max-w-3xl animate-slide-up mx-auto py-8">
                {/* Header Section */}
                <div className="flex flex-col items-center mb-12">
                    <h2 className="text-3xl font-bold text-brand-text text-center mb-3 leading-tight">{title}</h2>
                    <p className="text-sm text-brand-muted font-medium bg-brand-primary/5 px-4 py-1.5 rounded-full">Question {currentQIdx + 1} of {questions.length}</p>
                </div>

                {/* Question Card - Enhanced Focus */}
                <div className="bg-gradient-to-br from-brand-card to-brand-card/80 p-12 rounded-3xl mb-10 border-2 border-brand-primary/20 shadow-lg text-center relative overflow-hidden">
                    {/* Subtle accent line */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand-primary to-transparent opacity-50"></div>

                    <p className="text-lg font-semibold text-brand-muted mb-4 uppercase tracking-wide text-xs">Find the match for:</p>
                    <span className="text-5xl text-brand-primary font-black block leading-tight">"{question.target}"</span>
                </div>

                {/* Answer Options - Enhanced Interactivity */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {question.options.map((opt, i) => (
                        <motion.button
                            key={i}
                            whileHover={{ y: -6, scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleChoice(opt.correct)}
                            className="bg-brand-card p-10 rounded-2xl shadow-md border-2 border-brand-muted/10 hover:border-brand-primary hover:shadow-xl text-xl font-bold text-brand-text text-center capitalize transition-all duration-200 relative group overflow-hidden"
                        >
                            {/* Hover glow effect */}
                            <div className="absolute inset-0 bg-brand-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-2xl"></div>
                            <span className="relative z-10">{opt.text}</span>
                        </motion.button>
                    ))}
                </div>
            </div>
        );
    };

    const renderMicStage = (title, items, instruction, nextStage, nextAction) => (
        <div className="text-center animate-fade-in max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-brand-text mb-4 leading-tight">{title}</h2>
            <p className="text-lg text-brand-muted mb-10 leading-relaxed">{instruction}</p>

            {!isRecording ? (
                <motion.button
                    onClick={startRecordingStage}
                    whileHover={{ scale: 1.02, boxShadow: "0 8px 24px rgba(59, 130, 246, 0.25)" }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-brand-primary text-white px-12 py-4 rounded-2xl text-xl font-bold shadow-md hover:shadow-lg transition-all mb-12 flex items-center gap-3 mx-auto"
                >
                    <span>🎤</span> Begin Recording
                </motion.button>
            ) : (
                <div className="mb-12 text-brand-primary text-2xl font-bold bg-brand-primary/5 px-6 py-3 rounded-2xl inline-block">
                    <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-3 animate-pulse"></span>
                    Recording... {timeLeft}s remaining
                </div>
            )}

            {/* Items Grid with Enhanced Visual */}
            <div className="grid grid-cols-6 md:grid-cols-10 gap-3 mb-12 bg-gradient-to-br from-brand-card/80 to-brand-card/40 p-8 rounded-3xl border border-brand-muted/10 shadow-inner">
                {items.map((item, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.02, duration: 0.2 }}
                        className="text-3xl bg-brand-card p-4 rounded-xl shadow-sm border border-brand-muted/10 flex items-center justify-center aspect-square font-bold text-brand-text hover:shadow-md hover:scale-105 transition-all"
                    >
                        {item}
                    </motion.div>
                ))}
            </div>

            <motion.button
                onClick={() => nextAction(nextStage)}
                disabled={loading}
                whileHover={!loading ? { scale: 1.02 } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
                className={`px-12 py-4 rounded-2xl text-xl font-bold transition-all shadow-md ${loading ? 'bg-brand-muted/20 opacity-50 cursor-not-allowed' : 'bg-brand-primary text-white hover:shadow-lg'
                    }`}
            >
                {loading ? "Processing..." : "Continue"}
            </motion.button>
        </div>
    );

    const renderReadingStage = () => (
        <div className="text-center animate-fade-in max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-brand-text mb-4 leading-tight">Read Aloud</h2>
            <p className="text-lg text-brand-muted mb-12 leading-relaxed">Read these sentences out loud clearly.</p>

            {/* Sentences Card with Enhanced Focus */}
            <div className="space-y-6 mb-12 text-left bg-gradient-to-br from-brand-card to-brand-card/80 p-10 rounded-3xl shadow-lg border-2 border-brand-primary/20 relative overflow-hidden">
                {/* Accent line */}
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-brand-primary via-brand-primary/50 to-transparent"></div>

                {READING_SENTENCES.map((sent, i) => (
                    <div key={i} className="flex gap-5 items-start pl-2">
                        <span className="bg-brand-primary text-white w-9 h-9 rounded-full flex items-center justify-center font-bold flex-shrink-0 text-sm shadow-md">{i + 1}</span>
                        <p className="text-xl text-brand-text leading-relaxed pt-1">{sent}</p>
                    </div>
                ))}
            </div>

            {!isRecording ? (
                <motion.button
                    onClick={startRecordingStage}
                    whileHover={{ scale: 1.02, boxShadow: "0 8px 24px rgba(59, 130, 246, 0.25)" }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-brand-primary text-white px-14 py-4 rounded-2xl text-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-3 mx-auto"
                >
                    <span>🎤</span> Begin Recording
                </motion.button>
            ) : (
                <motion.button
                    onClick={() => processAudioTest('results')}
                    disabled={loading}
                    whileTap={{ scale: 0.98 }}
                    className="bg-brand-primary text-white px-14 py-4 rounded-2xl text-xl font-bold shadow-md flex items-center gap-3 mx-auto relative overflow-hidden"
                >
                    {loading && <div className="absolute inset-0 bg-white/10 animate-pulse"></div>}
                    <span className="relative z-10">{loading ? "Processing..." : "⏹️ Finish"}</span>
                </motion.button>
            )}
        </div>
    );

    const renderResults = () => {
        if (!finalResult || finalResult.detail) {
            return (
                <div className="text-center animate-slide-up py-10 max-w-2xl mx-auto">
                    <div className="mb-8 scale-150 text-6xl">⚠️</div>
                    <h1 className="text-3xl font-bold text-brand-text mb-6">Oops! We had a small hiccup.</h1>
                    <p className="text-xl text-brand-muted mb-10">We saved your answers, but we couldn't calculate the score right now. This usually happens if the database is missing some columns.</p>

                    {finalResult?.detail && (
                        <div className="bg-red-50 p-6 rounded-2xl mb-10 border border-red-100 text-left overflow-auto max-h-64">
                            <p className="text-sm font-black text-red-600 mb-2 uppercase tracking-widest">Technical Error Details:</p>
                            <pre className="text-xs text-red-500 font-mono whitespace-pre-wrap">
                                {typeof finalResult.detail === 'string' ? finalResult.detail : JSON.stringify(finalResult.detail, null, 2)}
                            </pre>
                            <p className="mt-4 text-xs text-slate-500 italic">
                                Tip: If the error mentions missing columns like 'phoneme_score' or 'reading_wpm', please run the Master SQL script in your Supabase Editor.
                            </p>
                        </div>
                    )}

                    <button
                        onClick={() => navigate('/dashboard')}
                        className="bg-brand-primary text-white px-10 py-5 rounded-2xl text-2xl font-bold hover-glow shadow-xl"
                    >
                        Go to My Dashboard 🚀
                    </button>
                </div>
            );
        }

        return (
            <div className="text-center animate-slide-up py-12 max-w-2xl mx-auto">
                <div className="mb-8 text-6xl">✅</div>
                <h1 className="text-4xl font-bold text-brand-text mb-5 leading-tight">Assessment Complete</h1>
                <p className="text-lg text-brand-muted mb-12 leading-relaxed">Here are your results:</p>

                {/* Enhanced Results Card */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className={`p-10 rounded-3xl mb-12 shadow-2xl transition-all text-white border-2 relative overflow-hidden ${finalResult?.risk_level === 'HIGH' ? 'bg-gradient-to-br from-red-500 to-red-600 border-red-300' :
                        finalResult?.risk_level === 'MODERATE' ? 'bg-gradient-to-br from-amber-500 to-amber-600 border-amber-300' :
                            'bg-gradient-to-br from-green-500 to-green-600 border-green-300'
                        }`}
                >
                    {/* Decorative element */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>

                    <h2 className="text-lg font-bold uppercase tracking-wider mb-3 opacity-90 relative z-10">Risk Level</h2>
                    <div className="text-6xl font-black mb-4 relative z-10">{finalResult?.risk_level}</div>
                    <p className="text-xl font-medium opacity-90 relative z-10">Overall Score: {finalResult?.total_score} / 10</p>
                </motion.div>

                {/* Detail Cards with Stagger Animation */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
                    {finalResult?.details && Object.entries(finalResult.details).map(([key, val], idx) => (
                        <motion.div
                            key={key}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05, duration: 0.3 }}
                            className="bg-brand-card p-5 rounded-2xl shadow-md border border-brand-muted/10 hover:shadow-lg hover:scale-105 transition-all"
                        >
                            <p className="text-xs text-brand-muted uppercase mb-2 font-semibold tracking-wide">{key}</p>
                            <p className="text-2xl font-black text-brand-text">{val}</p>
                        </motion.div>
                    ))}
                </div>

                <motion.button
                    onClick={() => navigate('/dashboard')}
                    whileHover={{ scale: 1.02, boxShadow: "0 8px 24px rgba(59, 130, 246, 0.25)" }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-brand-primary text-white px-14 py-4 rounded-2xl text-xl font-bold shadow-md hover:shadow-lg transition-all"
                >
                    Go to Dashboard
                </motion.button>
            </div>
        );
    };

    // --------------------------------------------------
    // 5. MAIN RENDER
    // --------------------------------------------------
    return (
        <div className="min-h-screen p-4 flex flex-col items-center justify-center transition-all duration-700">

            {/* Background Decor */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-5">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-primary rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-accent rounded-full blur-[120px]"></div>
            </div>

            <div className="w-full max-w-5xl bg-brand-card p-8 md:p-12 rounded-3xl shadow-lg border border-brand-muted/10 relative z-10 transition-all duration-500 overflow-hidden">

                {/* Header with Progress - Enhanced */}
                {stage !== 'welcome' && stage !== 'results' && (
                    <div className="mb-12">
                        <div className="flex justify-between items-center mb-4 px-1">
                            <span className="text-brand-muted font-semibold text-sm tracking-wide">
                                {TESTS.find(t => t.id === stage)?.title}
                            </span>
                            <span className="bg-brand-primary/10 text-brand-primary px-4 py-1.5 rounded-full text-xs font-bold shadow-sm">
                                {Math.round((TESTS.findIndex(t => t.id === stage) / (TESTS.length - 1)) * 100)}% Complete
                            </span>
                        </div>
                        {/* Smooth Progress Bar */}
                        <div className="h-2.5 w-full bg-brand-muted/10 rounded-full overflow-hidden shadow-inner">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.round((TESTS.findIndex(t => t.id === stage) / (TESTS.length - 1)) * 100)}%` }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-brand-primary to-brand-primary/80 rounded-full shadow-sm"
                            />
                        </div>
                    </div>
                )}

                {/* Dynamic Stage Rendering */}
                {stage === 'welcome' && renderWelcome()}
                {stage === 'phoneme' && renderChoiceStage(PHONEME_QUESTIONS, "What's the starting sound?", 'rhyme', 'phoneme')}
                {stage === 'rhyme' && renderChoiceStage(RHYME_QUESTIONS, "Which words sound the same?", 'naming', 'rhyme')}

                {stage === 'naming' && renderMicStage(
                    "Rapid Naming ⚡",
                    NAMING_ITEMS,
                    "Name each picture out loud as fast as you can!",
                    'letters',
                    (s) => startStage(s)
                )}

                {stage === 'letters' && renderMicStage(
                    "Letter Sounds 🔤",
                    LETTER_ITEMS,
                    "Look at each letter and say its sound out loud!",
                    'reading',
                    (s) => {
                        // For demo, we just increment score. In prod, Whisper would score letters.
                        setScores(prev => ({ ...prev, letter_score: 18 }));
                        startStage(s);
                    }
                )}

                {stage === 'reading' && renderReadingStage()}
                {stage === 'results' && renderResults()}

            </div>

            {/* Accessibility Panel */}
            <AccessibilityPanel />
        </div>
    );
}

export default Screening;
