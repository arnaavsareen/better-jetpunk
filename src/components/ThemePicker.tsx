import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import type { Theme } from '../contexts/ThemeContext';
import './ThemePicker.css';

export const ThemePicker: React.FC = () => {
    const { theme, changeTheme, themes } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    const themeLabels: Record<Theme, string> = {
        light: 'Light',
        dark: 'Dark',
        blue: 'Blue',
        green: 'Green',
        purple: 'Purple',
        orange: 'Orange',
    };

    const handleThemeChange = (newTheme: Theme) => {
        changeTheme(newTheme);
        setIsOpen(false);
    };

    return (
        <div className="theme-picker-container">
            <button
                className="theme-picker-button"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Change theme"
                title="Change theme"
            >
                <span className="theme-picker-label">{themeLabels[theme]}</span>
            </button>

            {isOpen && (
                <>
                    <div
                        className="theme-picker-overlay"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="theme-picker-dropdown">
                        <div className="theme-picker-header">Choose Theme</div>
                        <div className="theme-picker-options">
                            {themes.map((themeOption) => (
                                <button
                                    key={themeOption}
                                    className={`theme-picker-option ${
                                        theme === themeOption ? 'active' : ''
                                    }`}
                                    onClick={() => handleThemeChange(themeOption)}
                                >
                                    <span className="theme-option-label">
                                        {themeLabels[themeOption]}
                                    </span>
                                    {theme === themeOption && (
                                        <span className="theme-option-check">✓</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

