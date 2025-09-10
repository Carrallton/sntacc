import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import './index.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontSize: '1.5rem',
      '@media (max-width: 600px)': {
        fontSize: '1.25rem',
      },
    },
    h6: {
      fontSize: '1.125rem',
      '@media (max-width: 600px)': {
        fontSize: '1rem',
      },
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          '@media (max-width: 600px)': {
            margin: '8px',
          },
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          '@media (max-width: 600px)': {
            fontSize: '0.875rem',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          '@media (max-width: 600px)': {
            minWidth: 'auto',
            padding: '6px 12px',
          },
        },
      },
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);