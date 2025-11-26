import { useState, useEffect, useCallback } from 'react';
import countriesData from '../data/countries.json';
import type { Country, GameStatus } from '../types';

const TOTAL_TIME = 15 * 60; // 15 minutes in seconds
const TOTAL_COUNTRIES = countriesData.length;

export const useGame = () => {
    const [status, setStatus] = useState<GameStatus>('idle');
    const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
    const [guessedCountries, setGuessedCountries] = useState<Set<string>>(new Set());
    const [inputValue, setInputValue] = useState('');
    const [showAllCountries, setShowAllCountries] = useState(false);

    // Timer logic
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (status === 'playing' && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        setStatus('lost');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [status, timeLeft]);

    const startGame = useCallback(() => {
        setStatus('playing');
        setTimeLeft(TOTAL_TIME);
        setGuessedCountries(new Set());
        setInputValue('');
        setShowAllCountries(false);
    }, []);

    const handleInput = useCallback((value: string) => {
        setInputValue(value);

        if (status !== 'playing') return;

        let normalizedInput = value.trim().toLowerCase();
        
        // Replace "st." or "st " with "saint " for Saint countries
        normalizedInput = normalizedInput.replace(/^st\.?\s+/i, 'saint ');

        // Common country abbreviations mapping
        const abbreviations: Record<string, string> = {
            'uae': 'AE', // United Arab Emirates
            'dr': 'DO',  // Dominican Republic
            'uk': 'GB',  // United Kingdom
            'usa': 'US', // United States
            'us': 'US',  // United States
            'congo': 'CG', // Republic of the Congo
            'drc': 'CD',   // Democratic Republic of the Congo
            'czech': 'CZ', // Czech Republic
            'south korea': 'KR',
            'north korea': 'KP',
            'saint kitts': 'KN', // Saint Kitts and Nevis
            'car': 'CF', // Central African Republic
            'trinidad': 'TT', // Trinidad and Tobago
            'antigua': 'AG', // Antigua and Barbuda
            'guinea bissau': 'GW', // Guinea-Bissau
            'sao tome': 'ST', // São Tomé and Príncipe
            'east timor': 'TL', // Timor-Leste
        };

        // Find if the input matches any country
        const match = countriesData.find((country) => {
            if (guessedCountries.has(country.code)) return false;
            
            // Check accepted names
            if (country.acceptedNames.some(name => name === normalizedInput)) return true;
            
            // Check abbreviations only (no country codes)
            if (abbreviations[normalizedInput] === country.code) return true;
            
            return false;
        });

        if (match) {
            setGuessedCountries((prev) => {
                const newSet = new Set(prev).add(match.code);
                if (newSet.size === TOTAL_COUNTRIES) {
                    setStatus('won');
                }
                return newSet;
            });
            setInputValue(''); // Clear input on correct guess
            // Optional: Add sound or visual feedback trigger here
        }
    }, [status, guessedCountries]);

    const giveUp = useCallback(() => {
        setStatus('lost');
        setShowAllCountries(true);
    }, []);

    return {
        status,
        timeLeft,
        score: guessedCountries.size,
        totalCountries: TOTAL_COUNTRIES,
        guessedCountries,
        inputValue,
        handleInput,
        startGame,
        giveUp,
        allCountries: countriesData as Country[],
        showAllCountries
    };
};
