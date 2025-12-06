import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { EthnicGroup } from '../../data/ethnicGroups';
import { getDailyEthnicGroups, calculateDistance, calculateScore, getEthnicGroupImageUrl, getEthnicGroupImageFallbackUrls } from '../../data/ethnicGroups';
import { GuessMap } from '../geoguesser/GuessMap';
import { EthnoResults } from './EthnoResults';
import { FacialComposite } from './FacialComposite';
import '../../styles/ethnoguesser.css';

interface EthnoGuesserProps {
    onBack: () => void;
}

type GamePhase = 'playing' | 'result';

interface RoundResult {
    ethnicGroup: EthnicGroup;
    guess: { lat: number; lng: number } | null;
    distance: number;
    score: number;
    timeSpent: number;
    hintsUsed: number;
}

const TIMER_DURATION = 30; // 30 seconds per round

export const EthnoGuesser: React.FC<EthnoGuesserProps> = ({ onBack }) => {
    const [dailyGroups] = useState<EthnicGroup[]>(() => getDailyEthnicGroups());
    const [currentRound, setCurrentRound] = useState(0);
    const [currentGroup, setCurrentGroup] = useState<EthnicGroup>(dailyGroups[0]);
    const [guess, setGuess] = useState<{ lat: number; lng: number } | null>(null);
    const [phase, setPhase] = useState<GamePhase>('playing');
    const [totalScore, setTotalScore] = useState(0);
    const [roundHistory, setRoundHistory] = useState<RoundResult[]>([]);
    const [mapExpanded, setMapExpanded] = useState(false);
    const [showDescription, setShowDescription] = useState(false);
    const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
    const timerRef = useRef<number | null>(null);
    const startTimeRef = useRef<number>(Date.now());

    // Timer countdown
    useEffect(() => {
        if (phase === 'playing' && timeLeft > 0) {
            timerRef.current = window.setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        // Time's up - auto-submit if guess exists
                        if (guess) {
                            handleGuessSubmit();
                        }
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            if (timerRef.current) {
                window.clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }

        return () => {
            if (timerRef.current) {
                window.clearInterval(timerRef.current);
            }
        };
    }, [phase, timeLeft, guess]);

    // Update current group when round changes
    useEffect(() => {
        if (currentRound < dailyGroups.length) {
            setCurrentGroup(dailyGroups[currentRound]);
            setGuess(null);
            setPhase('playing');
            setMapExpanded(false);
            setShowDescription(false);
            setTimeLeft(TIMER_DURATION);
            startTimeRef.current = Date.now();
        }
    }, [currentRound, dailyGroups]);


    const handleGuessSubmit = useCallback(() => {
        if (!guess) return;

        const finalTimeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const distance = calculateDistance(
            currentGroup.lat,
            currentGroup.lng,
            guess.lat,
            guess.lng
        );
        
        // Base score from distance
        let baseScore = calculateScore(distance);
        
        // Time bonus: faster = more points (up to 1.5x multiplier)
        const timeMultiplier = Math.max(0.5, 1.5 - (finalTimeSpent / TIMER_DURATION) * 0.5);
        
        // Final score
        const score = Math.round(baseScore * timeMultiplier);

        const result: RoundResult = {
            ethnicGroup: currentGroup,
            guess,
            distance,
            score,
            timeSpent: finalTimeSpent,
            hintsUsed: 0
        };

        setRoundHistory(prev => [...prev, result]);
        setTotalScore(prev => prev + score);
        setPhase('result');
        
        // Clear timer
        if (timerRef.current) {
            window.clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, [guess, currentGroup]);

    const handleNextRound = useCallback(() => {
        if (currentRound < dailyGroups.length - 1) {
            setCurrentRound(prev => prev + 1);
        }
    }, [currentRound, dailyGroups.length]);

    const handleReset = useCallback(() => {
        const newGroups = getDailyEthnicGroups();
        setCurrentRound(0);
        setCurrentGroup(newGroups[0]);
        setGuess(null);
        setPhase('playing');
        setTotalScore(0);
        setRoundHistory([]);
        setMapExpanded(false);
        setShowDescription(false);
        setTimeLeft(TIMER_DURATION);
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const isGameComplete = roundHistory.length >= dailyGroups.length;

    return (
        <div className="ethnoguesser-container">
            <header className="ethnoguesser-header">
                <button className="btn-back" onClick={onBack}>
                    ← Back
                </button>
                <div className="ethnoguesser-title-section">
                    <h1>EthnoGuesser</h1>
                    <span className="ethnoguesser-subtitle">Daily Challenge</span>
                </div>
                <div className="ethnoguesser-stats">
                    <div className="ethno-stat">
                        <span className="ethno-stat-label">Round</span>
                        <span className="ethno-stat-value">{currentRound + 1}/{dailyGroups.length}</span>
                    </div>
                    <div className="ethno-stat">
                        <span className="ethno-stat-label">Score</span>
                        <span className="ethno-stat-value">{totalScore.toLocaleString()}</span>
                    </div>
                    <div className="ethno-stat">
                        <span className="ethno-stat-label">Time</span>
                        <span className={`ethno-stat-value ${timeLeft <= 5 ? 'time-warning' : ''}`}>
                            {timeLeft}s
                        </span>
                    </div>
                </div>
            </header>

            <main className="ethnoguesser-main">
                {phase === 'playing' ? (
                    <div className={`ethnoguesser-game ${mapExpanded ? 'map-expanded' : ''}`}>
                        <div className="ethnic-group-display">
                            <div className="ethnic-group-header">
                                <h2 className="ethnic-group-name-hidden">Guess the Ethnic Group</h2>
                                <button 
                                    className="btn-toggle-description"
                                    onClick={() => setShowDescription(!showDescription)}
                                >
                                    {showDescription ? '▼ Hide Info' : '▲ Show Info'}
                                </button>
                            </div>
                            
                            {showDescription && (
                                <div className="ethnic-group-info">
                                    <p className="ethnic-group-hint">
                                        Look at the facial composite images below and guess where this ethnic group is from on the map.
                                        <br />
                                        <small>Faster guesses and no hints = higher scores!</small>
                                    </p>
                                </div>
                            )}

                            <div className="ethnic-group-images">
                                <FacialComposite
                                    imageUrl={getEthnicGroupImageUrl(currentGroup, 'male')}
                                    label="Male Average"
                                    alt="Male facial composite"
                                    fallbackUrls={getEthnicGroupImageFallbackUrls(currentGroup, 'male')}
                                />
                                <FacialComposite
                                    imageUrl={getEthnicGroupImageUrl(currentGroup, 'female')}
                                    label="Female Average"
                                    alt="Female facial composite"
                                    fallbackUrls={getEthnicGroupImageFallbackUrls(currentGroup, 'female')}
                                />
                            </div>
                            
                            <p className="image-source-hint">
                                Anthropological facial composites generated with AI from the Human Phenotype Ontology
                            </p>
                        </div>

                        <div className={`guess-panel ${mapExpanded ? 'expanded' : ''}`}>
                            <button 
                                className="map-toggle"
                                onClick={() => setMapExpanded(!mapExpanded)}
                            >
                                {mapExpanded ? '▼ Minimize Map' : '▲ Expand Map'}
                            </button>
                            
                            <GuessMap 
                                guess={guess}
                                onGuess={setGuess}
                                expanded={mapExpanded}
                            />
                            
                            <div className="guess-panel-actions">
                                <button 
                                    className="btn-submit-guess"
                                    onClick={handleGuessSubmit}
                                    disabled={!guess}
                                >
                                    {guess ? 'Submit Guess' : 'Click on the map to guess'}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <EthnoResults
                        ethnicGroup={roundHistory[roundHistory.length - 1]?.ethnicGroup || currentGroup}
                        guess={roundHistory[roundHistory.length - 1]?.guess || guess!}
                        distance={roundHistory[roundHistory.length - 1]?.distance || 0}
                        score={roundHistory[roundHistory.length - 1]?.score || 0}
                        totalScore={totalScore}
                        roundNumber={currentRound + 1}
                        totalRounds={dailyGroups.length}
                        timeSpent={roundHistory[roundHistory.length - 1]?.timeSpent || 0}
                        hintsUsed={0}
                        isGameComplete={isGameComplete}
                        onNextRound={handleNextRound}
                        onReset={handleReset}
                    />
                )}
            </main>
        </div>
    );
};
