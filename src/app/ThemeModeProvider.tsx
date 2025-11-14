import React, { useMemo, useState, useEffect, useCallback } from 'react';
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

    // Track system color scheme preference
    const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(() => {
        if (typeof window !== 'undefined' && window.matchMedia) {
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return false;
    });

    // Determine the actual color scheme based on mode
    const resolvedMode = useMemo(() => {
        if (mode === 'system') {
            return systemPrefersDark ? 'dark' : 'light';
        }
        return mode;
    }, [mode, systemPrefersDark]);

    const setMode = useCallback((newMode: ThemeMode) => {
        setModeState(newMode);
        if (typeof window !== 'undefined') {
            localStorage.setItem('theme.mode', newMode);
        }
    }, []);

    const toggle = useCallback(() => {
        setMode(mode === 'light' ? 'dark' : mode === 'dark' ? 'system' : 'light');
    }, [mode, setMode]);

    const value = useMemo(
        () => ({ mode, setMode, toggle }),
        [mode, setMode, toggle]
    );

    // Update the data attribute for CSS variables (MUI v7)
    useEffect(() => {
        if (typeof document !== 'undefined') {
            document.documentElement.setAttribute('data-mui-color-scheme', resolvedMode);
        }
    }, [resolvedMode]);

    // Keep system preference in sync
    useEffect(() => {
        if (typeof window === 'undefined' || !window.matchMedia) return;
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => setSystemPrefersDark(e.matches);
        // Initialize in case it changed between renders
        setSystemPrefersDark(mediaQuery.matches);
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    return (
        <ThemeModeContext.Provider value={value}>
            <ThemeProvider theme={theme}>
                <CssBaseline enableColorScheme />
                {children}
            </ThemeProvider>
        </ThemeModeContext.Provider>
    );
};
