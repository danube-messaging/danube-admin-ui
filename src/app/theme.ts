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
          light: brand[200],
          main: brand[400],
          dark: brand[700],
          contrastText: brand[50],
        },
        info: {
          light: brand[100],
          main: brand[300],
          dark: brand[600],
          contrastText: gray[50],
        },
        warning: {
          light: orange[300],
          main: orange[400],
          dark: orange[800],
        },
        error: {
          light: red[300],
          main: red[400],
          dark: red[800],
        },
        success: {
          light: green[300],
          main: green[400],
          dark: green[800],
        },
        grey: gray,
        divider: alpha(gray[300], 0.4),
        background: {
          default: 'hsl(0, 0%, 99%)',
          paper: 'hsl(220, 35%, 97%)',
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
          contrastText: brand[50],
          light: brand[300],
          main: brand[400],
          dark: brand[700],
        },
        info: {
          contrastText: brand[300],
          light: brand[500],
          main: brand[700],
          dark: brand[900],
        },
        warning: {
          light: orange[400],
          main: orange[500],
          dark: orange[700],
        },
        error: {
          light: red[400],
          main: red[500],
          dark: red[700],
        },
        success: {
          light: green[400],
          main: green[500],
          dark: green[700],
        },
        grey: gray,
        divider: alpha(gray[700], 0.6),
        background: {
          default: gray[900],
          paper: 'hsl(220, 30%, 7%)',
        },
        text: {
          primary: 'hsl(0, 0%, 100%)',
          secondary: gray[400],
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
    h1: { fontSize: '3rem', fontWeight: 600, lineHeight: 1.2, letterSpacing: -0.5 },
    h2: { fontSize: '2.25rem', fontWeight: 600, lineHeight: 1.2 },
    h3: { fontSize: '1.875rem', lineHeight: 1.2 },
    h4: { fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.5 },
    h5: { fontSize: '1.25rem', fontWeight: 600 },
    h6: { fontSize: '1.125rem', fontWeight: 600 },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundImage: 'none',
          borderRadius: 8,
          border: '1px solid',
          borderColor: theme.palette.divider,
          boxShadow: 'none',
          transition: 'all 150ms ease',
        }),
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

export { theme };
