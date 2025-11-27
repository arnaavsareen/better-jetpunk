import { useState } from 'react'
import './styles/index.css'
import { Game } from './components/Game'
import { HomePage } from './components/HomePage'
import { GeoGuesser } from './components/geoguesser'

type GameType = 'home' | 'countries' | 'geoguesser';

function App() {
  const [currentGame, setCurrentGame] = useState<GameType>('home');

  const handleSelectGame = (game: 'countries' | 'geoguesser') => {
    setCurrentGame(game);
  };

  const handleBackToHome = () => {
    setCurrentGame('home');
  };

  return (
    <div className="app-container">
      {currentGame === 'home' && (
        <HomePage onSelectGame={handleSelectGame} />
      )}
      {currentGame === 'countries' && (
        <div className="game-wrapper">
          <button className="btn-home" onClick={handleBackToHome}>
            ← Home
          </button>
          <Game />
        </div>
      )}
      {currentGame === 'geoguesser' && (
        <GeoGuesser onBack={handleBackToHome} />
      )}
    </div>
  )
}

export default App
