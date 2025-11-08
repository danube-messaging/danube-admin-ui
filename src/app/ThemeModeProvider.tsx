import React, { createContext, useContext, useMemo, useState, PropsWithChildren } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme as lightTheme, darkTheme } from './theme';

type ThemeMode = 'light' | 'dark';

interface ThemeModeContextValue {
    mode: ThemeMode;
    toggle: () => void;
}

const ThemeModeContext = createContext<ThemeModeContextValue | undefined>(undefined);

export const useThemeMode = () => {
    const ctx = useContext(ThemeModeContext);
    if (!ctx) throw new Error('useThemeMode must be used within ThemeModeProvider');
    return ctx;
};

export const ThemeModeProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [mode, setMode] = useState<ThemeMode>('light');
    const muiTheme = useMemo(() => (mode === 'light' ? lightTheme : darkTheme), [mode]);

    const value = useMemo(
        () => ({ mode, toggle: () => setMode((m) => (m === 'light' ? 'dark' : 'light')) }),
        [mode]
    );

    return (
        <ThemeModeContext.Provider value={value}>
            <ThemeProvider theme={muiTheme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </ThemeModeContext.Provider>
    );
};
