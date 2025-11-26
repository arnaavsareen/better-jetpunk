import React from 'react';
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

    return (
        <div className="game-container">
            <Confetti trigger={status === 'won'} />
            {status === 'won' && <Congratulations total={totalCountries} />}
            
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
