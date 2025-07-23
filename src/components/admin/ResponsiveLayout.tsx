import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  useTheme,
  useMediaQuery,
  Fab,
  Backdrop,
  CircularProgress,
  Snackbar,
  Alert,
  Container,
  Grid,
  Card,
  CardContent,
  useScrollTrigger,
  Slide,
  Fade,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Refresh as RefreshIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
} from '@mui/icons-material';
import AdminSidebar from './AdminSidebar';

const accent = '#22d3ee';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  title?: string;
  loading?: boolean;
  onRefresh?: () => void;
  showBackToTop?: boolean;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  disableContainer?: boolean;
}

interface ScrollTopProps {
  children: React.ReactNode;
}

function ScrollTop(props: ScrollTopProps) {
  const { children } = props;
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100,
  });

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Fade in={trigger}>
      <Box
        onClick={handleClick}
        role="presentation"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1000,
        }}
      >
        {children}
      </Box>
    </Fade>
  );
}

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  title = 'پنل مدیریت',
  loading = false,
  onRefresh,
  showBackToTop = true,
  maxWidth = 'lg',
  disableContainer = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'info',
  });

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
      setSnackbar({
        open: true,
        message: 'در حال بروزرسانی...',
        severity: 'info',
      });
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const drawerWidth = 220;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#000' }}>
      {/* Mobile App Bar */}
      {isMobile && (
        <AppBar
          position="fixed"
          sx={{
            width: { md: `calc(100% - ${drawerWidth}px)` },
            ml: { md: `${drawerWidth}px` },
            bgcolor: 'rgba(24,26,32,0.95)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid #22d3ee55',
            boxShadow: '0 0 32px 0 #22d3ee33',
            zIndex: theme.zIndex.drawer + 1,
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, color: accent }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ color: accent, fontWeight: 700, flexGrow: 1 }}>
              {title}
            </Typography>
            {onRefresh && (
              <IconButton color="inherit" onClick={handleRefresh} sx={{ color: accent }}>
                <RefreshIcon />
              </IconButton>
            )}
            <IconButton color="inherit" onClick={toggleFullscreen} sx={{ color: accent }}>
              {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton>
          </Toolbar>
        </AppBar>
      )}

      {/* Desktop Sidebar */}
      {!isMobile && <AdminSidebar />}

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            bgcolor: 'rgba(24,26,32,0.95)',
            backdropFilter: 'blur(16px)',
            borderRight: '1.5px solid #22d3ee55',
            boxShadow: '0 0 48px 0 #22d3ee55',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', px: 1, py: 2 }}>
          <IconButton onClick={handleDrawerToggle} sx={{ color: accent }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <AdminSidebar />
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          pt: isMobile ? 8 : 0,
        }}
      >
        {/* Loading Backdrop */}
        <Backdrop
          sx={{
            color: accent,
            zIndex: theme.zIndex.drawer + 2,
            bgcolor: 'rgba(0,0,0,0.8)',
          }}
          open={loading}
        >
          <CircularProgress color="inherit" />
        </Backdrop>

        {/* Content Container */}
        {disableContainer ? (
          <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
            {children}
          </Box>
        ) : (
          <Container maxWidth={maxWidth} sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
            {children}
          </Container>
        )}

        {/* Mobile Action Buttons */}
        {isMobile && (
          <Box sx={{ position: 'fixed', bottom: 16, left: 16, zIndex: 1000 }}>
            <Grid container spacing={1}>
              {onRefresh && (
                <Grid item>
                  <Fab
                    size="small"
                    onClick={handleRefresh}
                    sx={{
                      bgcolor: accent,
                      color: '#181A20',
                      '&:hover': { bgcolor: '#22d3eecc' },
                    }}
                  >
                    <RefreshIcon />
                  </Fab>
                </Grid>
              )}
              <Grid item>
                <Fab
                  size="small"
                  onClick={toggleFullscreen}
                  sx={{
                    bgcolor: 'rgba(24,26,32,0.8)',
                    color: accent,
                    border: '1px solid #22d3ee55',
                    '&:hover': { bgcolor: 'rgba(34,211,238,0.1)' },
                  }}
                >
                  {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                </Fab>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Back to Top Button */}
        {showBackToTop && (
          <ScrollTop>
            <Fab
              size="small"
              sx={{
                bgcolor: accent,
                color: '#181A20',
                '&:hover': { bgcolor: '#22d3eecc' },
              }}
            >
              <KeyboardArrowUpIcon />
            </Fab>
          </ScrollTop>
        )}
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{
            width: '100%',
            bgcolor: 'rgba(24,26,32,0.95)',
            color: accent,
            border: '1px solid #22d3ee55',
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ResponsiveLayout; 