import React, { useMemo, useState, useEffect } from 'react';
import type { PropsWithChildren } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme as lightTheme, darkTheme } from './theme';
import type { ThemeMode } from './themeMode';
import { ThemeModeContext } from './themeMode';

export const ThemeModeProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [mode, setMode] = useState<ThemeMode>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('theme.mode');
            if (saved === 'light' || saved === 'dark') return saved as ThemeMode;
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                return 'dark';
            }
        }
        return 'light';
    });
    const muiTheme = useMemo(() => (mode === 'light' ? lightTheme : darkTheme), [mode]);

    const value = useMemo(
        () => ({ mode, toggle: () => setMode((m) => (m === 'light' ? 'dark' : 'light')) }),
        [mode]
    );

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('theme.mode', mode);
        }
    }, [mode]);

    return (
        <ThemeModeContext.Provider value={value}>
            <ThemeProvider theme={muiTheme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </ThemeModeContext.Provider>
    );
};
