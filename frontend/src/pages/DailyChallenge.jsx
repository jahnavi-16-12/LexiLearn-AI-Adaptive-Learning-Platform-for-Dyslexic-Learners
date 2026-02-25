import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const DailyChallenge = () => {
    const navigate = useNavigate();
    const [challenge, setChallenge] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedOption, setSelectedOption] = useState(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);

    useEffect(() => {
        const fetchChallenge = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { navigate('/login'); return; }

            // Check if already done
            const progRes = await fetch(`http://localhost:8000/api/user/progress?user_id=${user.id}`);
            const progData = await progRes.json();
            if (progData.daily_done) {
                setChallenge({ done: true });
                setLoading(false);
                return;
            }

            try {
                const res = await fetch(`http://localhost:8000/api/ai/daily?user_id=${user.id}`);
                const data = await res.json();
                setChallenge(data);
            } catch (e) {
                console.error("Challenge error:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchChallenge();
    }, []);

    const speak = (text) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.pitch = 1.4;
        window.speechSynthesis.speak(utterance);
    };

    const handleOptionClick = async (option) => {
        if (showFeedback) return;
        setSelectedOption(option);
        const correct = option === challenge.correct_answer;
        setIsCorrect(correct);
        setShowFeedback(true);

        if (correct) {
            speak("You got it! High five! ✋");
            const { data: { user } } = await supabase.auth.getUser();
            await fetch('http://localhost:8000/api/user/complete-daily', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: user.id })
            });
        } else {
            speak("Nice try! Let's see why the other one fits better.");
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-brand-bg flex items-center justify-center font-dyslexic">
            <div className="animate-spin text-4xl">🎡 Loading Daily Fun...</div>
        </div>
    );

    if (challenge?.done) return (
        <div className="min-h-screen bg-brand-bg p-6 flex flex-col items-center justify-center font-dyslexic">
            <div className="bg-white p-12 rounded-[40px] shadow-2xl text-center max-w-sm">
                <div className="text-8xl mb-6">😴</div>
                <h1 className="text-2xl font-black mb-4">Challenge Complete!</h1>
                <p className="text-slate-600 mb-8">You've finished today's puzzle. Come back tomorrow for a new one!</p>
                <button onClick={() => navigate('/dashboard')} className="w-full bg-brand-primary text-white py-4 rounded-2xl font-bold">Back to Dashboard</button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-brand-bg p-6 md:p-12 font-dyslexic flex flex-col items-center">
            <header className="w-full max-w-4xl flex justify-between mb-12">
                <button onClick={() => navigate('/dashboard')} className="text-brand-primary font-bold">⬅️ Back</button>
                <div className="bg-white px-4 py-2 rounded-full shadow-sm font-black text-brand-primary">DAILY CHALLENGE</div>
            </header>

            <main className="max-w-2xl w-full bg-white rounded-[40px] p-8 md:p-12 shadow-2xl border-b-8 border-slate-100 animate-slide-up">
                <div className="text-center mb-10">
                    <span className="text-6xl mb-4 block animate-bounce">🧩</span>
                    <h1 className="text-2xl font-black text-slate-800">{challenge.type}</h1>
                    <p className="text-xl text-brand-primary mt-4 font-bold">{challenge.question}</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {challenge.options.map((opt, i) => (
                        <button
                            key={i}
                            onClick={() => handleOptionClick(opt)}
                            disabled={showFeedback}
                            className={`
                                p-6 rounded-2xl text-xl font-bold transition-all transform active:scale-95
                                ${selectedOption === opt ? (isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white') : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-2 border-slate-100'}
                            `}
                        >
                            {opt}
                        </button>
                    ))}
                </div>

                {showFeedback && (
                    <div className="mt-10 p-6 rounded-3xl bg-brand-primary/5 border border-brand-primary/10 animate-pop-up">
                        <p className="text-slate-700 font-bold mb-4">
                            {isCorrect ? "🌟 Great job!" : "💡 Almost there!"} {challenge.explanation}
                        </p>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="w-full bg-brand-primary text-white py-4 rounded-2xl font-black hover:opacity-90 transition"
                        >
                            Done for Today!
                        </button>
                    </div>
                )}
            </main>

            {/* AI Coach - Bottom Left */}
            <div className={`fixed bottom-8 left-8 z-50`}>
                <div className="bg-white p-4 rounded-3xl shadow-2xl border-2 border-brand-primary relative animate-bounce-slow max-w-[200px]">
                    <p className="text-xs font-bold text-brand-primary">Coach Tip:</p>
                    <p className="text-[10px] leading-tight italic">"Take your time! There's no rush to pick the answer."</p>
                    <div className="absolute -top-10 -right-4 text-4xl">🤖</div>
                </div>
            </div>
        </div>
    );
};

export default DailyChallenge;
