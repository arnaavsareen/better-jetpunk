import React, { useRef, useEffect, useState } from 'react';

interface InputAreaProps {
    value: string;
    onChange: (value: string) => void;
    status: 'idle' | 'playing' | 'won' | 'lost';
    onStart: () => void;
}

export const InputArea: React.FC<InputAreaProps> = ({ value, onChange, status, onStart }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [stickyTop, setStickyTop] = useState(0);

    // Calculate header height for sticky positioning
    useEffect(() => {
        const updateStickyTop = () => {
            const header = document.querySelector('.game-header') as HTMLElement;
            if (header && containerRef.current) {
                const headerHeight = header.offsetHeight;
                setStickyTop(headerHeight);
            }
        };

        updateStickyTop();
        window.addEventListener('resize', updateStickyTop);
        
        // Also update after a short delay to ensure header is rendered
        const timeout = setTimeout(updateStickyTop, 100);

        return () => {
            window.removeEventListener('resize', updateStickyTop);
            clearTimeout(timeout);
        };
    }, []);

    useEffect(() => {
        if (status === 'playing' && inputRef.current) {
            inputRef.current.focus();
        }
    }, [status]);

    // Prevent screen from scrolling when input is focused (especially on mobile)
    useEffect(() => {
        const input = inputRef.current;
        if (!input || status !== 'playing') return;

        let scrollPosition = window.scrollY || window.pageYOffset;
        let isPreventingScroll = false;

        const saveScrollPosition = () => {
            scrollPosition = window.scrollY || window.pageYOffset;
        };

        const preventScroll = () => {
            if (isPreventingScroll && document.activeElement === input) {
                window.scrollTo({
                    top: scrollPosition,
                    behavior: 'auto'
                });
            }
        };

        const handleFocus = () => {
            saveScrollPosition();
            isPreventingScroll = true;
            // Prevent scroll immediately and after a short delay for mobile browsers
            requestAnimationFrame(() => {
                window.scrollTo({
                    top: scrollPosition,
                    behavior: 'auto'
                });
            });
            setTimeout(() => {
                window.scrollTo({
                    top: scrollPosition,
                    behavior: 'auto'
                });
                isPreventingScroll = false;
            }, 100);
        };

        input.addEventListener('focus', handleFocus);
        window.addEventListener('scroll', preventScroll, { passive: false });

        return () => {
            input.removeEventListener('focus', handleFocus);
            window.removeEventListener('scroll', preventScroll);
        };
    }, [status]);

    return (
        <div 
            ref={containerRef}
            className="input-area"
            style={{ top: stickyTop > 0 ? `${stickyTop}px` : '0' }}
        >
            {status === 'idle' ? (
                <button className="btn-start" onClick={onStart}>
                    Start Quiz
                </button>
            ) : (
                <div className="input-wrapper">
                    <input
                        ref={inputRef}
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={status === 'playing' ? "Type a country..." : "Game Over"}
                        disabled={status !== 'playing'}
                        className="game-input"
                        autoFocus
                    />
                    <div className="input-underline"></div>
                </div>
            )}

            {status === 'won' && <div className="message success">Congratulations! You named them all!</div>}
            {status === 'lost' && <div className="message error">Time's up! Check what you missed below.</div>}
        </div>
    );
};
