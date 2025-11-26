import React from 'react';
import type { Country } from '../types';

interface CountryGridProps {
    guessedCountries: Set<string>;
    allCountries: Country[];
    showAll?: boolean;
}

export const CountryGrid: React.FC<CountryGridProps> = ({ guessedCountries, allCountries, showAll = false }) => {
    // Sort guessed countries to appear at the top or just filter them?
    // The original game fills slots. Let's try to show all slots but only reveal guessed ones.
    // Or maybe just show the guessed ones in a nice grid.
    // "Clone the functionality" -> Original has a table/grid that fills in.
    // Let's do a grid of all countries, sorted alphabetically, but hidden until guessed.

    // Actually, sorting alphabetically makes it easier to find missing ones.
    // So we render all countries, but if not guessed, we show a placeholder.

    return (
        <div className="country-grid-container">
            <div className="country-grid">
                {allCountries.map((country) => {
                    const isGuessed = guessedCountries.has(country.code);
                    const shouldShow = showAll || isGuessed;
                    const isUnguessed = showAll && !isGuessed;
                    
                    return (
                        <div 
                            key={country.code} 
                            className={`country-card ${shouldShow ? 'revealed' : 'hidden'} ${isUnguessed ? 'unguessed' : ''}`}
                        >
                            {shouldShow ? (
                                <>
                                    <img
                                        src={`https://flagcdn.com/w80/${country.code.toLowerCase()}.png`}
                                        alt={`Flag of ${country.name}`}
                                        className="country-flag"
                                        loading="lazy"
                                    />
                                    <span className="country-name">{country.name}</span>
                                </>
                            ) : (
                                <div className="country-placeholder"></div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
