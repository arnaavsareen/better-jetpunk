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
let scriptElement: HTMLScriptElement | null = null;

function loadGoogleMapsScript(): Promise<void> {
    return new Promise((resolve, reject) => {
        if (!API_KEY) {
            reject(new Error('API key not configured'));
            return;
        }

        // Check if script is already in the DOM
        if (scriptElement && document.head.contains(scriptElement)) {
            if (isScriptLoaded) {
                resolve();
                return;
            }
            // Script is loading, add to callbacks
            loadCallbacks.push(() => resolve());
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

        // Check if script already exists in DOM (from previous load)
        const existingScript = document.querySelector(`script[src*="maps.googleapis.com/maps/api/js"]`);
        if (existingScript) {
            scriptElement = existingScript as HTMLScriptElement;
            // If script exists, check if it's fully loaded (including StreetViewService)
            if (window.google && window.google.maps && window.google.maps.StreetViewService) {
                // Already loaded and ready
                isScriptLoaded = true;
                isScriptLoading = false;
                loadCallbacks.forEach(cb => cb());
                loadCallbacks.length = 0;
            } else {
                // Still loading, wait for it to be fully ready
                const checkLoaded = setInterval(() => {
                    if (window.google && window.google.maps && window.google.maps.StreetViewService) {
                        clearInterval(checkLoaded);
                        isScriptLoaded = true;
                        isScriptLoading = false;
                        loadCallbacks.forEach(cb => cb());
                        loadCallbacks.length = 0;
                    }
                }, 100);
                
                // Timeout after 10 seconds
                setTimeout(() => {
                    clearInterval(checkLoaded);
                    if (!isScriptLoaded) {
                        // Script exists but didn't load properly
                        isScriptLoading = false;
                        loadCallbacks.forEach(cb => {
                            try {
                                cb();
                            } catch (e) {
                                // Ignore callback errors
                            }
                        });
                        loadCallbacks.length = 0;
                    }
                }, 10000);
            }
            return;
        }

        scriptElement = document.createElement('script');
        scriptElement.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&loading=async`;
        scriptElement.async = true;
        scriptElement.defer = true;
        
        scriptElement.onload = () => {
            // Wait a bit for all Google Maps classes to be available
            const waitForReady = setInterval(() => {
                if (window.google && window.google.maps && window.google.maps.StreetViewService) {
                    clearInterval(waitForReady);
                    isScriptLoaded = true;
                    isScriptLoading = false;
                    loadCallbacks.forEach(cb => {
                        try {
                            cb();
                        } catch (e) {
                            console.error('Error in load callback:', e);
                        }
                    });
                    loadCallbacks.length = 0;
                }
            }, 50);
            
            // Timeout after 5 seconds
            setTimeout(() => {
                clearInterval(waitForReady);
                if (!isScriptLoaded) {
                    console.error('Google Maps API loaded but StreetViewService not available');
                    isScriptLoading = false;
                    loadCallbacks.forEach(cb => {
                        try {
                            cb();
                        } catch (e) {
                            // Ignore callback errors
                        }
                    });
                    loadCallbacks.length = 0;
                }
            }, 5000);
        };

        scriptElement.onerror = () => {
            isScriptLoading = false;
            scriptElement = null;
            reject(new Error('Failed to load Google Maps'));
        };

        document.head.appendChild(scriptElement);
    });
}

export const StreetView: React.FC<StreetViewProps> = ({ lat, lng, onLocationFound, onLocationUnavailable }) => {
    const streetViewRef = useRef<HTMLDivElement>(null);
    const panoramaRef = useRef<google.maps.StreetViewPanorama | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [key, setKey] = useState(0); // Force re-render key
    const requestIdRef = useRef<number>(0);
    const loadingTimeoutRef = useRef<number | null>(null);

    const initStreetView = useCallback(async (): Promise<(() => void) | undefined> => {
        if (!API_KEY) {
            setError('API key not configured. Please set VITE_MAPS_API_KEY in your .env file.');
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        // Clear any existing timeout
        if (loadingTimeoutRef.current) {
            clearTimeout(loadingTimeoutRef.current);
        }

        // Set a timeout to detect if Street View is stuck loading (black screen)
        // Use shorter timeout to catch issues faster
        loadingTimeoutRef.current = window.setTimeout(() => {
            if (currentRequestId === requestIdRef.current) {
                console.warn('Street View loading timeout - trying new location');
                setIsLoading(false);
                // Clear the panorama if it exists
                if (panoramaRef.current) {
                    try {
                        google.maps.event.clearInstanceListeners(panoramaRef.current);
                    } catch (e) {
                        // Ignore errors
                    }
                    panoramaRef.current = null;
                }
                if (streetViewRef.current) {
                    streetViewRef.current.innerHTML = '';
                }
                if (onLocationUnavailable) {
                    onLocationUnavailable();
                }
            }
        }, 6000); // 6 second timeout - more aggressive

        // Increment request ID to track the current request
        const currentRequestId = ++requestIdRef.current;

        try {
            await loadGoogleMapsScript();

            // Check if this request is still valid
            if (currentRequestId !== requestIdRef.current) {
                return;
            }

            // Verify Google Maps API is fully loaded
            if (!window.google || !window.google.maps || !window.google.maps.StreetViewService) {
                console.error('Google Maps API not fully loaded');
                setError('Google Maps API failed to load. Please check your API key.');
                setIsLoading(false);
                return;
            }

            if (!streetViewRef.current) return;

            // Clean up existing panorama before creating a new one
            if (panoramaRef.current) {
                try {
                    // Remove all event listeners
                    google.maps.event.clearInstanceListeners(panoramaRef.current);
                } catch (e) {
                    // Ignore errors during cleanup
                }
                // Clear the panorama from the DOM
                if (streetViewRef.current) {
                    streetViewRef.current.innerHTML = '';
                }
                panoramaRef.current = null;
            }

            // Use StreetViewService to find the nearest panorama
            // Double-check that StreetViewService exists before using it
            if (typeof google.maps.StreetViewService !== 'function') {
                console.error('StreetViewService is not available');
                setError('Street View service unavailable. Please refresh the page.');
                setIsLoading(false);
                return;
            }
            
            const sv = new google.maps.StreetViewService();
            
            sv.getPanorama({
                location: { lat, lng },
                radius: 20000, // Search within 20km (reduced to get closer to original location with clues)
                preference: google.maps.StreetViewPreference.NEAREST,
                source: google.maps.StreetViewSource.DEFAULT // Try all sources, not just outdoor
            }, (data, status) => {
                // Check if this callback is for the current request
                if (currentRequestId !== requestIdRef.current) {
                    return;
                }

                // Clear loading timeout
                if (loadingTimeoutRef.current) {
                    clearTimeout(loadingTimeoutRef.current);
                    loadingTimeoutRef.current = null;
                }

                if (status === google.maps.StreetViewStatus.OK && data?.location?.latLng) {
                    const actualLat = data.location.latLng.lat();
                    const actualLng = data.location.latLng.lng();
                    
                    // Report the actual location found
                    if (onLocationFound) {
                        onLocationFound(actualLat, actualLng);
                    }

                    const heading = Math.floor(Math.random() * 360);

                    // Store timeout IDs for cleanup (outside if block so it's accessible)
                    const timeoutIds: number[] = [];

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

                        // Add multiple listeners to detect issues
                        panoramaRef.current.addListener('status_changed', () => {
                            if (panoramaRef.current && currentRequestId === requestIdRef.current) {
                                const status = panoramaRef.current.getStatus();
                                if (status !== google.maps.StreetViewStatus.OK) {
                                    console.warn('Street View status changed to non-OK:', status);
                                    setIsLoading(false);
                                    if (onLocationUnavailable) {
                                        onLocationUnavailable();
                                    }
                                }
                            }
                        });
                        
                        // Check if panorama actually loaded and is visible after delays
                        const checkPanorama = (delay: number) => {
                            const timeoutId = window.setTimeout(() => {
                                // Only check if this is still the current request
                                if (panoramaRef.current && currentRequestId === requestIdRef.current) {
                                    const status = panoramaRef.current.getStatus();
                                    if (status !== google.maps.StreetViewStatus.OK) {
                                        console.warn(`Street View status check failed after ${delay}ms:`, status);
                                        setIsLoading(false);
                                        // Clean up
                                        if (panoramaRef.current) {
                                            try {
                                                google.maps.event.clearInstanceListeners(panoramaRef.current);
                                            } catch (e) {
                                                // Ignore
                                            }
                                            panoramaRef.current = null;
                                        }
                                        if (streetViewRef.current) {
                                            streetViewRef.current.innerHTML = '';
                                        }
                                        if (onLocationUnavailable) {
                                            onLocationUnavailable();
                                        }
                                        return;
                                    }

                                    // Additional check: verify the panorama is actually rendering
                                    // If status is OK but we still see issues, it might be a black screen
                                    if (streetViewRef.current) {
                                        const container = streetViewRef.current;
                                        const hasContent = container.children.length > 0;
                                        const hasCanvas = Array.from(container.querySelectorAll('canvas')).length > 0;
                                        
                                        if (!hasContent || !hasCanvas) {
                                            console.warn(`Street View appears to have no content after ${delay}ms`);
                                            setIsLoading(false);
                                            if (panoramaRef.current) {
                                                try {
                                                    google.maps.event.clearInstanceListeners(panoramaRef.current);
                                                } catch (e) {
                                                    // Ignore
                                                }
                                                panoramaRef.current = null;
                                            }
                                            if (streetViewRef.current) {
                                                streetViewRef.current.innerHTML = '';
                                            }
                                            if (onLocationUnavailable) {
                                                onLocationUnavailable();
                                            }
                                            return;
                                        }
                                    }
                                }
                            }, delay);
                            
                            timeoutIds.push(timeoutId);
                        };

                        // Check after 2 seconds, 4 seconds, and 6 seconds
                        checkPanorama(2000);
                        checkPanorama(4000);
                        checkPanorama(6000);
                    }
                    setIsLoading(false);
                    
                    // Return cleanup function for timeouts
                    return () => {
                        timeoutIds.forEach((id: number) => clearTimeout(id));
                    };
                } else {
                    // Notify parent that Street View is unavailable - it will try a new location
                    setIsLoading(false);
                    if (onLocationUnavailable) {
                        onLocationUnavailable();
                    } else {
                        setError('No Street View available for this location. Try again!');
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
            return undefined;
        }
    }, [lat, lng, onLocationFound, onLocationUnavailable]);

    // Initialize/update street view when coordinates change
    useEffect(() => {
        let timeoutCleanup: (() => void) | undefined;
        
        initStreetView().then((cleanup) => {
            timeoutCleanup = cleanup;
        }).catch(() => {
            // Ignore errors
        });

        // Cleanup function
        return () => {
            // Increment request ID to cancel any pending requests
            requestIdRef.current++;
            // Clear timeout
            if (loadingTimeoutRef.current) {
                clearTimeout(loadingTimeoutRef.current);
                loadingTimeoutRef.current = null;
            }
            // Clean up panorama
            if (panoramaRef.current) {
                try {
                    // Remove all event listeners
                    google.maps.event.clearInstanceListeners(panoramaRef.current);
                } catch (e) {
                    // Ignore errors during cleanup
                }
                panoramaRef.current = null;
            }
            if (streetViewRef.current) {
                streetViewRef.current.innerHTML = '';
            }
            // Call cleanup from initStreetView if it exists
            if (timeoutCleanup) {
                timeoutCleanup();
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
            <div 
                ref={streetViewRef} 
                className="streetview-panorama"
                style={{
                    width: '100%',
                    height: '100%',
                    minHeight: '400px',
                    background: '#000'
                }}
            />
            {!isLoading && !error && (
                <div className="streetview-overlay">
                    <span className="streetview-hint">
                        🔍 Look around for clues • Guess the location below
                    </span>
                </div>
            )}
        </div>
    );
};
