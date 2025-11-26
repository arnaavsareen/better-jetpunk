import React from 'react';
import { WorldMap } from 'react-svg-worldmap';
import type { CountryContext, ISOCode } from 'react-svg-worldmap';

interface WorldMapComponentProps {
    guessedCountries: Set<string>;
    allCountries: Array<{ code: string; name: string }>;
    showAll?: boolean;
}

export const WorldMapComponent: React.FC<WorldMapComponentProps> = ({ 
    guessedCountries, 
    allCountries,
    showAll = false 
}) => {
    // Create data array for the map - include all countries with value 1
    const mapData = allCountries.map(country => ({
        country: country.code.toLowerCase() as ISOCode,
        value: 1
    }));

    // Style function to highlight guessed countries
    const styleFunction = (context: CountryContext<number>): React.CSSProperties => {
        const countryCode = context.countryCode.toUpperCase();
        let isGuessed = guessedCountries.has(countryCode);
        
        // Highlight Greenland when Denmark is guessed
        if (countryCode === 'GL' && guessedCountries.has('DK')) {
            isGuessed = true;
        }
        
        // When showing all countries (give up), highlight unguessed ones in red
        if (showAll) {
            return {
                fill: isGuessed ? '#000000' : '#ff0000',
                stroke: isGuessed ? '#000000' : '#cc0000',
                strokeWidth: isGuessed ? 1 : 1.5,
                cursor: 'default',
                transition: 'fill 0.3s ease, stroke 0.3s ease'
            };
        }
        
        // Normal gameplay: only show guessed countries
        return {
            fill: isGuessed ? '#000000' : '#e5e5e5',
            stroke: isGuessed ? '#000000' : '#cccccc',
            strokeWidth: isGuessed ? 1 : 0.5,
            cursor: 'default',
            transition: 'fill 0.3s ease, stroke 0.3s ease'
        };
    };

    // Disable tooltips for unguessed countries
    const tooltipTextFunction = (context: CountryContext<number>): string => {
        const countryCode = context.countryCode.toUpperCase();
        let isGuessed = showAll || guessedCountries.has(countryCode);
        
        // Show tooltip for Greenland when Denmark is guessed
        if (countryCode === 'GL' && guessedCountries.has('DK')) {
            isGuessed = true;
        }
        
        return isGuessed ? context.countryName : '';
    };

    return (
        <div className="world-map-container">
            <WorldMap
                data={mapData}
                size="responsive"
                color="#000000"
                styleFunction={styleFunction}
                backgroundColor="transparent"
                borderColor="#cccccc"
                tooltipTextFunction={tooltipTextFunction}
                richInteraction={false}
            />
        </div>
    );
};

