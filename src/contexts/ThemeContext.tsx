import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export type Theme = 'light' | 'dark' | 'blue' | 'green' | 'purple' | 'orange';

const THEME_STORAGE_KEY = 'better-jetpunk-theme';

const themes: Record<Theme, Record<string, string>> = {
    light: {
        '--bg-color': '#ffffff',
        '--text-color': '#000000',
        '--primary-color': '#000000',
        '--secondary-color': '#ffffff',
        '--accent-color': '#000000',
        '--glass-bg': 'rgba(0, 0, 0, 0.03)',
        '--glass-border': 'rgba(0, 0, 0, 0.15)',
        '--success-color': '#000000',
        '--error-color': '#666666',
    },
    dark: {
        '--bg-color': '#1a1a1a',
        '--text-color': '#ffffff',
        '--primary-color': '#ffffff',
        '--secondary-color': '#1a1a1a',
        '--accent-color': '#ffffff',
        '--glass-bg': 'rgba(255, 255, 255, 0.05)',
        '--glass-border': 'rgba(255, 255, 255, 0.2)',
        '--success-color': '#4caf50',
        '--error-color': '#ff5252',
    },
    blue: {
        '--bg-color': '#e3f2fd',
        '--text-color': '#0d47a1',
        '--primary-color': '#1976d2',
        '--secondary-color': '#ffffff',
        '--accent-color': '#0d47a1',
        '--glass-bg': 'rgba(13, 71, 161, 0.05)',
        '--glass-border': 'rgba(13, 71, 161, 0.2)',
        '--success-color': '#1976d2',
        '--error-color': '#d32f2f',
    },
    green: {
        '--bg-color': '#e8f5e9',
        '--text-color': '#1b5e20',
        '--primary-color': '#388e3c',
        '--secondary-color': '#ffffff',
        '--accent-color': '#1b5e20',
        '--glass-bg': 'rgba(27, 94, 32, 0.05)',
        '--glass-border': 'rgba(27, 94, 32, 0.2)',
        '--success-color': '#388e3c',
        '--error-color': '#d32f2f',
    },
    purple: {
        '--bg-color': '#f3e5f5',
        '--text-color': '#4a148c',
        '--primary-color': '#7b1fa2',
        '--secondary-color': '#ffffff',
        '--accent-color': '#4a148c',
        '--glass-bg': 'rgba(74, 20, 140, 0.05)',
        '--glass-border': 'rgba(74, 20, 140, 0.2)',
        '--success-color': '#7b1fa2',
        '--error-color': '#d32f2f',
    },
    orange: {
        '--bg-color': '#fff3e0',
        '--text-color': '#e65100',
        '--primary-color': '#f57c00',
        '--secondary-color': '#ffffff',
        '--accent-color': '#e65100',
        '--glass-bg': 'rgba(230, 81, 0, 0.05)',
        '--glass-border': 'rgba(230, 81, 0, 0.2)',
        '--success-color': '#f57c00',
        '--error-color': '#d32f2f',
    },
};

interface ThemeContextType {
    theme: Theme;
    changeTheme: (theme: Theme) => void;
    themes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<Theme>(() => {
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme;
            if (savedTheme && themes[savedTheme]) {
                return savedTheme;
            }
        }
        return 'light';
    });

    useEffect(() => {
        const root = document.documentElement;
        const themeVars = themes[theme];
        
        Object.entries(themeVars).forEach(([property, value]) => {
            root.style.setProperty(property, value);
        });

        localStorage.setItem(THEME_STORAGE_KEY, theme);
    }, [theme]);

    const changeTheme = (newTheme: Theme) => {
        setTheme(newTheme);
    };

    return (
        <ThemeContext.Provider
            value={{
                theme,
                changeTheme,
                themes: Object.keys(themes) as Theme[],
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

