import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface GuessMapProps {
    guess: { lat: number; lng: number } | null;
    onGuess: (guess: { lat: number; lng: number }) => void;
    expanded: boolean;
}

export const GuessMap: React.FC<GuessMapProps> = ({ guess, onGuess, expanded }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);

    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;

        // Initialize map
        const map = L.map(mapRef.current, {
            center: [20, 0],
            zoom: 2,
            minZoom: 1,
            maxZoom: 18,
            worldCopyJump: true,
        });

        // Add tile layer with a clean style
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 20
        }).addTo(map);

        // Custom marker icon
        const customIcon = L.divIcon({
            className: 'custom-marker',
            html: `<div class="marker-pin"></div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 30],
        });

        // Handle click to place marker
        map.on('click', (e: L.LeafletMouseEvent) => {
            const { lat, lng } = e.latlng;
            
            if (markerRef.current) {
                markerRef.current.setLatLng([lat, lng]);
            } else {
                markerRef.current = L.marker([lat, lng], { icon: customIcon }).addTo(map);
            }
            
            onGuess({ lat, lng });
        });

        mapInstanceRef.current = map;

        return () => {
            map.remove();
            mapInstanceRef.current = null;
            markerRef.current = null;
        };
    }, [onGuess]);

    // Handle map resize when expanded
    useEffect(() => {
        if (mapInstanceRef.current) {
            setTimeout(() => {
                mapInstanceRef.current?.invalidateSize();
            }, 300);
        }
    }, [expanded]);

    // Ensure map is properly sized on mount
    useEffect(() => {
        if (mapInstanceRef.current && mapRef.current) {
            setTimeout(() => {
                mapInstanceRef.current?.invalidateSize();
            }, 100);
        }
    }, []);

    // Update marker if guess changes externally
    useEffect(() => {
        if (!mapInstanceRef.current) return;
        
        if (guess && markerRef.current) {
            markerRef.current.setLatLng([guess.lat, guess.lng]);
        } else if (!guess && markerRef.current) {
            markerRef.current.remove();
            markerRef.current = null;
        }
    }, [guess]);

    return (
        <div className="guess-map-wrapper">
            <div ref={mapRef} className="guess-map" />
        </div>
    );
};

