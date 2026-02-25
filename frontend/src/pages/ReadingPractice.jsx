import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import LevelPlayer from '../components/LevelPlayer';

const ReadingPractice = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const rawLevel = parseInt(searchParams.get('level'));
    const currentLevel = !isNaN(rawLevel) && rawLevel > 0 ? rawLevel : 1;
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { navigate('/login'); return; }
            setUser(user);
            setLoading(false);
        };
        init();
    }, [navigate]);

    const handleLevelComplete = async (nextLevel) => {
        // Optional: Add celebration animation here before navigation
        navigate(`/reading-practice?level=${nextLevel}`);
    };

    const handleBack = () => {
        navigate('/reading-map');
    };

    if (loading) return (
        <div className="min-h-screen bg-sky-50 flex items-center justify-center">
            <div className="animate-spin text-4xl text-brand-primary">⏳</div>
        </div>
    );

    return (
        <LevelPlayer
            user={user}
            level={currentLevel}
            onComplete={handleLevelComplete}
            onBack={handleBack}
        />
    );
};

export default ReadingPractice;
