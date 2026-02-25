import React from 'react';

const WorldMap = ({ currentLevel, onLevelSelect }) => {
    // 3 Islands Configuration with enhanced theming
    const islands = [
        {
            id: 'beginner',
            name: '🌱 Beginner Island',
            range: [1, 15],
            theme: 'from-green-200 to-green-300',
            landColor: 'bg-gradient-to-br from-green-50 via-emerald-100 to-green-200',
            borderColor: 'border-green-400',
            description: "Start your journey in the lush forests!",
            decorations: ['🌲', '🏡', '🍄', '🌳', '🦌', '🌿', '🦋', '🐿️', '🌻'],
            emoji: '🌱',
            pathColor: 'from-yellow-200 to-amber-300'
        },
        {
            id: 'intermediate',
            name: '🌊 Intermediate Atoll',
            range: [16, 35],
            theme: 'from-blue-200 to-blue-300',
            landColor: 'bg-gradient-to-br from-sky-50 via-blue-100 to-cyan-200',
            borderColor: 'border-blue-400',
            description: "Sail through the tricky waters!",
            decorations: ['🌴', '⛵', '🐙', '🐚', '🦀', '🐠', '🏝️', '🌊', '⚓'],
            emoji: '🌊',
            pathColor: 'from-blue-200 to-cyan-300'
        },
        {
            id: 'advanced',
            name: '🏔️ Advanced Mountain',
            range: [36, 50],
            theme: 'from-purple-200 to-purple-300',
            landColor: 'bg-gradient-to-br from-purple-50 via-indigo-100 to-purple-200',
            borderColor: 'border-purple-400',
            description: "Climb the peaks of mastery!",
            decorations: ['🦅', '☁️', '🏰', '🐉', '❄️', '⛰️', '🌙', '⭐', '🌨️'],
            emoji: '⛰️',
            pathColor: 'from-purple-200 to-indigo-300'
        }
    ];

    const isLocked = (level) => level > currentLevel;

    return (
        <div className="flex flex-col gap-16 items-center pb-32 w-full max-w-5xl mx-auto pt-8">
            {islands.map((island, idx) => (
                <div key={island.id} className="relative w-full group mt-12">

                    {/* Connection Path to Next Island */}
                    {idx < islands.length - 1 && (
                        <div className="absolute left-1/2 -bottom-16 w-1 h-16 -translate-x-1/2 z-0 hidden md:block">
                            <div className="w-full h-full bg-gradient-to-b from-slate-300/50 to-transparent rounded-full"></div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl opacity-50 animate-bounce-slow">
                                ⬇️
                            </div>
                        </div>
                    )}

                    {/* Island Container */}
                    <div className={`
                        relative z-10 
                        ${island.landColor} 
                        rounded-[40px] md:rounded-[60px] 
                        p-8 md:p-14 
                        border-b-4 ${island.borderColor}
                        shadow-[0_15px_40px_rgba(0,0,0,0.15)]
                    `}>

                        {/* Atmospheric Background Elements */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
                            {island.id === 'beginner' && (
                                <>
                                    <div className="absolute top-10 left-10 w-32 h-32 bg-green-300 rounded-full blur-3xl"></div>
                                    <div className="absolute bottom-10 right-10 w-40 h-40 bg-yellow-200 rounded-full blur-3xl"></div>
                                </>
                            )}
                            {island.id === 'intermediate' && (
                                <>
                                    <div className="absolute top-5 right-5 w-36 h-36 bg-blue-300 rounded-full blur-3xl"></div>
                                    <div className="absolute bottom-5 left-5 w-44 h-44 bg-cyan-200 rounded-full blur-3xl"></div>
                                </>
                            )}
                            {island.id === 'advanced' && (
                                <>
                                    <div className="absolute top-8 left-8 w-40 h-40 bg-purple-300 rounded-full blur-3xl"></div>
                                    <div className="absolute bottom-8 right-8 w-36 h-36 bg-indigo-200 rounded-full blur-3xl"></div>
                                </>
                            )}
                        </div>

                        {/* Decorative Elements - Scattered Background */}
                        {island.decorations.map((deco, i) => (
                            <div
                                key={i}
                                className="absolute text-2xl md:text-3xl pointer-events-none opacity-25 animate-float"
                                style={{
                                    top: `${Math.random() * 85 + 5}%`,
                                    left: `${Math.random() * 85 + 5}%`,
                                    transform: `rotate(${Math.random() * 30 - 15}deg)`,
                                    animationDelay: `${Math.random() * 3}s`,
                                    animationDuration: `${8 + Math.random() * 4}s`
                                }}
                            >
                                {deco}
                            </div>
                        ))}

                        {/* Island Title Banner */}
                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-white px-8 py-2.5 rounded-full font-bold text-lg md:text-xl shadow-lg border-2 border-brand-primary whitespace-nowrap z-30 backdrop-blur-sm bg-white/95">
                            {island.name}
                        </div>

                        {/* Winding Path Visual */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30 z-0" viewBox="0 0 800 400" preserveAspectRatio="none">
                            <path
                                d={island.id === 'beginner'
                                    ? "M 50,350 Q 200,300 300,320 T 550,280 T 750,250"
                                    : island.id === 'intermediate'
                                        ? "M 50,300 Q 150,250 250,270 T 450,240 T 750,200"
                                        : "M 50,350 Q 200,280 350,300 T 600,250 T 750,200"
                                }
                                stroke={`url(#gradient-${island.id})`}
                                strokeWidth="8"
                                fill="none"
                                strokeDasharray="10,5"
                                className="drop-shadow-md"
                            />
                            <defs>
                                <linearGradient id={`gradient-${island.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" className={`text-${island.id === 'beginner' ? 'yellow' : island.id === 'intermediate' ? 'blue' : 'purple'}-300`} stopColor="currentColor" stopOpacity="0.8" />
                                    <stop offset="100%" className={`text-${island.id === 'beginner' ? 'amber' : island.id === 'intermediate' ? 'cyan' : 'indigo'}-400`} stopColor="currentColor" stopOpacity="0.6" />
                                </linearGradient>
                            </defs>
                        </svg>

                        {/* Levels Grid - Stepping Stones */}
                        <div className="relative z-20 flex flex-wrap justify-center gap-5 md:gap-7 mt-6">
                            {Array.from({ length: island.range[1] - island.range[0] + 1 }, (_, i) => {
                                const levelNum = island.range[0] + i;
                                const locked = isLocked(levelNum);
                                const isCurrent = levelNum === currentLevel;
                                const completed = levelNum < currentLevel;

                                return (
                                    <div key={levelNum} className="relative group/btn">
                                        <button
                                            disabled={locked}
                                            onClick={() => {
                                                console.log("WorldMap: Level selected:", levelNum);
                                                onLevelSelect(levelNum);
                                            }}
                                            className={`
                                                w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center 
                                                text-xl md:text-2xl font-bold border-3 shadow-lg
                                                transition-all duration-300 transform relative z-10
                                                ${isCurrent
                                                    ? `bg-gradient-to-br ${island.pathColor} text-brand-primary border-white scale-105 shadow-[0_0_20px_rgba(255,215,0,0.6)] animate-pulse-glow ring-4 ring-yellow-300/50`
                                                    : completed
                                                        ? 'bg-white/95 text-brand-primary border-green-400 shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                                                        : locked
                                                            ? `bg-slate-300/40 text-slate-500/50 border-slate-400/30 cursor-not-allowed ${island.id === 'advanced' ? 'backdrop-blur-sm' : ''}`
                                                            : 'bg-white/90 text-slate-700 border-slate-300'
                                                }
                                                ${!locked && !isCurrent ? 'hover:scale-110 hover:shadow-xl hover:-translate-y-1' : ''}
                                            `}
                                        >
                                            {locked ? (
                                                <div className="relative">
                                                    <span className="text-2xl">🔒</span>
                                                    {island.id === 'advanced' && <div className="absolute inset-0 bg-blue-100/30 rounded-full backdrop-blur-[1px]"></div>}
                                                </div>
                                            ) : (
                                                <span className={completed ? 'font-extrabold' : ''}>{levelNum}</span>
                                            )}
                                        </button>

                                        {/* Completed Checkmark Badge */}
                                        {completed && (
                                            <div className="absolute -top-1.5 -right-1.5 bg-gradient-to-br from-green-400 to-emerald-500 text-white w-7 h-7 rounded-full flex items-center justify-center border-2 border-white z-20 shadow-md text-sm animate-pop">
                                                ✓
                                            </div>
                                        )}

                                        {/* Current Level Pulse Ring */}
                                        {isCurrent && (
                                            <div className="absolute inset-0 rounded-full border-2 border-yellow-400 animate-ping opacity-75"></div>
                                        )}

                                        {/* Connection Line */}
                                        {i < (island.range[1] - island.range[0]) && (
                                            <div className={`
                                                hidden md:block absolute top-1/2 left-full w-5 h-0.5 -translate-y-1/2 z-0
                                                ${locked ? 'bg-slate-400/20' : 'bg-gradient-to-r ' + island.pathColor.replace('from-', 'from-').replace('to-', 'to-') + '/50'}
                                            `}></div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default WorldMap;
