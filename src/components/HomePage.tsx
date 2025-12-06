import React, { useState, useMemo } from 'react';

interface HomePageProps {
    onSelectGame: (game: 'countries' | 'geoguesser' | 'flagguesser' | 'capitalsguesser' | 'ethnoguesser' | 'generalknowledge') => void;
}

interface Game {
    id: 'countries' | 'geoguesser' | 'flagguesser' | 'capitalsguesser' | 'ethnoguesser' | 'generalknowledge';
    icon: string;
    title: string;
    description: string;
}

const games: Game[] = [
    {
        id: 'countries',
        icon: '🌍',
        title: 'Countries Quiz',
        description: 'Name all 196 countries of the world before time runs out'
    },
    {
        id: 'geoguesser',
        icon: '📍',
        title: 'GeoGuesser',
        description: 'Guess locations from street view images — unlimited rounds'
    },
    {
        id: 'flagguesser',
        icon: '🏳️',
        title: 'Guess the Flag',
        description: 'Name the country from its flag — 3 strikes and you\'re out'
    },
    {
        id: 'capitalsguesser',
        icon: '🏛️',
        title: 'Countries & Capitals',
        description: 'Name the capital of each country — 3 strikes and you\'re out'
    },
    {
        id: 'ethnoguesser',
        icon: '👥',
        title: 'EthnoGuesser',
        description: 'Guess ethnic groups from facial composites — daily challenge with 10 rounds'
    },
    {
        id: 'generalknowledge',
        icon: '🧠',
        title: 'General Knowledge',
        description: 'AI-generated quizzes on topics you choose — customize difficulty and test your knowledge'
    }
];

export const HomePage: React.FC<HomePageProps> = ({ onSelectGame }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredGames = useMemo(() => {
        if (!searchQuery.trim()) {
            return games;
        }
        
        const query = searchQuery.toLowerCase().trim();
        return games.filter(game => 
            game.title.toLowerCase().includes(query) ||
            game.description.toLowerCase().includes(query) ||
            game.id.toLowerCase().includes(query)
        );
    }, [searchQuery]);

    return (
        <div className="home-container">
            <header className="home-header">
                <h1 className="home-title">Better JetPunk</h1>
                <p className="home-subtitle">Choose your challenge</p>
            </header>

            <div className="home-search-container">
                <input
                    type="text"
                    className="home-search-input"
                    placeholder="Search games..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                    <button
                        className="home-search-clear"
                        onClick={() => setSearchQuery('')}
                        aria-label="Clear search"
                    >
                        ×
                    </button>
                )}
            </div>

            {filteredGames.length === 0 ? (
                <div className="home-no-results">
                    <p>No games found matching "{searchQuery}"</p>
                </div>
            ) : (
                <div className="game-cards">
                    {filteredGames.map((game) => (
                        <button 
                            key={game.id}
                            className="game-card" 
                            onClick={() => onSelectGame(game.id)}
                        >
                            <div className="game-card-icon">{game.icon}</div>
                            <h2 className="game-card-title">{game.title}</h2>
                            <p className="game-card-description">
                                {game.description}
                            </p>
                            <span className="game-card-action">Play Now →</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

