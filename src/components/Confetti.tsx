import { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiProps {
    trigger: boolean;
}

export const Confetti: React.FC<ConfettiProps> = ({ trigger }) => {
    useEffect(() => {
        if (!trigger) return;

        const duration = 8000; // Tasteful duration
        const animationEnd = Date.now() + duration;
        const defaults = { 
            startVelocity: 60, // Prominent but not overwhelming
            spread: 360, 
            ticks: 100, // Good particle lifetime
            zIndex: 9999, // Make sure it's on top
            gravity: 0.9, // Natural gravity
            colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#98D8C8', '#F7DC6F', '#BB8FCE']
        };

        function randomInRange(min: number, max: number) {
            return Math.random() * (max - min) + min;
        }

        const interval = setInterval(function() {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 150 * (timeLeft / duration); // Tasteful amount
            
            // Launch confetti from both sides
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
            });
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
            });
        }, 200); // Tasteful frequency

        // Initial big burst from center
        confetti({
            ...defaults,
            particleCount: 150,
            origin: { x: 0.5, y: 0.5 }
        });
        
        // One follow-up burst for extra celebration
        setTimeout(() => {
            confetti({
                ...defaults,
                particleCount: 100,
                origin: { x: 0.5, y: 0.4 }
            });
        }, 400);

        return () => clearInterval(interval);
    }, [trigger]);

    return null;
};

