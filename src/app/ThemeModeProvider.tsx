import React, { useMemo, useState, useEffect } from 'react';
import type { PropsWithChildren } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './theme';
import type { ThemeMode } from './themeMode';
import { ThemeModeContext } from './themeMode';

export const ThemeModeProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [mode, setModeState] = useState<ThemeMode>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('theme.mode');
            if (saved === 'light' || saved === 'dark' || saved === 'system') {
                return saved as ThemeMode;
            }
        }
        return 'system';
    });

    const [systemThemeChange, setSystemThemeChange] = useState(0);

    // Determine the actual color scheme based on mode
    const resolvedMode = useMemo(() => {
        if (mode === 'system') {
            if (typeof window !== 'undefined' && window.matchMedia) {
                return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            }
            return 'light';
        }
        return mode;
    }, [mode, systemThemeChange]);

    const setMode = (newMode: ThemeMode) => {
        setModeState(newMode);
        if (typeof window !== 'undefined') {
            localStorage.setItem('theme.mode', newMode);
        }
    };

    const toggle = () => {
        setMode(mode === 'light' ? 'dark' : mode === 'dark' ? 'system' : 'light');
    };

    const value = useMemo(
        () => ({ mode, setMode, toggle }),
        [mode]
    );

    // Update the data attribute for CSS variables (MUI v7)
    useEffect(() => {
        if (typeof document !== 'undefined') {
            document.documentElement.setAttribute('data-mui-color-scheme', resolvedMode);
        }
    }, [resolvedMode]);

    // Listen for system theme changes when in system mode
    useEffect(() => {
        if (mode !== 'system' || typeof window === 'undefined') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            setSystemThemeChange(prev => prev + 1);
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [mode]);

    return (
        <ThemeModeContext.Provider value={value}>
            <ThemeProvider theme={theme}>
                <CssBaseline enableColorScheme />
                {children}
            </ThemeProvider>
        </ThemeModeContext.Provider>
    );
};
