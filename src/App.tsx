import { useState } from 'react'
import './styles/index.css'
import { Game } from './components/Game'
import { HomePage } from './components/HomePage'
import { GeoGuesser } from './components/geoguesser'
import { FlagGuesser } from './components/flagguesser'
import { CapitalsGuesser } from './components/capitalsguesser'
import { EthnoGuesser } from './components/ethnoguesser'
import { GeneralKnowledge } from './components/generalknowledge'
import { ThemePicker } from './components/ThemePicker'
import { ThemeProvider } from './contexts/ThemeContext'

type GameType = 'home' | 'countries' | 'geoguesser' | 'flagguesser' | 'capitalsguesser' | 'ethnoguesser' | 'generalknowledge';

function App() {
  const [currentGame, setCurrentGame] = useState<GameType>('home');

  const handleSelectGame = (game: 'countries' | 'geoguesser' | 'flagguesser' | 'capitalsguesser' | 'ethnoguesser' | 'generalknowledge') => {
    setCurrentGame(game);
  };

  const handleBackToHome = () => {
    setCurrentGame('home');
  };

  return (
    <ThemeProvider>
      <div className="app-container">
        <div className="theme-picker-wrapper">
          <ThemePicker />
        </div>
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
      {currentGame === 'flagguesser' && (
        <FlagGuesser onBack={handleBackToHome} />
      )}
      {currentGame === 'capitalsguesser' && (
        <CapitalsGuesser onBack={handleBackToHome} />
      )}
      {currentGame === 'ethnoguesser' && (
        <EthnoGuesser onBack={handleBackToHome} />
      )}
      {currentGame === 'generalknowledge' && (
        <GeneralKnowledge onBack={handleBackToHome} />
      )}
      </div>
    </ThemeProvider>
  )
}

export default App
