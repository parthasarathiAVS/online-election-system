import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0F766E',      // Teal 700
      dark: '#115E59',       // Teal 800
      light: '#14B8A6',      // Teal 500
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#06B6D4',    // Cyan 500
      dark: '#0891B2',      // Cyan 600
      light: '#38BDF8',     // Cyan 400
      contrastText: '#FFFFFF',
    },
    accent: {
      main: '#4338CA',     // Indigo 700
      dark: '#3730A3',
      light: '#6366F1',
    },
    success: {
      main: '#10B981',    // Emerald 500 (Live Election)
      dark: '#059669',
      light: '#34D399',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#F59E0B',    // Amber 500 (Upcoming)
      dark: '#D97706',
      light: '#FBBF24',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#EF4444',      // Red 500 (Closed)
      dark: '#DC2626',
      light: '#F87171',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F0FDFA', // Teal 50
      paper: '#FFFFFF',   // White Card
    },
    text: {
      primary: '#134E4A',  // Teal 900
      secondary: '#475569',// Slate 600
      disabled: '#94A3B8', // Slate 400
    },
    divider: '#CCFBF1',    // Teal 100
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: { fontFamily: '"Poppins", sans-serif', fontWeight: 700 },
    h2: { fontFamily: '"Poppins", sans-serif', fontWeight: 700 },
    h3: { fontFamily: '"Poppins", sans-serif', fontWeight: 700 },
    h4: { fontFamily: '"Poppins", sans-serif', fontWeight: 700 },
    h5: { fontFamily: '"Poppins", sans-serif', fontWeight: 600 },
    h6: { fontFamily: '"Poppins", sans-serif', fontWeight: 600 },
    subtitle1: { fontFamily: '"Poppins", sans-serif', fontWeight: 600 },
    subtitle2: { fontFamily: '"Poppins", sans-serif', fontWeight: 600 },
    button: {
      fontFamily: '"Poppins", sans-serif',
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0.01em',
    }
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#F0FDFA',
          color: '#134E4A',
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 24px',
          boxShadow: 'none',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
          }
        },
        containedPrimary: {
          backgroundColor: '#0F766E',
          color: '#FFFFFF',
          boxShadow: '0 4px 14px rgba(15, 118, 110, 0.25)',
          '&:hover': {
            backgroundColor: '#115E59',
            boxShadow: '0 6px 20px rgba(15, 118, 110, 0.35)',
          }
        },
        containedSecondary: {
          backgroundColor: '#06B6D4',
          color: '#FFFFFF',
          boxShadow: '0 4px 14px rgba(6, 182, 212, 0.25)',
          '&:hover': {
            backgroundColor: '#0891B2',
            boxShadow: '0 6px 20px rgba(6, 182, 212, 0.35)',
          }
        },
        containedError: {
          backgroundColor: '#EF4444',
          boxShadow: '0 4px 14px rgba(239, 68, 68, 0.25)',
          '&:hover': {
            backgroundColor: '#DC2626',
            boxShadow: '0 6px 20px rgba(239, 68, 68, 0.35)',
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          border: '1px solid #CCFBF1',
          borderRadius: 16,
          boxShadow: '0 10px 30px -5px rgba(15, 118, 110, 0.05), 0 4px 6px -2px rgba(15, 118, 110, 0.02)',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            borderColor: '#99F6E4',
            boxShadow: '0 20px 35px -5px rgba(15, 118, 110, 0.1)',
            transform: 'translateY(-3px)'
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        rounded: {
          borderRadius: 16,
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            transition: 'all 0.2s ease',
            '& fieldset': {
              borderColor: '#CCFBF1',
            },
            '&:hover fieldset': {
              borderColor: '#0D9488',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#0F766E',
              borderWidth: '2px',
            }
          }
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontFamily: '"Poppins", sans-serif',
          fontWeight: 600,
          borderRadius: 8,
        }
      }
    }
  }
});

export default theme;
