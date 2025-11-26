import React from 'react';

interface CongratulationsProps {
    total: number;
}

const photos = [
    '/photos/IMG_3957.jpeg',
    '/photos/IMG_3958.jpeg',
    '/photos/IMG_3959.jpeg',
];

export const Congratulations: React.FC<CongratulationsProps> = ({ total }) => {
    const messages = [
        //"Winner Winner Chicken Dinner, Jello shots on you this weekend.",
        "Wow! You know every country in the world, now get some bitches.",
        //"You won but next time take a shot for every country you missed",
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
                
                <div className="congratulations-gallery">
                    {photos.map((photo, index) => (
                        <div key={index} className="gallery-item">
                            <img 
                                src={photo} 
                                alt={`Celebration ${index + 1}`}
                                className="gallery-image"
                                loading="lazy"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};