import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import './ThemePicker.css';

export const ThemePicker: React.FC = () => {
    const { theme, changeTheme } = useTheme();

    const toggleTheme = () => {
        changeTheme(theme === 'light' ? 'dark' : 'light');
    };

    return (
        <div className="theme-picker-container">
            <button
                className="theme-picker-button"
                onClick={toggleTheme}
                aria-label="Toggle theme"
                title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
                <span className="theme-picker-icon">
                    {theme === 'light' ? '🌙' : '☀️'}
                </span>
            </button>
        </div>
    );
};

