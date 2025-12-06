import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export type Theme = 'light' | 'dark';

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

