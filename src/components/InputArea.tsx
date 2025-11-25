import React, { useRef, useEffect } from 'react';

interface InputAreaProps {
    value: string;
    onChange: (value: string) => void;
    status: 'idle' | 'playing' | 'won' | 'lost';
    onStart: () => void;
}

export const InputArea: React.FC<InputAreaProps> = ({ value, onChange, status, onStart }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (status === 'playing' && inputRef.current) {
            inputRef.current.focus();
        }
    }, [status]);

    return (
        <div className="input-area">
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
