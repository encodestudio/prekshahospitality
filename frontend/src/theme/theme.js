import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#FF6B35',
      light: '#FF8C42',
      dark: '#E55A25',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#FFD700',
      light: '#FFE44D',
      dark: '#CCA800',
      contrastText: '#2C1810',
    },
    background: {
      default: '#FFF8F0',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2C1810',
      secondary: '#6B4226',
    },
    error: { main: '#D32F2F' },
    success: { main: '#388E3C' },
    divider: '#FFD9C0',
    saffron: {
      50: '#FFF8F0',
      100: '#FFE0CC',
      200: '#FFBD99',
      300: '#FF9A66',
      400: '#FF8142',
      500: '#FF6B35',
      600: '#E55A25',
      700: '#CC4A18',
      800: '#A33A10',
      900: '#7A2A08',
    },
    maroon: {
      main: '#8B0000',
      light: '#B71C1C',
      dark: '#5D0000',
    },
    gold: {
      main: '#FFD700',
      light: '#FFE44D',
      dark: '#CCA800',
    },
  },
  typography: {
    fontFamily: '"Lato", "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontFamily: '"Cinzel", serif',
      fontWeight: 700,
      letterSpacing: '0.05em',
    },
    h2: {
      fontFamily: '"Cinzel", serif',
      fontWeight: 600,
      letterSpacing: '0.04em',
    },
    h3: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 700,
    },
    h4: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 600,
    },
    h5: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 500,
    },
    h6: {
      fontFamily: '"Lato", sans-serif',
      fontWeight: 700,
    },
    subtitle1: {
      fontFamily: '"Lato", sans-serif',
      fontWeight: 400,
      letterSpacing: '0.02em',
    },
    body1: {
      fontFamily: '"Lato", sans-serif',
      lineHeight: 1.7,
    },
    body2: {
      fontFamily: '"Lato", sans-serif',
      lineHeight: 1.6,
    },
    button: {
      fontFamily: '"Lato", sans-serif',
      fontWeight: 700,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          padding: '10px 28px',
          fontSize: '0.85rem',
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)',
          boxShadow: '0 4px 15px rgba(255,107,53,0.4)',
          '&:hover': {
            background: 'linear-gradient(135deg, #E55A25 0%, #FF6B35 100%)',
            boxShadow: '0 6px 20px rgba(255,107,53,0.5)',
          },
        },
        outlinedPrimary: {
          borderColor: '#FF6B35',
          '&:hover': {
            backgroundColor: 'rgba(255,107,53,0.08)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 20px rgba(44,24,16,0.08)',
          transition: 'box-shadow 0.3s ease, transform 0.3s ease',
          '&:hover': {
            boxShadow: '0 8px 30px rgba(44,24,16,0.15)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        colorPrimary: {
          background: 'linear-gradient(135deg, #FF6B35, #FF8C42)',
          color: '#fff',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '&:hover fieldset': { borderColor: '#FF6B35' },
            '&.Mui-focused fieldset': { borderColor: '#FF6B35' },
          },
          '& .MuiInputLabel-root.Mui-focused': { color: '#FF6B35' },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: '#FFD9C0' },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #FF7520 0%, #E55A25 100%)',
        },
      },
    },
  },
});

export default theme;
