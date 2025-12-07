import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { EthnicGroup } from '../../data/ethnicGroups';

interface EthnoResultsProps {
    ethnicGroup: EthnicGroup;
    guess: { lat: number; lng: number };
    distance: number;
    score: number;
    totalScore: number;
    roundNumber: number;
    totalRounds: number;
    timeSpent: number;
    hintsUsed: number;
    isGameComplete: boolean;
    onNextRound: () => void;
    onReset: () => void;
}

export const EthnoResults: React.FC<EthnoResultsProps> = ({
    ethnicGroup,
    guess,
    distance,
    score,
    totalScore,
    roundNumber,
    totalRounds,
    timeSpent,
    isGameComplete,
    onNextRound,
    onReset
}) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const actualMarkerRef = useRef<L.Marker | null>(null);
    const guessMarkerRef = useRef<L.Marker | null>(null);
    const polylineRef = useRef<L.Polyline | null>(null);
    const tileLayerRef = useRef<L.TileLayer | null>(null);

    useEffect(() => {
        if (!mapRef.current) return;

        // Clean up existing map if it exists
        if (mapInstanceRef.current) {
            if (actualMarkerRef.current) {
                mapInstanceRef.current.removeLayer(actualMarkerRef.current);
                actualMarkerRef.current = null;
            }
            if (guessMarkerRef.current) {
                mapInstanceRef.current.removeLayer(guessMarkerRef.current);
                guessMarkerRef.current = null;
            }
            if (polylineRef.current) {
                mapInstanceRef.current.removeLayer(polylineRef.current);
                polylineRef.current = null;
            }
            if (tileLayerRef.current) {
                mapInstanceRef.current.removeLayer(tileLayerRef.current);
                tileLayerRef.current = null;
            }
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
        }

        // Clear the map container
        if (mapRef.current) {
            mapRef.current.innerHTML = '';
        }

        // Initialize map
        const map = L.map(mapRef.current, {
            center: [
                (ethnicGroup.lat + guess.lat) / 2,
                (ethnicGroup.lng + guess.lng) / 2
            ],
            zoom: 3,
            minZoom: 1,
            maxZoom: 18,
            worldCopyJump: true,
        });

        // Add tile layer
        const tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 20
        }).addTo(map);
        tileLayerRef.current = tileLayer;

        // Custom icons
        const actualIcon = L.divIcon({
            className: 'custom-marker',
            html: `<div class="marker-pin actual"></div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 30],
        });

        const guessIcon = L.divIcon({
            className: 'custom-marker',
            html: `<div class="marker-pin guess"></div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 30],
        });

        // Add actual location marker
        actualMarkerRef.current = L.marker(
            [ethnicGroup.lat, ethnicGroup.lng],
            { icon: actualIcon }
        ).addTo(map);
        actualMarkerRef.current.bindPopup(`<strong>${ethnicGroup.name}</strong><br>Actual location`).openPopup();

        // Add guess marker
        guessMarkerRef.current = L.marker(
            [guess.lat, guess.lng],
            { icon: guessIcon }
        ).addTo(map);
        guessMarkerRef.current.bindPopup(`<strong>Your Guess</strong>`);

        // Draw line between guess and actual
        const polyline = L.polyline(
            [[ethnicGroup.lat, ethnicGroup.lng], [guess.lat, guess.lng]],
            { color: '#ef4444', weight: 2, dashArray: '5, 5' }
        ).addTo(map);
        polylineRef.current = polyline;

        // Fit map to show both markers
        const group = new L.FeatureGroup([actualMarkerRef.current, guessMarkerRef.current]);
        map.fitBounds(group.getBounds().pad(0.2));

        mapInstanceRef.current = map;

        return () => {
            if (mapInstanceRef.current) {
                if (actualMarkerRef.current) {
                    mapInstanceRef.current.removeLayer(actualMarkerRef.current);
                }
                if (guessMarkerRef.current) {
                    mapInstanceRef.current.removeLayer(guessMarkerRef.current);
                }
                if (polylineRef.current) {
                    mapInstanceRef.current.removeLayer(polylineRef.current);
                }
                if (tileLayerRef.current) {
                    mapInstanceRef.current.removeLayer(tileLayerRef.current);
                }
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
            actualMarkerRef.current = null;
            guessMarkerRef.current = null;
            polylineRef.current = null;
            tileLayerRef.current = null;
        };
    }, [ethnicGroup.lat, ethnicGroup.lng, ethnicGroup.name, guess.lat, guess.lng]);

    const getRating = () => {
        if (distance < 100) return { text: 'Perfect!', emoji: '🎯' };
        if (distance < 500) return { text: 'Excellent!', emoji: '🌟' };
        if (distance < 1000) return { text: 'Great!', emoji: '👍' };
        if (distance < 2000) return { text: 'Good!', emoji: '✅' };
        if (distance < 5000) return { text: 'Not Bad', emoji: '🤔' };
        return { text: 'Keep Trying!', emoji: '💪' };
    };

    const rating = getRating();

    return (
        <div className="ethno-results">
            <div className="results-header">
                <div className="result-rating">
                    {rating.emoji} {rating.text}
                </div>
                <div className="result-location">
                    <span className="result-ethnic-group">{ethnicGroup.name}</span>
                </div>
            </div>

            <div className="results-stats">
                <div className="result-stat highlight">
                    <span className="result-stat-value">{score.toLocaleString()}</span>
                    <span className="result-stat-label">Points</span>
                </div>
                <div className="result-stat">
                    <span className="result-stat-value">{Math.round(distance).toLocaleString()} km</span>
                    <span className="result-stat-label">Distance</span>
                </div>
                <div className="result-stat">
                    <span className="result-stat-value">{timeSpent}s</span>
                    <span className="result-stat-label">Time</span>
                </div>
                <div className="result-stat">
                    <span className="result-stat-value">{totalScore.toLocaleString()}</span>
                    <span className="result-stat-label">Total Score</span>
                </div>
            </div>

            <div className="results-map-container">
                <div ref={mapRef} className="results-map" />
            </div>

            <div className="ethnic-group-details">
                <h3>About {ethnicGroup.name}</h3>
                <p>{ethnicGroup.description}</p>
                <div className="ethnic-details-meta">
                    <div className="detail-meta-item">
                        <span className="detail-label">Primary Region:</span>
                        <span className="detail-value">{ethnicGroup.primaryRegion}</span>
                    </div>
                    <div className="detail-meta-item">
                        <span className="detail-label">Region:</span>
                        <span className="detail-value">{ethnicGroup.region}</span>
                    </div>
                </div>
            </div>

            <div className="results-actions">
                {isGameComplete ? (
                    <>
                        <div className="game-complete-message">
                            <h2>🎉 Daily Challenge Complete!</h2>
                            <p>Final Score: <strong>{totalScore.toLocaleString()}</strong> points</p>
                        </div>
                        <button className="btn-reset" onClick={onReset}>
                            Play Again
                        </button>
                    </>
                ) : (
                    <>
                        <button className="btn-next-round" onClick={onNextRound}>
                            Next Round ({roundNumber}/{totalRounds})
                        </button>
                        <button className="btn-reset" onClick={onReset}>
                            Reset Game
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

