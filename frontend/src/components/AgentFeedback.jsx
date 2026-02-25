import React, { useEffect, useState } from 'react';

const AgentFeedback = ({ show, data, onNext, onRetry }) => {
    if (!show || !data) return null;

    const { stars, accuracy, feedback, unlocked } = data;
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        if (show) {
            setTimeout(() => setAnimate(true), 100);
            const audio = new Audio(
                unlocked
                    ? 'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3'
                    : 'https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3'
            );
            audio.volume = 0.5;
            audio.play().catch(e => console.log("Audio error", e));
        } else {
            setAnimate(false);
        }
    }, [show, unlocked]);

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-500 ${animate ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            {/* Backdrop */}
            <div className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-700 ${animate ? 'opacity-100' : 'opacity-0'}`} />

            <div className={`bg-white rounded-[40px] shadow-2xl border-4 p-8 max-w-xl w-full flex gap-6 relative z-10 transition-all duration-500 transform ${animate ? 'scale-100 translate-y-0' : 'scale-90 translate-y-8'} ${unlocked ? 'border-brand-yellow' : 'border-brand-primary'}`}>

                {/* CUTE ROBOT EMOJI */}
                <div className="flex-shrink-0">
                    <div className={`text-7xl ${unlocked ? 'animate-bounce' : 'animate-pulse'}`}>
                        🤖
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                    {/* Stars */}
                    <div className="flex gap-1 mb-3">
                        {[1, 2, 3].map(s => (
                            <span key={s} className={`text-3xl transition-all duration-500 ${s <= stars ? 'scale-110' : 'grayscale opacity-30'}`}>
                                ⭐
                            </span>
                        ))}
                    </div>

                    {/* AI Message */}
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3 mb-4">
                        <p className="font-dyslexic text-base font-bold text-brand-primary leading-relaxed">
                            {feedback}
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        {!unlocked && (
                            <button onClick={onRetry} className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3 rounded-xl transition-all">
                                Try Again 🔄
                            </button>
                        )}
                        {unlocked && (
                            <button onClick={onNext} className="flex-1 bg-brand-yellow hover:bg-yellow-400 text-brand-primary font-black py-3 rounded-xl shadow-lg border-b-4 border-yellow-600 transition-all active:border-b-0 active:translate-y-1 text-lg">
                                NEXT LEVEL ➡️
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgentFeedback;
