import { createTheme } from '@mui/material/styles';
import { ThemeOptions, Theme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Theme {
    glassCard: {
      background: string;
      boxShadow: string;
      backdropFilter: string;
    };
  }
  interface ThemeOptions {
    glassCard?: {
      background: string;
      boxShadow: string;
      backdropFilter: string;
    };
  }
}

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#181A20',
      paper: 'rgba(24,26,32,0.7)',
    },
    primary: {
      main: '#10b981', // accent green
      dark: '#059669',
      light: '#22d3ee', // accent blue
      contrastText: '#f1f1f1',
    },
    secondary: {
      main: '#334155',
      dark: '#1e293b',
      light: '#64748b',
      contrastText: '#f1f1f1',
    },
    text: {
      primary: '#f1f1f1',
      secondary: '#cbd5e1',
      disabled: '#94a3b8',
    },
    divider: 'rgba(255,255,255,0.08)',
    neutral: undefined
  },
  glassCard: {
    background: 'rgba(255,255,255,0.08)',
    boxShadow: '0 4px 32px 0 rgba(0,0,0,0.12)',
    backdropFilter: 'blur(8px)'
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          background: 'rgba(24,26,32,0.7)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 8px 32px 0 rgba(0,0,0,0.37)',
          border: '1px solid rgba(255,255,255,0.08)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(24,26,32,0.7)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 8px 32px 0 rgba(0,0,0,0.37)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 600,
          boxShadow: '0 2px 8px 0 rgba(16,185,129,0.15)',
          background: 'rgba(24,26,32,0.7)',
          color: '#f1f1f1',
          border: '1px solid rgba(255,255,255,0.12)',
          backdropFilter: 'blur(8px)',
          transition: 'all 0.2s',
          '&:hover': {
            background: 'rgba(16,185,129,0.15)',
            color: '#10b981',
            boxShadow: '0 4px 16px 0 rgba(16,185,129,0.25)',
            borderColor: '#10b981',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'rgba(24,26,32,0.7)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 8px 32px 0 rgba(0,0,0,0.37)',
          border: '1px solid rgba(255,255,255,0.08)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: 'rgba(24,26,32,0.85)',
          backdropFilter: 'blur(16px)',
          color: '#f1f1f1',
        },
      },
    },
  },
});

export default theme; 