import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1f3448',
    },
    secondary: {
      main: '#9b6b2f',
    },
    background: {
      default: '#31475a',
      paper: '#e9e2d2',
    },
  },
  typography: {
    fontFamily: '"Libre Baskerville", "Times New Roman", serif',
    h1: {
      fontFamily: '"Cinzel", "Times New Roman", serif',
      fontWeight: 600,
      letterSpacing: '-0.015em',
    },
    h2: {
      fontFamily: '"Cinzel", "Times New Roman", serif',
      fontWeight: 600,
      letterSpacing: '-0.015em',
    },
    h3: {
      fontFamily: '"Cinzel", "Times New Roman", serif',
      fontWeight: 600,
      letterSpacing: '-0.02em',
    },
    h4: {
      fontFamily: '"Cinzel", "Times New Roman", serif',
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h5: {
      fontFamily: '"Cinzel", "Times New Roman", serif',
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    overline: {
      fontFamily: '"Libre Franklin", "Segoe UI", sans-serif',
      fontWeight: 600,
      letterSpacing: '0.12em',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          textTransform: 'none',
          fontWeight: 700,
        },
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
})

export default theme
