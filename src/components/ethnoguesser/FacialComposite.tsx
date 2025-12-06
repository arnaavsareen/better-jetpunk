import React, { useState, useEffect, useMemo, useRef } from 'react';

interface FacialCompositeProps {
    imageUrl: string;
    label: string;
    alt: string;
    fallbackUrls?: string[];
}

export const FacialComposite: React.FC<FacialCompositeProps> = ({ imageUrl, label, alt, fallbackUrls = [] }) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);
    const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
    const [imageLoaded, setImageLoaded] = useState(false);
    const prevImageUrlRef = useRef<string>('');
    
    // Update URLs when imageUrl or fallbackUrls change
    const allUrls = useMemo(() => {
        const urls = imageUrl ? [imageUrl, ...fallbackUrls] : fallbackUrls;
        return urls.filter(url => url && url.trim() !== '');
    }, [imageUrl, fallbackUrls]);

    useEffect(() => {
        // Only reset when imageUrl actually changes
        if (prevImageUrlRef.current !== imageUrl) {
            prevImageUrlRef.current = imageUrl;
            setImageError(false);
            setImageLoaded(false);
            setCurrentUrlIndex(0);
            
            // If no URLs available, show error immediately
            if (allUrls.length === 0) {
                setImageError(true);
                setImageLoading(false);
            } else {
                setImageLoading(true);
            }
        }
    }, [imageUrl]);

    const handleImageError = () => {
        // Try next URL in fallback list
        if (currentUrlIndex < allUrls.length - 1) {
            const nextIndex = currentUrlIndex + 1;
            setCurrentUrlIndex(nextIndex);
            setImageLoading(true);
            setImageLoaded(false);
        } else {
            // All URLs failed
            setImageError(true);
            setImageLoading(false);
        }
    };

    const handleImageLoad = () => {
        setImageLoading(false);
        setImageError(false);
        setImageLoaded(true);
    };

    const currentUrl = allUrls[currentUrlIndex] || '';

    return (
        <div className="facial-composite-container">
            <div className="composite-label">{label}</div>
            {imageError ? (
                <div className="composite-fallback">
                    <div className="fallback-icon">👤</div>
                    <p>Image unavailable</p>
                    <p className="fallback-hint">
                        Run: <code>node scripts/generate-phenotype-images.js</code>
                    </p>
                </div>
            ) : (
                <>
                    {currentUrl && (
                        <>
                            {imageLoading && !imageLoaded && (
                                <div className="composite-loading">
                                    <div className="loading-spinner-small"></div>
                                    <p>Loading image...</p>
                                </div>
                            )}
                            <img 
                                key={`${currentUrlIndex}-${currentUrl}`}
                                src={currentUrl}
                                alt={alt}
                                className="facial-composite"
                                onError={handleImageError}
                                onLoad={handleImageLoad}
                                style={{ 
                                    display: imageLoaded ? 'block' : 'none',
                                    opacity: imageLoaded ? 1 : 0,
                                    transition: 'opacity 0.3s ease-in',
                                    width: '100%',
                                    height: 'auto'
                                }}
                            />
                        </>
                    )}
                </>
            )}
        </div>
    );
};

