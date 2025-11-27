import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { GeoLocation } from '../../data/geoLocations';

interface GeoResultsProps {
    location: GeoLocation;
    guess: { lat: number; lng: number };
    distance: number;
    score: number;
    totalScore: number;
    onNextRound: () => void;
    onReset: () => void;
}

export const GeoResults: React.FC<GeoResultsProps> = ({
    location,
    guess,
    distance,
    score,
    totalScore,
    onNextRound,
    onReset
}) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);

    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;

        // Calculate center between guess and actual location
        const centerLat = (location.lat + guess.lat) / 2;
        const centerLng = (location.lng + guess.lng) / 2;

        const map = L.map(mapRef.current, {
            center: [centerLat, centerLng],
            zoom: 3,
            minZoom: 1,
            maxZoom: 18,
        });

        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap &copy; CARTO',
            subdomains: 'abcd',
            maxZoom: 20
        }).addTo(map);

        // Actual location marker (green)
        const actualIcon = L.divIcon({
            className: 'result-marker actual',
            html: `<div class="marker-pin actual"></div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 30],
        });

        // Guess marker (red)
        const guessIcon = L.divIcon({
            className: 'result-marker guess',
            html: `<div class="marker-pin guess"></div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 30],
        });

        // Add markers
        L.marker([location.lat, location.lng], { icon: actualIcon })
            .addTo(map)
            .bindPopup(`<strong>Actual Location</strong><br/>${location.city || ''} ${location.country}`);

        L.marker([guess.lat, guess.lng], { icon: guessIcon })
            .addTo(map)
            .bindPopup('<strong>Your Guess</strong>');

        // Draw line between guess and actual location
        L.polyline(
            [[guess.lat, guess.lng], [location.lat, location.lng]],
            { 
                color: '#000', 
                weight: 2, 
                dashArray: '5, 10',
                opacity: 0.7
            }
        ).addTo(map);

        // Fit bounds to show both markers
        const bounds = L.latLngBounds([
            [location.lat, location.lng],
            [guess.lat, guess.lng]
        ]);
        map.fitBounds(bounds, { padding: [50, 50] });

        mapInstanceRef.current = map;

        return () => {
            map.remove();
            mapInstanceRef.current = null;
        };
    }, [location, guess]);

    const formatDistance = (km: number): string => {
        if (km < 1) {
            return `${Math.round(km * 1000)} m`;
        } else if (km < 100) {
            return `${km.toFixed(1)} km`;
        } else {
            return `${Math.round(km).toLocaleString()} km`;
        }
    };

    const getScoreRating = (score: number): string => {
        if (score >= 4500) return 'Perfect!';
        if (score >= 4000) return 'Excellent!';
        if (score >= 3000) return 'Great!';
        if (score >= 2000) return 'Good';
        if (score >= 1000) return 'Not bad';
        return 'Keep trying!';
    };

    return (
        <div className="geo-results">
            <div className="results-header">
                <div className="result-rating">{getScoreRating(score)}</div>
                <div className="result-location">
                    {location.city && <span className="result-city">{location.city}, </span>}
                    <span className="result-country">{location.country}</span>
                </div>
            </div>

            <div className="results-stats">
                <div className="result-stat">
                    <span className="result-stat-value">{formatDistance(distance)}</span>
                    <span className="result-stat-label">away</span>
                </div>
                <div className="result-stat highlight">
                    <span className="result-stat-value">+{score.toLocaleString()}</span>
                    <span className="result-stat-label">points</span>
                </div>
                <div className="result-stat">
                    <span className="result-stat-value">{totalScore.toLocaleString()}</span>
                    <span className="result-stat-label">total</span>
                </div>
            </div>

            <div className="results-map-container">
                <div ref={mapRef} className="results-map" />
            </div>

            <div className="results-actions">
                <button className="btn-next-round" onClick={onNextRound}>
                    Next Round →
                </button>
                <button className="btn-reset" onClick={onReset}>
                    Start Over
                </button>
            </div>
        </div>
    );
};

