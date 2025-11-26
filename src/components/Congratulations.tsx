import React from 'react';

interface CongratulationsProps {
    total: number;
}

export const Congratulations: React.FC<CongratulationsProps> = ({ total }) => {
    const messages = [
        "Incredible! You're a geography master!",
        "Wow! You know every country in the world!",
        "Amazing! You've conquered the world map!",
        "Outstanding! You're a true world traveler!",
        "Fantastic! You've mastered global geography!"
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    return (
        <div className="congratulations-overlay">
            <div className="congratulations-modal">
                <h1 className="congratulations-title">Congratulations!</h1>
                <p className="congratulations-message">{randomMessage}</p>
                <p className="congratulations-score">
                    You guessed all {total} countries!
                </p>
            </div>
        </div>
    );
};