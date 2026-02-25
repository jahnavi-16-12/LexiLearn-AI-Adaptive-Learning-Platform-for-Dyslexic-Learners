import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const WORD_BANK = [
    { target: 'CAT', letters: ['C', 'A', 'T', 'M', 'B'], audio: 'cat' },
    { target: 'SUN', letters: ['S', 'U', 'N', 'R', 'T'], audio: 'sun' },
    { target: 'DOG', letters: ['D', 'O', 'G', 'B', 'P'], audio: 'dog' },
    { target: 'FISH', letters: ['F', 'I', 'S', 'H', 'A', 'B'], audio: 'fish' }
];

const WordBuilder = () => {
    const navigate = useNavigate();
    const [currentIdx, setCurrentIdx] = useState(0);
    const [score, setScore] = useState(0);
    const [builtWord, setBuiltWord] = useState([]);
    const [gameState, setGameState] = useState('playing');
    const [user, setUser] = useState(null);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        getUser();
    }, []);

    const currentWord = WORD_BANK[currentIdx];

    const addLetter = (letter) => {
        if (gameState !== 'playing') return;

        const newWord = [...builtWord, letter];
        setBuiltWord(newWord);

        // Check if finished
        if (newWord.length === currentWord.target.length) {
            const result = newWord.join('');
            if (result === currentWord.target) {
                setScore(score + 20);
                const u = new SpeechSynthesisUtterance("Splendid! You built " + currentWord.target);
                window.speechSynthesis.speak(u);
                setGameState('success');
            } else {
                const u = new SpeechSynthesisUtterance("Almost! Let's try again.");
                window.speechSynthesis.speak(u);
                setGameState('failure');
            }

            setTimeout(() => {
                if (currentIdx < WORD_BANK.length - 1) {
                    setCurrentIdx(currentIdx + 1);
                    setBuiltWord([]);
                    setGameState('playing');
                } else {
                    setGameState('finished');
                    submitScore();
                }
            }, 2000);
        }
    };

    const submitScore = async () => {
        if (!user) return;
        try {
            await fetch('http://localhost:8000/api/user/game-score', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.id,
                    game_id: 'word-builder',
                    score: score,
                    stars: Math.floor(score / 20) // 20 points per word = 1 star
                })
            });
        } catch (e) {
            console.error("Score submission error:", e);
        }
    };

    const clearWord = () => {
        setBuiltWord([]);
    };

    if (gameState === 'finished') {
        return (
            <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6">
                <div className="bg-white p-12 rounded-[50px] shadow-2xl text-center max-w-lg w-full border-8 border-brand-primary/20">
                    <h2 className="text-6xl mb-6">🏗️</h2>
                    <h3 className="text-4xl font-black text-brand-primary font-dyslexic mb-4">Master Builder!</h3>
                    <p className="text-2xl font-bold text-brand-text mb-8">You earned {score} Stars!</p>
                    <button onClick={() => navigate('/games')} className="bg-brand-primary text-white px-10 py-4 rounded-3xl text-2xl font-black shadow-xl">Return to Arcade</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-brand-bg p-6 md:p-12 flex flex-col items-center">
            <header className="w-full max-w-4xl flex justify-between items-center mb-12">
                <button onClick={() => navigate('/games')} className="text-brand-primary font-black text-lg">Back to Arcade</button>
                <div className="bg-white px-6 py-2 rounded-full shadow-sm border-2 border-brand-primary/20 font-black">
                    Score: {score}
                </div>
            </header>

            <div className="max-w-4xl w-full bg-white/90 backdrop-blur-xl p-10 md:p-16 rounded-[60px] shadow-2xl border-4 border-white text-center">
                <h2 className="text-3xl font-black text-brand-text mb-8 font-dyslexic">
                    Build the word: <span className="text-brand-primary underline decoration-brand-yellow decoration-4 underline-offset-8">{currentWord.target}</span>
                </h2>

                {/* Slots */}
                <div className="flex justify-center gap-4 mb-16">
                    {currentWord.target.split('').map((_, i) => (
                        <div key={i} className={`w-20 h-24 rounded-2xl border-4 border-dashed flex items-center justify-center text-5xl font-black transition-all ${builtWord[i] ? 'border-brand-primary bg-brand-primary/5 text-brand-primary animate-pop-in' : 'border-slate-300'}`}>
                            {builtWord[i] || ''}
                        </div>
                    ))}
                </div>

                {/* Letter Options */}
                <div className="flex flex-wrap justify-center gap-6 mb-12">
                    {currentWord.letters.map((letter, idx) => (
                        <button
                            key={idx}
                            onClick={() => addLetter(letter)}
                            className="w-20 h-20 bg-white border-2 border-slate-200 rounded-3xl text-4xl font-black shadow-md hover:border-brand-primary hover:-translate-y-2 transition-all active:scale-90"
                        >
                            {letter}
                        </button>
                    ))}
                </div>

                <button onClick={clearWord} className="text-brand-muted hover:text-brand-primary font-bold transition">
                    🔄 Clear and Start Again
                </button>

                {gameState === 'success' && <div className="mt-8 text-3xl font-black text-green-500 animate-bounce">✨ PERFECT! ✨</div>}
                {gameState === 'failure' && <div className="mt-8 text-3xl font-black text-red-500 animate-shake">So close! Try again!</div>}
            </div>
        </div>
    );
};

export default WordBuilder;
