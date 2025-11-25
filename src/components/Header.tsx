import React from 'react';

interface HeaderProps {
    timeLeft: number;
    score: number;
    total: number;
    onGiveUp: () => void;
    status: 'idle' | 'playing' | 'won' | 'lost';
}

const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const Header: React.FC<HeaderProps> = ({ timeLeft, score, total, onGiveUp, status }) => {
    return (
        <header className="game-header">
            <div className="header-content">
                <div className="logo-section">
                    <h1>Better JetPunk</h1>
                    <span className="subtitle">Countries of the World</span>
                </div>

                <div className="stats-section">
                    <div className="stat-box">
                        <span className="stat-label">Time</span>
                        <span className={`stat-value ${timeLeft < 60 ? 'warning' : ''}`}>
                            {formatTime(timeLeft)}
                        </span>
                    </div>

                    <div className="stat-box">
                        <span className="stat-label">Score</span>
                        <span className="stat-value">{score}/{total}</span>
                    </div>
                </div>

                <div className="controls-section">
                    {status === 'playing' && (
                        <button className="btn-give-up" onClick={onGiveUp}>
                            Give Up
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};
