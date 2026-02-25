import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { GAMES } from '../data/gameData';
import GameContainer from '../components/GameContainer';
import ChoiceEngine from '../components/game-engines/ChoiceEngine';
import CountEngine from '../components/game-engines/CountEngine';
import ManipulationEngine from '../components/game-engines/ManipulationEngine';
import DragEngine from '../components/game-engines/DragEngine';
import VoiceEngine from '../components/game-engines/VoiceEngine';
import GridEngine from '../components/game-engines/GridEngine';
import RhythmEngine from '../components/game-engines/RhythmEngine';

const GamePlay = () => {
    const { gameId } = useParams();
    const navigate = useNavigate();
    const [game, setGame] = useState(null);
    const [score, setScore] = useState(0);
    const [mistakes, setMistakes] = useState(0);
    const [currentLevel, setCurrentLevel] = useState(1);
    const [gameState, setGameState] = useState('playing'); // playing, won, lost
    const [time, setTime] = useState(0);
    const [user, setUser] = useState(null);
    const [stars, setStars] = useState(0);

    useEffect(() => {
        const foundGame = GAMES.find(g => g.id === gameId);
        if (foundGame) {
            setGame(foundGame);
        } else {
            navigate('/games');
        }

        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        getUser();
    }, [gameId, navigate]);

    // Timer logic
    useEffect(() => {
        let interval;
        if (gameState === 'playing') {
            interval = setInterval(() => {
                setTime(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [gameState]);

    const lastCorrectLevel = React.useRef(0);

    if (!game) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-black text-2xl">Loading Game...</div>;

    const calculateStars = (finalMistakes, finalTime) => {
        const totalLevels = game.levels.length;
        if (finalMistakes === 0 && finalTime <= totalLevels * 10) return 3;
        if (finalMistakes < 3 && finalTime <= totalLevels * 20) return 2;
        return 1;
    };

    const handleCorrect = () => {
        // Prevent double triggers if the engine fires too fast (common with drag/drop)
        if (lastCorrectLevel.current === currentLevel) return;
        lastCorrectLevel.current = currentLevel;

        setScore(prev => prev + 10);
        if (currentLevel < (game.levels?.length || 1)) {
            setTimeout(() => {
                setCurrentLevel(prev => prev + 1);
            }, 500);
        } else {
            const finalMistakes = mistakes;
            const finalTime = time;
            const finalStars = calculateStars(finalMistakes, finalTime);
            setStars(finalStars);
            setGameState('won');
            submitActivity('won', finalStars, finalTime);

            // Mark as completed in localStorage
            const completed = JSON.parse(localStorage.getItem('lexilearn_completed_games') || '{}');
            completed[gameId] = true;
            localStorage.setItem('lexilearn_completed_games', JSON.stringify(completed));
        }

        // Sound feedback - CLEAR PREVIOUS FIRST
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance("Great job!");
        u.pitch = 1.6;
        window.speechSynthesis.speak(u);
    };

    const handleWrong = () => {
        setMistakes(prev => prev + 1);
        const u = new SpeechSynthesisUtterance("Almost! Try again.");
        window.speechSynthesis.speak(u);
    };

    const submitActivity = async (status, finalStars, finalTime) => {
        if (!user) return;
        try {
            console.log("GamePlay: Submitting final activity...", { finalStars, finalTime });

            // 1. Record individual score
            await supabase.from('game_scores').insert({
                user_id: user.id,
                game_id: gameId,
                score: score + 10,
                stars_earned: finalStars
            });

            // 2. Fetch latest profile to get CURRENT stars
            const { data: profile } = await supabase
                .from('profiles')
                .select('total_stars')
                .eq('id', user.id)
                .single();

            const currentTotalStars = profile?.total_stars || 0;
            console.log("GamePlay: Existing stars:", currentTotalStars, "Adding:", finalStars);

            // 3. Update Daily Summary for Parent Dashboard Charts
            const today = new Date().toISOString().split('T')[0];
            const { data: summary } = await supabase
                .from('child_activity_summary')
                .select('*')
                .eq('child_id', user.id)
                .eq('activity_date', today)
                .single();

            if (summary) {
                await supabase
                    .from('child_activity_summary')
                    .update({
                        games_played: summary.games_played + 1,
                        stars_earned: summary.stars_earned + finalStars
                    })
                    .eq('id', summary.id);
            } else {
                await supabase
                    .from('child_activity_summary')
                    .insert({
                        child_id: user.id,
                        activity_date: today,
                        games_played: 1,
                        stars_earned: finalStars
                    });
            }

            // 4. Update Profile Totals safely
            await supabase.from('profiles').update({
                total_stars: currentTotalStars + finalStars
            }).eq('id', user.id);

            console.log("GamePlay: Profile updated successfully.");

        } catch (e) {
            console.error("Activity record error:", e);
        }
    };

    const renderEngine = () => {
        const props = { data: game, onCorrect: handleCorrect, onWrong: handleWrong, currentLevel: currentLevel };

        switch (game.type) {
            case 'choice':
            case 'sound-id':
            case 'blending':
            case 'completion':
            case 'initial-sound-match':
                return <ChoiceEngine {...props} />;
            case 'count':
            case 'sort-by-count':
                return <CountEngine {...props} />;
            case 'manipulation':
            case 'fill-blank':
            case 'word-chain':
                return <ManipulationEngine {...props} />;
            case 'drag-build':
            case 'sort':
            case 'sequence-tap':
                return <DragEngine {...props} />;
            case 'voice-echo':
            case 'password':
            case 'camera-find':
                return <VoiceEngine {...props} />;
            case 'matching':
            case 'memory':
            case 'speed-find':
            case 'treasure-hunt':
                return <GridEngine {...props} />;
            case 'rhythm':
            case 'drum-rhythm':
            case 'reaction':
                return <RhythmEngine {...props} />;
            default:
                return (
                    <div className="text-center p-12 bg-white rounded-[40px] shadow-sm border-4 border-dashed border-slate-100">
                        <div className="text-6xl mb-4">🚧</div>
                        <h2 className="text-2xl font-black text-slate-400 mb-2">Game logic being refined!</h2>
                        <p className="text-slate-500">I'm polishing the {game.type} engine for you right now.</p>
                        <button onClick={() => navigate('/games')} className="mt-8 text-brand-primary font-bold">Go Back</button>
                    </div>
                );
        }
    };

    return (
        <GameContainer
            gameId={game.id}
            title={game.name}
            instructions={game.instructions}
            category={game.category}
            score={score}
            totalLevels={game.levels?.length || 1}
            currentLevel={currentLevel}
            gameState={gameState}
            time={time}
            stars={stars}
            onRestart={() => {
                lastCorrectLevel.current = 0;
                setScore(0);
                setCurrentLevel(1);
                setGameState('playing');
                setTime(0);
            }}
        >
            {renderEngine()}
        </GameContainer>
    );
};

export default GamePlay;
