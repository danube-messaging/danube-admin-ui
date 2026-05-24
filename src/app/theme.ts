import { createTheme, alpha } from '@mui/material/styles';
import { brand, gray, green, orange, red } from './themePrimitives';

// Create theme with CSS variables support for better dark mode (MUI v7)
const theme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'data-mui-color-scheme',
    cssVarPrefix: 'danube',
  },
  colorSchemes: {
    light: {
      palette: {
        primary: {
          light: 'hsl(250, 95%, 78%)',
          main: 'hsl(250, 95%, 60%)', // violet primary
          dark: 'hsl(250, 95%, 45%)',
          contrastText: '#ffffff',
        },
        info: {
          light: brand[100],
          main: brand[300],
          dark: brand[600],
          contrastText: gray[50],
        },
        warning: {
          light: orange[300],
          main: 'hsl(35, 92%, 50%)',
          dark: orange[800],
        },
        error: {
          light: red[300],
          main: red[400],
          dark: red[800],
        },
        success: {
          light: green[300],
          main: 'hsl(142, 70%, 45%)',
          dark: green[800],
        },
        grey: gray,
        divider: 'hsla(217, 19%, 27%, 0.15)',
        background: {
          default: 'hsl(220, 30%, 98%)',
          paper: 'hsla(220, 30%, 95%, 0.7)',
        },
        text: {
          primary: gray[800],
          secondary: gray[600],
        },
        action: {
          hover: alpha(gray[200], 0.2),
          selected: alpha(gray[200], 0.3),
        },
      },
    },
    dark: {
      palette: {
        primary: {
          contrastText: '#ffffff',
          light: 'hsl(250, 95%, 78%)',
          main: 'hsl(250, 95%, 68%)', // Vibrant electric violet
          dark: 'hsl(250, 95%, 55%)',
        },
        info: {
          contrastText: brand[300],
          light: brand[500],
          main: brand[700],
          dark: brand[900],
        },
        warning: {
          light: orange[400],
          main: 'hsl(35, 92%, 50%)', // Warm amber
          dark: orange[700],
        },
        error: {
          light: red[400],
          main: red[500],
          dark: red[700],
        },
        success: {
          light: green[400],
          main: 'hsl(142, 70%, 45%)', // Emerald green
          dark: green[700],
        },
        grey: gray,
        divider: 'hsla(217, 19%, 27%, 0.35)',
        background: {
          default: 'hsl(222, 47%, 4%)', // Deep space blue/black
          paper: 'hsla(222, 40%, 7%, 0.7)', // Semi-transparent dark charcoal
        },
        text: {
          primary: '#ffffff',
          secondary: 'hsl(215, 15%, 75%)',
        },
        action: {
          hover: alpha(gray[600], 0.2),
          selected: alpha(gray[600], 0.3),
        },
      },
    },
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    h1: { fontFamily: 'Outfit, "Plus Jakarta Sans", sans-serif', fontSize: '3rem', fontWeight: 600, lineHeight: 1.2, letterSpacing: -0.5 },
    h2: { fontFamily: 'Outfit, "Plus Jakarta Sans", sans-serif', fontSize: '2.25rem', fontWeight: 600, lineHeight: 1.2 },
    h3: { fontFamily: 'Outfit, "Plus Jakarta Sans", sans-serif', fontSize: '1.875rem', lineHeight: 1.2 },
    h4: { fontFamily: 'Outfit, "Plus Jakarta Sans", sans-serif', fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.5 },
    h5: { fontFamily: 'Outfit, "Plus Jakarta Sans", sans-serif', fontSize: '1.25rem', fontWeight: 600 },
    h6: { fontFamily: 'Outfit, "Plus Jakarta Sans", sans-serif', fontSize: '1.125rem', fontWeight: 600 },
    button: { fontFamily: 'Outfit, "Plus Jakarta Sans", sans-serif', fontWeight: 600 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundImage: 'none',
          borderRadius: 12,
          border: '1px solid',
          borderColor: theme.vars.palette.divider,
          backgroundColor: theme.vars.palette.background.paper,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.05)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            borderColor: 'rgba(var(--danube-palette-primary-mainChannel), 0.4)',
            boxShadow: '0 8px 32px 0 rgba(var(--danube-palette-primary-mainChannel), 0.15)',
            transform: 'translateY(-2px)',
          },
          ...theme.applyStyles('dark', {
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
            '&:hover': {
              borderColor: 'rgba(var(--danube-palette-primary-mainChannel), 0.6)',
              boxShadow: '0 8px 32px 0 rgba(var(--danube-palette-primary-mainChannel), 0.25)',
            },
          }),
        }),
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 12,
        },
      },
    },
  },
});

export { theme };
