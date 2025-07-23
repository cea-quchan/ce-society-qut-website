import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';
import RefreshIcon from '@mui/icons-material/Refresh';

interface ErrorFallbackProps {
  error: Error | null;
  resetErrorBoundary: () => void;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => (
  <Box sx={{ p: 3, textAlign: 'center' }}>
    <ErrorIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
    <Typography variant="h5" color="error" gutterBottom>
      خطایی رخ داده است
    </Typography>
    <Typography variant="body1" color="text.secondary" paragraph>
      {error?.message || 'خطای ناشناخته'}
    </Typography>
    <Button
      variant="contained"
      color="primary"
      onClick={resetErrorBoundary}
      startIcon={<RefreshIcon />}
    >
      تلاش مجدد
    </Button>
  </Box>
);

interface CustomErrorBoundaryProps {
  children: React.ReactNode;
  FallbackComponent?: React.ComponentType<ErrorFallbackProps>;
}

export class CustomErrorBoundary extends React.Component<CustomErrorBoundaryProps> {
  state: { hasError: boolean; error: Error | null } = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  resetErrorBoundary = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return this.props.FallbackComponent ? (
        <this.props.FallbackComponent
          error={this.state.error}
          resetErrorBoundary={this.resetErrorBoundary}
        />
      ) : (
        <ErrorFallback
          error={this.state.error}
          resetErrorBoundary={this.resetErrorBoundary}
        />
      );
    }
    return this.props.children;
  }
} 