import React, { useMemo } from 'react';
import type { Country } from '../types';
import { getContinent, continentOrder } from '../utils/continents';

interface CountryGridProps {
    guessedCountries: Set<string>;
    allCountries: Country[];
    showAll?: boolean;
}

export const CountryGrid: React.FC<CountryGridProps> = ({ guessedCountries, allCountries, showAll = false }) => {
    // Group countries by continent and sort alphabetically within each continent
    const countriesByContinent = useMemo(() => {
        const grouped: Record<string, Country[]> = {};
        
        allCountries.forEach(country => {
            const continent = getContinent(country.code);
            if (!grouped[continent]) {
                grouped[continent] = [];
            }
            grouped[continent].push(country);
        });
        
        // Sort countries within each continent alphabetically
        Object.keys(grouped).forEach(continent => {
            grouped[continent].sort((a, b) => a.name.localeCompare(b.name));
        });
        
        return grouped;
    }, [allCountries]);

    return (
        <div className="country-grid-container">
            {continentOrder.map(continent => {
                const countries = countriesByContinent[continent] || [];
                if (countries.length === 0) return null;
                
                return (
                    <div key={continent} className="continent-section">
                        <h2 className="continent-header">{continent}</h2>
                        <div className="country-grid">
                            {countries.map((country) => {
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
            })}
            {/* Show unknown continent countries if any */}
            {countriesByContinent['Unknown'] && countriesByContinent['Unknown'].length > 0 && (
                <div className="continent-section">
                    <h2 className="continent-header">Unknown</h2>
                    <div className="country-grid">
                        {countriesByContinent['Unknown'].map((country) => {
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
            )}
        </div>
    );
};
