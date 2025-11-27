import React, { useEffect, useRef, useState, useCallback } from 'react';

interface StreetViewProps {
    lat: number;
    lng: number;
    onLocationFound?: (lat: number, lng: number) => void;
    onLocationUnavailable?: () => void;
}

// Get API key from environment variable
const API_KEY = import.meta.env.VITE_MAPS_API_KEY as string | undefined;

// Track if script is loading/loaded
let isScriptLoaded = false;
let isScriptLoading = false;
const loadCallbacks: (() => void)[] = [];

function loadGoogleMapsScript(): Promise<void> {
    return new Promise((resolve, reject) => {
        if (!API_KEY) {
            reject(new Error('API key not configured'));
            return;
        }

        if (isScriptLoaded) {
            resolve();
            return;
        }

        loadCallbacks.push(() => resolve());

        if (isScriptLoading) {
            return;
        }

        isScriptLoading = true;

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}`;
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
            isScriptLoaded = true;
            isScriptLoading = false;
            loadCallbacks.forEach(cb => cb());
            loadCallbacks.length = 0;
        };

        script.onerror = () => {
            isScriptLoading = false;
            reject(new Error('Failed to load Google Maps'));
        };

        document.head.appendChild(script);
    });
}

export const StreetView: React.FC<StreetViewProps> = ({ lat, lng, onLocationFound, onLocationUnavailable }) => {
    const streetViewRef = useRef<HTMLDivElement>(null);
    const panoramaRef = useRef<google.maps.StreetViewPanorama | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [key, setKey] = useState(0); // Force re-render key
    const requestIdRef = useRef<number>(0);

    const initStreetView = useCallback(async () => {
        if (!API_KEY) {
            setError('API key not configured. Please set VITE_MAPS_API_KEY in your .env file.');
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        // Increment request ID to track the current request
        const currentRequestId = ++requestIdRef.current;

        try {
            await loadGoogleMapsScript();

            // Check if this request is still valid
            if (currentRequestId !== requestIdRef.current) {
                return;
            }

            if (!streetViewRef.current) return;

            // Clean up existing panorama before creating a new one
            if (panoramaRef.current) {
                // Clear the panorama from the DOM
                if (streetViewRef.current) {
                    streetViewRef.current.innerHTML = '';
                }
                panoramaRef.current = null;
            }

            // Use StreetViewService to find the nearest panorama
            const sv = new google.maps.StreetViewService();
            
            sv.getPanorama({
                location: { lat, lng },
                radius: 100000, // Search within 100km (increased from 50km)
                preference: google.maps.StreetViewPreference.NEAREST,
                source: google.maps.StreetViewSource.DEFAULT // Try all sources, not just outdoor
            }, (data, status) => {
                // Check if this callback is for the current request
                if (currentRequestId !== requestIdRef.current) {
                    return;
                }

                if (status === google.maps.StreetViewStatus.OK && data?.location?.latLng) {
                    const actualLat = data.location.latLng.lat();
                    const actualLng = data.location.latLng.lng();
                    
                    // Report the actual location found
                    if (onLocationFound) {
                        onLocationFound(actualLat, actualLng);
                    }

                    const heading = Math.floor(Math.random() * 360);

                    // Always create a new panorama instance
                    if (streetViewRef.current) {
                        panoramaRef.current = new google.maps.StreetViewPanorama(
                            streetViewRef.current,
                            {
                                position: { lat: actualLat, lng: actualLng },
                                pov: { heading, pitch: 0 },
                                zoom: 1,
                                addressControl: false,
                                showRoadLabels: false,
                                linksControl: true,
                                panControl: true,
                                enableCloseButton: false,
                                fullscreenControl: false,
                            }
                        );
                    }
                    setIsLoading(false);
                } else {
                    // Notify parent that Street View is unavailable - it will try a new location
                    if (onLocationUnavailable) {
                        onLocationUnavailable();
                    } else {
                        setError('No Street View available for this location. Try again!');
                        setIsLoading(false);
                    }
                }
            });
        } catch (err) {
            // Check if this error is for the current request
            if (currentRequestId !== requestIdRef.current) {
                return;
            }
            console.error('Error:', err);
            setError('Failed to load Street View');
            setIsLoading(false);
        }
    }, [lat, lng, onLocationFound, onLocationUnavailable]);

    // Initialize/update street view when coordinates change
    useEffect(() => {
        initStreetView();

        // Cleanup function
        return () => {
            // Increment request ID to cancel any pending requests
            requestIdRef.current++;
            // Clean up panorama
            if (panoramaRef.current) {
                panoramaRef.current = null;
            }
            if (streetViewRef.current) {
                streetViewRef.current.innerHTML = '';
            }
        };
    }, [lat, lng, key, initStreetView]);

    if (error) {
        return (
            <div className="streetview-wrapper" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '1rem',
                background: '#1a1a1a',
                color: '#fff'
            }}>
                <p style={{ fontSize: '1.25rem' }}>⚠️ {error}</p>
                <button 
                    onClick={() => setKey(k => k + 1)}
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: '#fff',
                        color: '#000',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '1rem'
                    }}
                >
                    Try Another Location
                </button>
            </div>
        );
    }

    return (
        <div className="streetview-wrapper">
            {isLoading && (
                <div className="streetview-loading" style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#1a1a1a',
                    color: '#fff',
                    zIndex: 10
                }}>
                    <p>Loading Street View...</p>
                </div>
            )}
            <div ref={streetViewRef} className="streetview-panorama" />
            <div className="streetview-overlay">
                <span className="streetview-hint">
                    🔍 Look around for clues • Guess the location below
                </span>
            </div>
        </div>
    );
};
