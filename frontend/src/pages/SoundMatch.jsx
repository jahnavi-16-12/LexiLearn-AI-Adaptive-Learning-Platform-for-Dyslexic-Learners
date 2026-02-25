import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const PHONEMES = [
    { sound: 's', options: ['S', 'M', 'T'], correct: 'S', audio: 's-sound' },
    { sound: 'm', options: ['B', 'M', 'D'], correct: 'M', audio: 'm-sound' },
    { sound: 't', options: ['P', 'L', 'T'], correct: 'T', audio: 't-sound' },
    { sound: 'a', options: ['E', 'A', 'O'], correct: 'A', audio: 'a-sound' },
    { sound: 'b', options: ['D', 'P', 'B'], correct: 'B', audio: 'b-sound' }
];

const SoundMatch = () => {
    const navigate = useNavigate();
    const [currentIdx, setCurrentIdx] = useState(0);
    const [score, setScore] = useState(0);
    const [gameState, setGameState] = useState('playing'); // playing, feedback, finished
    const [lastResult, setLastResult] = useState(null);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        getUser();
    }, []);

    const currentLevel = PHONEMES[currentIdx];

    const playPhoneme = (phoneme) => {
        const utterance = new SpeechSynthesisUtterance(phoneme);
        utterance.rate = 0.6;
        utterance.pitch = 1.5;
        window.speechSynthesis.speak(utterance);
    };

    useEffect(() => {
        if (gameState === 'playing') {
            playPhoneme(currentLevel.sound);
        }
    }, [currentIdx, gameState]);

    const handleAnswer = (choice) => {
        if (choice === currentLevel.correct) {
            setScore(score + 10);
            setLastResult('correct');
            // Play praise
            const praiseArr = ["Awesome!", "Great job!", "You got it!", "Star student!"];
            const praise = praiseArr[Math.floor(Math.random() * praiseArr.length)];
            const u = new SpeechSynthesisUtterance(praise);
            window.speechSynthesis.speak(u);
        } else {
            setLastResult('wrong');
            const u = new SpeechSynthesisUtterance("Try again, you can do it!");
            window.speechSynthesis.speak(u);
        }

        setGameState('feedback');
        setTimeout(() => {
            if (currentIdx < PHONEMES.length - 1) {
                setCurrentIdx(currentIdx + 1);
                setGameState('playing');
            } else {
                setGameState('finished');
                submitScore();
            }
        }, 1500);
    };

    const submitScore = async () => {
        if (!user) return;
        try {
            await fetch('http://localhost:8000/api/user/game-score', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.id,
                    game_id: 'sound-match',
                    score: score,
                    stars: Math.floor(score / 10) // 1 star per correct answer
                })
            });
        } catch (e) {
            console.error("Score submission error:", e);
        }
    };

    if (gameState === 'finished') {
        return (
            <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6">
                <div className="bg-white p-12 rounded-[50px] shadow-2xl text-center max-w-lg w-full border-8 border-brand-yellow/30 animate-bounce-slow">
                    <h2 className="text-6xl mb-6">🏆</h2>
                    <h3 className="text-4xl font-black text-brand-primary font-dyslexic mb-4 text-glow">Amazing!</h3>
                    <p className="text-2xl font-bold text-brand-text mb-8">You earned {score} Stars!</p>
                    <button
                        onClick={() => navigate('/games')}
                        className="bg-brand-primary text-white px-10 py-4 rounded-3xl text-2xl font-black shadow-xl hover:scale-105 active:scale-95 transition-all"
                    >
                        Return to Arcade
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-brand-bg p-6 md:p-12 flex flex-col items-center">
            <header className="w-full max-w-4xl flex justify-between items-center mb-12">
                <button onClick={() => navigate('/games')} className="text-brand-primary font-black hover:underline text-lg">
                    Back to Arcade
                </button>
                <div className="bg-white px-6 py-2 rounded-full shadow-sm border-2 border-brand-yellow font-black text-brand-text">
                    Stars: ⭐ {score}
                </div>
            </header>

            <div className="max-w-3xl w-full bg-white/80 backdrop-blur-xl p-10 md:p-16 rounded-[60px] shadow-2xl border-4 border-white text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-4 bg-brand-yellow opacity-40"></div>

                <h2 className="text-3xl font-black text-brand-text mb-12 font-dyslexic antialiased">
                    Listen... what sound is this?
                </h2>

                <div className="flex justify-center mb-16">
                    <button
                        onClick={() => playPhoneme(currentLevel.sound)}
                        className="w-40 h-40 bg-brand-primary text-white rounded-full flex items-center justify-center text-7xl shadow-2xl hover:scale-110 active:scale-90 transition-transform cursor-pointer border-8 border-white group"
                    >
                        <span className="group-hover:animate-pulse">🔊</span>
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-6 md:gap-10">
                    {currentLevel.options.map((opt) => (
                        <button
                            key={opt}
                            disabled={gameState === 'feedback'}
                            onClick={() => handleAnswer(opt)}
                            className={`h-40 rounded-3xl text-6xl font-black transition-all flex items-center justify-center border-4 shadow-xl active:scale-95 ${gameState === 'feedback' && opt === currentLevel.correct ? 'bg-green-500 text-white border-green-200 scale-105' :
                                gameState === 'feedback' && opt !== currentLevel.correct ? 'bg-slate-100 text-slate-300 border-slate-100 opacity-50' :
                                    'bg-white text-brand-primary border-brand-primary/10 hover:border-brand-primary hover:bg-brand-primary/5 hover:scale-105'
                                }`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>

                {gameState === 'feedback' && lastResult === 'correct' && (
                    <div className="mt-12 text-3xl font-black text-green-500 animate-bounce">
                        🌟 BRILLIANT! 🌟
                    </div>
                )}
                {gameState === 'feedback' && lastResult === 'wrong' && (
                    <div className="mt-12 text-3xl font-black text-red-500 animate-shake">
                        Keep trying! 💪
                    </div>
                )}
            </div>
        </div>
    );
};

export default SoundMatch;
