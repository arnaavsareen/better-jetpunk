import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import countriesData from '../../data/countries.json';
import type { Country } from '../../types';
import { findBestFuzzyMatch } from '../../utils/fuzzyMatch';

interface FlagGuesserProps {
    onBack: () => void;
}

type GamePhase = 'playing' | 'gameover' | 'victory';

// Shuffle array using Fisher-Yates algorithm
function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

export const FlagGuesser: React.FC<FlagGuesserProps> = ({ onBack }) => {
    const countries = useMemo(() => countriesData as Country[], []);
    const [shuffledCountries, setShuffledCountries] = useState<Country[]>(() => shuffleArray(countries));
    const [currentIndex, setCurrentIndex] = useState(0);
    const [wrongCount, setWrongCount] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [guess, setGuess] = useState('');
    const [phase, setPhase] = useState<GamePhase>('playing');
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
    const [lastCorrectAnswer, setLastCorrectAnswer] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const currentCountry = shuffledCountries[currentIndex];
    const totalCountries = shuffledCountries.length;
    const maxWrong = 3;
    const livesLeft = maxWrong - wrongCount;

    // Focus input on mount and when moving to next flag
    useEffect(() => {
        if (phase === 'playing' && inputRef.current) {
            inputRef.current.focus();
        }
    }, [phase, currentIndex]);

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (!guess.trim() || phase !== 'playing') return;

        const guessedCodes = new Set<string>();
        const match = findBestFuzzyMatch(guess.trim(), [currentCountry], guessedCodes);

        if (match) {
            // Correct!
            setFeedback('correct');
            setCorrectCount(prev => prev + 1);
            setLastCorrectAnswer(null);

            setTimeout(() => {
                setFeedback(null);
                setGuess('');
                
                if (currentIndex + 1 >= totalCountries) {
                    setPhase('victory');
                } else {
                    setCurrentIndex(prev => prev + 1);
                }
            }, 600);
        } else {
            // Wrong!
            setFeedback('wrong');
            const newWrongCount = wrongCount + 1;
            setWrongCount(newWrongCount);
            setLastCorrectAnswer(currentCountry.name);

            setTimeout(() => {
                setFeedback(null);
                setGuess('');

                if (newWrongCount >= maxWrong) {
                    setPhase('gameover');
                } else {
                    // Move to next flag even on wrong answer
                    if (currentIndex + 1 >= totalCountries) {
                        setPhase('victory');
                    } else {
                        setCurrentIndex(prev => prev + 1);
                    }
                }
            }, 1500);
        }
    }, [guess, phase, currentCountry, currentIndex, totalCountries, wrongCount]);

    const handleRestart = useCallback(() => {
        setShuffledCountries(shuffleArray(countries));
        setCurrentIndex(0);
        setWrongCount(0);
        setCorrectCount(0);
        setGuess('');
        setPhase('playing');
        setFeedback(null);
        setLastCorrectAnswer(null);
    }, [countries]);

    const getFlagUrl = (code: string) => {
        return `https://flagcdn.com/w640/${code.toLowerCase()}.png`;
    };

    // Render lives as hearts
    const renderLives = () => {
        return (
            <div className="flag-lives">
                {Array.from({ length: maxWrong }).map((_, i) => (
                    <span 
                        key={i} 
                        className={`flag-heart ${i < livesLeft ? 'alive' : 'dead'}`}
                    >
                        {i < livesLeft ? '❤️' : '🖤'}
                    </span>
                ))}
            </div>
        );
    };

    if (phase === 'gameover') {
        return (
            <div className="flag-container">
                <div className="flag-gameover">
                    <div className="flag-gameover-icon">💔</div>
                    <h2>Game Over!</h2>
                    <p className="flag-gameover-stats">
                        You got <span className="flag-stat-highlight">{correctCount}</span> out of <span className="flag-stat-highlight">{totalCountries}</span> flags
                    </p>
                    <p className="flag-gameover-last">
                        The last flag was: <strong>{currentCountry.name}</strong>
                    </p>
                    <img 
                        src={getFlagUrl(currentCountry.code)} 
                        alt="Last flag"
                        className="flag-gameover-flag"
                    />
                    <div className="flag-gameover-actions">
                        <button className="btn-play-again" onClick={handleRestart}>
                            Play Again
                        </button>
                        <button className="btn-back-home" onClick={onBack}>
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (phase === 'victory') {
        return (
            <div className="flag-container">
                <div className="flag-victory">
                    <div className="flag-victory-icon">🏆</div>
                    <h2>Amazing!</h2>
                    <p className="flag-victory-message">
                        You named all {totalCountries} flags!
                    </p>
                    <p className="flag-victory-stats">
                        Wrong guesses: <span className="flag-stat-highlight">{wrongCount}</span> / {maxWrong}
                    </p>
                    <div className="flag-gameover-actions">
                        <button className="btn-play-again" onClick={handleRestart}>
                            Play Again
                        </button>
                        <button className="btn-back-home" onClick={onBack}>
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flag-container">
            <header className="flag-header">
                <button className="btn-back" onClick={onBack}>
                    ← Back
                </button>
                <div className="flag-title-section">
                    <h1>Guess the Flag</h1>
                    <span className="flag-subtitle">{correctCount} / {totalCountries}</span>
                </div>
                <div className="flag-stats">
                    {renderLives()}
                </div>
            </header>

            <main className="flag-main">
                <div className="flag-card">
                    <div className={`flag-image-wrapper ${feedback || ''}`}>
                        <img 
                            src={getFlagUrl(currentCountry.code)} 
                            alt="Guess this flag"
                            className="flag-image"
                        />
                    </div>

                    {feedback === 'wrong' && lastCorrectAnswer && (
                        <div className="flag-answer-reveal">
                            It was <strong>{lastCorrectAnswer}</strong>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flag-form">
                        <input
                            ref={inputRef}
                            type="text"
                            value={guess}
                            onChange={(e) => setGuess(e.target.value)}
                            placeholder="Type country name..."
                            className={`flag-input ${feedback || ''}`}
                            disabled={feedback !== null}
                            autoComplete="off"
                            autoCapitalize="off"
                            spellCheck="false"
                        />
                        <button 
                            type="submit" 
                            className="flag-submit"
                            disabled={!guess.trim() || feedback !== null}
                        >
                            Guess
                        </button>
                    </form>

                    <div className="flag-progress">
                        <div 
                            className="flag-progress-bar" 
                            style={{ width: `${(correctCount / totalCountries) * 100}%` }}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
};

