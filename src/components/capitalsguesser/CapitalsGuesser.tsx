import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { countriesCapitals, type CountryCapital } from '../../data/countriesCapitals';
import { fuzzyMatchCountry } from '../../utils/fuzzyMatch';

interface CapitalsGuesserProps {
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

// Check if guess matches capital (with fuzzy matching)
function checkCapitalMatch(guess: string, countryCapital: CountryCapital): boolean {
    const normalizedGuess = guess.trim().toLowerCase();
    const normalizedCapital = countryCapital.capital.toLowerCase();
    
    // Exact match
    if (normalizedGuess === normalizedCapital) return true;
    
    // Check accepted capitals
    for (const accepted of countryCapital.acceptedCapitals) {
        if (normalizedGuess === accepted.toLowerCase()) return true;
    }
    
    // Use fuzzy matching - treat capital like a country name for matching
    const match = fuzzyMatchCountry(guess, countryCapital.capital, countryCapital.acceptedCapitals);
    return match !== null && match >= 0.75;
}

export const CapitalsGuesser: React.FC<CapitalsGuesserProps> = ({ onBack }) => {
    const [shuffledCountries, setShuffledCountries] = useState<CountryCapital[]>(() => shuffleArray(countriesCapitals));
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

    // Focus input on mount and when moving to next country
    useEffect(() => {
        if (phase === 'playing' && inputRef.current) {
            inputRef.current.focus();
        }
    }, [phase, currentIndex]);

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (!guess.trim() || phase !== 'playing') return;

        const isCorrect = checkCapitalMatch(guess.trim(), currentCountry);

        if (isCorrect) {
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
            setLastCorrectAnswer(currentCountry.capital);

            setTimeout(() => {
                setFeedback(null);
                setGuess('');

                if (newWrongCount >= maxWrong) {
                    setPhase('gameover');
                } else {
                    // Move to next country even on wrong answer
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
        setShuffledCountries(shuffleArray(countriesCapitals));
        setCurrentIndex(0);
        setWrongCount(0);
        setCorrectCount(0);
        setGuess('');
        setPhase('playing');
        setFeedback(null);
        setLastCorrectAnswer(null);
    }, []);

    // Render lives as hearts
    const renderLives = () => {
        return (
            <div className="capitals-lives">
                {Array.from({ length: maxWrong }).map((_, i) => (
                    <span 
                        key={i} 
                        className={`capitals-heart ${i < livesLeft ? 'alive' : 'dead'}`}
                    >
                        {i < livesLeft ? '❤️' : '🖤'}
                    </span>
                ))}
            </div>
        );
    };

    if (phase === 'gameover') {
        return (
            <div className="capitals-container">
                <div className="capitals-gameover">
                    <div className="capitals-gameover-icon">💔</div>
                    <h2>Game Over!</h2>
                    <p className="capitals-gameover-stats">
                        You got <span className="capitals-stat-highlight">{correctCount}</span> out of <span className="capitals-stat-highlight">{totalCountries}</span> capitals
                    </p>
                    <p className="capitals-gameover-last">
                        The capital of <strong>{currentCountry.country}</strong> is <strong>{currentCountry.capital}</strong>
                    </p>
                    <div className="capitals-gameover-actions">
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
            <div className="capitals-container">
                <div className="capitals-victory">
                    <div className="capitals-victory-icon">🏆</div>
                    <h2>Amazing!</h2>
                    <p className="capitals-victory-message">
                        You named all {totalCountries} capitals!
                    </p>
                    <p className="capitals-victory-stats">
                        Wrong guesses: <span className="capitals-stat-highlight">{wrongCount}</span> / {maxWrong}
                    </p>
                    <div className="capitals-gameover-actions">
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
        <div className="capitals-container">
            <header className="capitals-header">
                <button className="btn-back" onClick={onBack}>
                    ← Back
                </button>
                <div className="capitals-title-section">
                    <h1>Countries & Capitals</h1>
                    <span className="capitals-subtitle">{correctCount} / {totalCountries}</span>
                </div>
                <div className="capitals-stats">
                    {renderLives()}
                </div>
            </header>

            <main className="capitals-main">
                <div className="capitals-card">
                    <div className={`capitals-country-wrapper ${feedback || ''}`}>
                        <div className="capitals-country-name">
                            {currentCountry.country}
                        </div>
                    </div>

                    {feedback === 'wrong' && lastCorrectAnswer && (
                        <div className="capitals-answer-reveal">
                            It was <strong>{lastCorrectAnswer}</strong>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="capitals-form">
                        <input
                            ref={inputRef}
                            type="text"
                            value={guess}
                            onChange={(e) => setGuess(e.target.value)}
                            placeholder="Type capital city..."
                            className={`capitals-input ${feedback || ''}`}
                            disabled={feedback !== null}
                            autoComplete="off"
                            autoCapitalize="off"
                            spellCheck="false"
                        />
                        <button 
                            type="submit" 
                            className="capitals-submit"
                            disabled={!guess.trim() || feedback !== null}
                        >
                            Guess
                        </button>
                    </form>

                    <div className="capitals-progress">
                        <div 
                            className="capitals-progress-bar" 
                            style={{ width: `${(correctCount / totalCountries) * 100}%` }}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
};

