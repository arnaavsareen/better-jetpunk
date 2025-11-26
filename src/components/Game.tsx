import React, { useState, useEffect } from 'react';
import { useGame } from '../hooks/useGame';
import { Header } from './Header';
import { InputArea } from './InputArea';
import { CountryGrid } from './CountryGrid';
import { WorldMapComponent } from './WorldMap';
import { Confetti } from './Confetti';
import { Congratulations } from './Congratulations';

export const Game: React.FC = () => {
    const {
        status,
        timeLeft,
        score,
        totalCountries,
        guessedCountries,
        inputValue,
        handleInput,
        startGame,
        giveUp,
        allCountries,
        showAllCountries
    } = useGame();

    // Test mode: Press 'T' to show congratulations modal
    const [testMode, setTestMode] = useState(false);

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            // Press 'T' to toggle test mode (only when not in input field)
            if (e.key === 'T' || e.key === 't') {
                if (document.activeElement?.tagName !== 'INPUT') {
                    setTestMode(true);
                    // Auto-hide after 5 seconds
                    setTimeout(() => setTestMode(false), 5000);
                }
            }
            // Press 'Escape' to close test mode
            if (e.key === 'Escape') {
                setTestMode(false);
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);

    const showCongratulations = status === 'won' || testMode;

    return (
        <div className="game-container">
            <Confetti trigger={showCongratulations} />
            {showCongratulations && <Congratulations total={totalCountries} />}
            
            <Header
                timeLeft={timeLeft}
                score={score}
                total={totalCountries}
                onGiveUp={giveUp}
                status={status}
            />

            <main className="game-main">
                <InputArea
                    value={inputValue}
                    onChange={handleInput}
                    status={status}
                    onStart={startGame}
                />

                <WorldMapComponent
                    guessedCountries={guessedCountries}
                    allCountries={allCountries}
                    showAll={showAllCountries}
                />

                <CountryGrid
                    guessedCountries={guessedCountries}
                    allCountries={allCountries}
                    showAll={showAllCountries}
                />
            </main>
        </div>
    );
};
