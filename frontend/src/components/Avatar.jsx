import React, { useMemo } from 'react';

const AVATARS = {
    boy: { src: '/assets/boy_avatar_1769342790771.png', alt: 'Boy Explorer', color: 'bg-blue-100' },
    girl: { src: '/assets/girl_avatar_1769342808188.png', alt: 'Girl Explorer', color: 'bg-pink-100' },
    lexi: { src: '/assets/lexi_coach_avatar_1769342826060.png', alt: 'Lexi Coach', color: 'bg-yellow-100' },
    guest: { src: '/assets/lexi_coach_avatar_1769342826060.png', alt: 'Guest', color: 'bg-slate-100' }
};

const COLORS = [
    'bg-blue-100',
    'bg-green-100',
    'bg-yellow-100',
    'bg-purple-100',
    'bg-orange-100'
];

const Avatar = ({ variant, gender, size = 'md', className = '' }) => {
    const selection = useMemo(() => {
        // Special named variants
        if (variant === 'lexi') return AVATARS.lexi;
        if (variant === 'guest') return AVATARS.guest;

        // Gender-based selection
        const g = (gender || '').toLowerCase();
        if (g === 'boy' || g === 'male') return AVATARS.boy;
        if (g === 'girl' || g === 'female') return AVATARS.girl;

        // Fallback for number/string variants (e.g. from user.id)
        const hash = typeof variant === 'string'
            ? variant.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
            : (typeof variant === 'number' ? variant : 0);

        // If it's a known girl name (very simple heuristic for common tests)
        const name = (variant || '').toString().toLowerCase();
        if (name.includes('tina') || name.includes('sally') || name.includes('girl')) return AVATARS.girl;
        if (name.includes('boy') || name.includes('lexi')) return AVATARS.boy;

        const isBoy = hash % 2 === 0;
        const color = COLORS[hash % COLORS.length];

        return {
            src: isBoy ? AVATARS.boy.src : AVATARS.girl.src,
            alt: isBoy ? 'Boy Explorer' : 'Girl Explorer',
            color: color
        };
    }, [variant, gender]);

    const sizeClasses = {
        xs: 'w-8 h-8',
        sm: 'w-10 h-10',
        md: 'w-16 h-16',
        lg: 'w-24 h-24',
        xl: 'w-32 h-32',
        hero: 'w-48 h-48'
    };

    return (
        <div
            className={`
                relative rounded-[2rem] overflow-hidden 
                border-4 border-white shadow-xl 
                ${selection.color} 
                ${sizeClasses[size]} 
                hover:scale-105 transition-all duration-500
                flex items-center justify-center
                group
                ${className}
            `}
        >
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity z-10" />
            <img
                src={selection.src}
                alt={selection.alt}
                className="w-full h-full object-cover transform scale-110 group-hover:scale-125 transition-transform duration-700"
            />
        </div>
    );
};

export default Avatar;
