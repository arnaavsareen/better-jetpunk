import React from 'react';

interface HomePageProps {
    onSelectGame: (game: 'countries' | 'geoguesser') => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onSelectGame }) => {
    return (
        <div className="home-container">
            <header className="home-header">
                <h1 className="home-title">Better JetPunk</h1>
                <p className="home-subtitle">Choose your challenge</p>
            </header>

            <div className="game-cards">
                <button 
                    className="game-card" 
                    onClick={() => onSelectGame('countries')}
                >
                    <div className="game-card-icon">🌍</div>
                    <h2 className="game-card-title">Countries Quiz</h2>
                    <p className="game-card-description">
                        Name all 196 countries of the world before time runs out
                    </p>
                    <span className="game-card-action">Play Now →</span>
                </button>

                <button 
                    className="game-card" 
                    onClick={() => onSelectGame('geoguesser')}
                >
                    <div className="game-card-icon">📍</div>
                    <h2 className="game-card-title">GeoGuesser</h2>
                    <p className="game-card-description">
                        Guess locations from street view images — unlimited rounds
                    </p>
                    <span className="game-card-action">Play Now →</span>
                </button>
            </div>
        </div>
    );
};

