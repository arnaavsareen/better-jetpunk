import React, { useState, useCallback } from 'react';
import type { GeoLocation } from '../../data/geoLocations';
import { getRandomLocation, calculateDistance, calculateScore } from '../../data/geoLocations';
import { StreetView } from './StreetView';
import { GuessMap } from './GuessMap';
import { GeoResults } from './GeoResults';

interface GeoGuesserProps {
    onBack: () => void;
}

type GamePhase = 'playing' | 'result';

interface RoundResult {
    location: GeoLocation;
    guess: { lat: number; lng: number } | null;
    distance: number;
    score: number;
}

export const GeoGuesser: React.FC<GeoGuesserProps> = ({ onBack }) => {
    const [currentLocation, setCurrentLocation] = useState<GeoLocation>(() => getRandomLocation());
    const [actualLocation, setActualLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [guess, setGuess] = useState<{ lat: number; lng: number } | null>(null);
    const [phase, setPhase] = useState<GamePhase>('playing');
    const [roundNumber, setRoundNumber] = useState(1);
    const [totalScore, setTotalScore] = useState(0);
    const [roundHistory, setRoundHistory] = useState<RoundResult[]>([]);
    const [mapExpanded, setMapExpanded] = useState(false);
    const [roundKey, setRoundKey] = useState(0); // Force Street View re-render

    // Track the actual location found by Street View
    const handleLocationFound = useCallback((lat: number, lng: number) => {
        setActualLocation({ lat, lng });
    }, []);

    const handleGuessSubmit = useCallback(() => {
        if (!guess) return;

        // Use the actual location found by Street View if available
        const targetLat = actualLocation?.lat ?? currentLocation.lat;
        const targetLng = actualLocation?.lng ?? currentLocation.lng;

        const distance = calculateDistance(
            targetLat,
            targetLng,
            guess.lat,
            guess.lng
        );
        const score = calculateScore(distance);

        const result: RoundResult = {
            location: {
                ...currentLocation,
                lat: targetLat,
                lng: targetLng,
            },
            guess,
            distance,
            score
        };

        setRoundHistory(prev => [...prev, result]);
        setTotalScore(prev => prev + score);
        setPhase('result');
    }, [guess, currentLocation, actualLocation]);

    const handleNextRound = useCallback(() => {
        const newLocation = getRandomLocation();
        setCurrentLocation(newLocation);
        setActualLocation(null);
        setGuess(null);
        setPhase('playing');
        setRoundNumber(prev => prev + 1);
        setMapExpanded(false);
        setRoundKey(prev => prev + 1); // Force Street View to reinitialize
    }, []);

    const handleReset = useCallback(() => {
        const newLocation = getRandomLocation();
        setCurrentLocation(newLocation);
        setActualLocation(null);
        setGuess(null);
        setPhase('playing');
        setRoundNumber(1);
        setTotalScore(0);
        setRoundHistory([]);
        setMapExpanded(false);
        setRoundKey(prev => prev + 1);
    }, []);

    return (
        <div className="geoguesser-container">
            <header className="geoguesser-header">
                <button className="btn-back" onClick={onBack}>
                    ← Back
                </button>
                <div className="geoguesser-title-section">
                    <h1>GeoGuesser</h1>
                    <span className="geoguesser-subtitle">Unlimited</span>
                </div>
                <div className="geoguesser-stats">
                    <div className="geo-stat">
                        <span className="geo-stat-label">Round</span>
                        <span className="geo-stat-value">{roundNumber}</span>
                    </div>
                    <div className="geo-stat">
                        <span className="geo-stat-label">Score</span>
                        <span className="geo-stat-value">{totalScore.toLocaleString()}</span>
                    </div>
                </div>
            </header>

            <main className="geoguesser-main">
                {phase === 'playing' ? (
                    <div className={`geoguesser-game ${mapExpanded ? 'map-expanded' : ''}`} style={{ height: '100%' }}>
                        <div className="streetview-container" style={{ width: '100%', height: '100%' }}>
                            <StreetView 
                                key={roundKey}
                                lat={currentLocation.lat} 
                                lng={currentLocation.lng}
                                onLocationFound={handleLocationFound}
                            />
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
                            
                            <button 
                                className="btn-submit-guess"
                                onClick={handleGuessSubmit}
                                disabled={!guess}
                            >
                                {guess ? 'Submit Guess' : 'Click on the map to guess'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <GeoResults
                        location={roundHistory[roundHistory.length - 1].location}
                        guess={guess!}
                        distance={roundHistory[roundHistory.length - 1].distance}
                        score={roundHistory[roundHistory.length - 1].score}
                        totalScore={totalScore}
                        onNextRound={handleNextRound}
                        onReset={handleReset}
                    />
                )}
            </main>
        </div>
    );
};
