import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  AlertTitle,
  IconButton,
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Card,
  CardContent,
  Grid,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  Home as HomeIcon,
  ArrowBack as ArrowBackIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  BugReport as BugReportIcon,
  Support as SupportIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/router';

const accent = '#22d3ee';

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  showDetails: boolean;
}

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export interface ErrorPageProps {
  code?: number;
  title?: string;
  message?: string;
  description?: string;
  showHomeButton?: boolean;
  showBackButton?: boolean;
  showRefreshButton?: boolean;
  onRetry?: () => void;
  onGoHome?: () => void;
  onGoBack?: () => void;
}

export interface ErrorDisplayProps {
  error: Error | string;
  title?: string;
  severity?: 'error' | 'warning' | 'info';
  showDetails?: boolean;
  onDismiss?: () => void;
  onRetry?: () => void;
}

// Error Boundary Component
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      showDetails: false,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ error, errorInfo });
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleShowDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorPage
          code={500}
          title="خطای غیرمنتظره"
          message="متأسفانه مشکلی پیش آمده است"
          description="لطفاً صفحه را مجدداً بارگذاری کنید یا با پشتیبانی تماس بگیرید"
          showRefreshButton={true}
          showHomeButton={true}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}

// Error Page Component
export const ErrorPage: React.FC<ErrorPageProps> = ({
  code = 404,
  title,
  message,
  description,
  showHomeButton = true,
  showBackButton = true,
  showRefreshButton = true,
  onRetry,
  onGoHome,
  onGoBack,
}) => {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const getErrorConfig = () => {
    switch (code) {
      case 404:
        return {
          title: title || 'صفحه یافت نشد',
          message: message || 'صفحه‌ای که به دنبال آن هستید وجود ندارد',
          description: description || 'آدرس وارد شده صحیح نیست یا صفحه حذف شده است',
          icon: <ErrorIcon sx={{ fontSize: 80, color: accent }} />,
        };
      case 403:
        return {
          title: title || 'دسترسی غیرمجاز',
          message: message || 'شما مجوز دسترسی به این صفحه را ندارید',
          description: description || 'لطفاً با مدیر سیستم تماس بگیرید',
          icon: <WarningIcon sx={{ fontSize: 80, color: '#f59e0b' }} />,
        };
      case 500:
        return {
          title: title || 'خطای سرور',
          message: message || 'مشکلی در سرور پیش آمده است',
          description: description || 'لطفاً بعداً تلاش کنید یا با پشتیبانی تماس بگیرید',
          icon: <ErrorIcon sx={{ fontSize: 80, color: '#ef4444' }} />,
        };
      default:
        return {
          title: title || 'خطا',
          message: message || 'مشکلی پیش آمده است',
          description: description || 'لطفاً صفحه را مجدداً بارگذاری کنید',
          icon: <ErrorIcon sx={{ fontSize: 80, color: accent }} />,
        };
    }
  };

  const config = getErrorConfig();

  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      router.push('/dashboard/admin');
    }
  };

  const handleGoBack = () => {
    if (onGoBack) {
      onGoBack();
    } else {
      router.back();
    }
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      router.reload();
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#000',
        p: { xs: 2, md: 4 },
      }}
    >
      <Paper
        sx={{
          maxWidth: 600,
          width: '100%',
          p: { xs: 3, md: 6 },
          textAlign: 'center',
          bgcolor: 'rgba(24,26,32,0.95)',
          border: '1.5px solid #22d3ee55',
          borderRadius: 4,
          boxShadow: '0 0 48px 0 #22d3ee55',
          backdropFilter: 'blur(16px)',
        }}
      >
        <Box sx={{ mb: 4 }}>
          {config.icon}
        </Box>

        <Typography
          variant="h1"
          sx={{
            color: accent,
            fontWeight: 900,
            fontSize: { xs: '4rem', md: '6rem' },
            mb: 2,
            textShadow: '0 0 32px #22d3ee',
          }}
        >
          {code}
        </Typography>

        <Typography
          variant="h4"
          sx={{
            color: '#fff',
            fontWeight: 700,
            mb: 2,
            fontSize: { xs: '1.5rem', md: '2rem' },
          }}
        >
          {config.title}
        </Typography>

        <Typography
          variant="h6"
          sx={{
            color: '#aaa',
            mb: 3,
            fontSize: { xs: '1rem', md: '1.25rem' },
          }}
        >
          {config.message}
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: '#888',
            mb: 4,
            lineHeight: 1.6,
          }}
        >
          {config.description}
        </Typography>

        <Box
          sx={{
            display: 'flex',
            gap: 2,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          {showRefreshButton && (
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={handleRetry}
              sx={{
                bgcolor: accent,
                color: '#181A20',
                px: 3,
                py: 1.5,
                borderRadius: 3,
                fontWeight: 700,
                '&:hover': { bgcolor: '#22d3eecc' },
              }}
            >
              تلاش مجدد
            </Button>
          )}

          {showBackButton && (
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={handleGoBack}
              sx={{
                color: accent,
                borderColor: '#22d3ee55',
                px: 3,
                py: 1.5,
                borderRadius: 3,
                fontWeight: 700,
                '&:hover': { borderColor: accent, bgcolor: 'rgba(34,211,238,0.1)' },
              }}
            >
              بازگشت
            </Button>
          )}

          {showHomeButton && (
            <Button
              variant="outlined"
              startIcon={<HomeIcon />}
              onClick={handleGoHome}
              sx={{
                color: accent,
                borderColor: '#22d3ee55',
                px: 3,
                py: 1.5,
                borderRadius: 3,
                fontWeight: 700,
                '&:hover': { borderColor: accent, bgcolor: 'rgba(34,211,238,0.1)' },
              }}
            >
              صفحه اصلی
            </Button>
          )}
        </Box>

        {/* Support Information */}
        <Box sx={{ mt: 6, pt: 4, borderTop: '1px solid #22d3ee33' }}>
          <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
            نیاز به کمک دارید؟
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              size="small"
              startIcon={<SupportIcon />}
              sx={{ color: accent, fontSize: '0.875rem' }}
            >
              تماس با پشتیبانی
            </Button>
            <Button
              size="small"
              startIcon={<BugReportIcon />}
              sx={{ color: accent, fontSize: '0.875rem' }}
            >
              گزارش مشکل
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

// Error Display Component
export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  title = 'خطا',
  severity = 'error',
  showDetails = false,
  onDismiss,
  onRetry,
}) => {
  const [expanded, setExpanded] = React.useState(showDetails);
  const errorMessage = typeof error === 'string' ? error : error.message;
  const errorStack = typeof error === 'string' ? undefined : error.stack;

  const getSeverityConfig = () => {
    switch (severity) {
      case 'warning':
        return { color: '#f59e0b', icon: <WarningIcon /> };
      case 'info':
        return { color: accent, icon: <InfoIcon /> };
      default:
        return { color: '#ef4444', icon: <ErrorIcon /> };
    }
  };

  const config = getSeverityConfig();

  return (
    <Alert
      severity={severity}
      icon={config.icon}
      action={
        <Box sx={{ display: 'flex', gap: 1 }}>
          {onRetry && (
            <IconButton
              size="small"
              onClick={onRetry}
              sx={{ color: config.color }}
            >
              <RefreshIcon />
            </IconButton>
          )}
          {onDismiss && (
            <IconButton
              size="small"
              onClick={onDismiss}
              sx={{ color: config.color }}
            >
              <CloseIcon />
            </IconButton>
          )}
          {errorStack && (
            <IconButton
              size="small"
              onClick={() => setExpanded(!expanded)}
              sx={{ color: config.color }}
            >
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          )}
        </Box>
      }
      sx={{
        bgcolor: 'rgba(24,26,32,0.95)',
        border: `1px solid ${config.color}55`,
        color: '#fff',
        '& .MuiAlert-icon': { color: config.color },
        '& .MuiAlert-message': { color: '#fff' },
      }}
    >
      <AlertTitle sx={{ color: config.color, fontWeight: 700 }}>
        {title}
      </AlertTitle>
      {errorMessage}
      
      {expanded && errorStack && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" sx={{ color: '#aaa', display: 'block', mb: 1 }}>
            جزئیات خطا:
          </Typography>
          <Paper
            sx={{
              p: 2,
              bgcolor: 'rgba(0,0,0,0.3)',
              border: '1px solid #22d3ee33',
              borderRadius: 1,
              maxHeight: 200,
              overflow: 'auto',
            }}
          >
            <Typography
              variant="caption"
              component="pre"
              sx={{
                color: '#888',
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {errorStack}
            </Typography>
          </Paper>
        </Box>
      )}
    </Alert>
  );
};

// Network Error Handler
export const NetworkErrorHandler: React.FC<{
  error: Error;
  onRetry: () => void;
  onDismiss?: () => void;
}> = ({ error, onRetry, onDismiss }) => {
  const isNetworkError = error.message.includes('fetch') || 
                        error.message.includes('network') ||
                        error.message.includes('Failed to fetch');

  if (!isNetworkError) {
    return null;
  }

  return (
    <ErrorDisplay
      error={error}
      title="خطای شبکه"
      severity="error"
      showDetails={false}
      onRetry={onRetry}
      onDismiss={onDismiss}
    />
  );
};

// Validation Error Display
export const ValidationErrorDisplay: React.FC<{
  errors: Record<string, string>;
  onDismiss?: () => void;
}> = ({ errors, onDismiss }) => {
  const errorEntries = Object.entries(errors);

  if (errorEntries.length === 0) {
    return null;
  }

  return (
    <Alert
      severity="error"
      icon={<ErrorIcon />}
      onClose={onDismiss}
      sx={{
        bgcolor: 'rgba(24,26,32,0.95)',
        border: '1px solid #ef444455',
        color: '#fff',
        '& .MuiAlert-icon': { color: '#ef4444' },
        '& .MuiAlert-message': { color: '#fff' },
      }}
    >
      <AlertTitle sx={{ color: '#ef4444', fontWeight: 700 }}>
        خطاهای اعتبارسنجی
      </AlertTitle>
      <List dense sx={{ p: 0, m: 0 }}>
        {errorEntries.map(([field, message], index) => (
          <ListItem key={index} sx={{ p: 0, minHeight: 'auto' }}>
            <ListItemIcon sx={{ minWidth: 24, color: '#ef4444' }}>
              <ErrorIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={message}
              sx={{ 
                '& .MuiListItemText-primary': { 
                  color: '#fff', 
                  fontSize: '0.875rem' 
                } 
              }}
            />
          </ListItem>
        ))}
      </List>
    </Alert>
  );
}; 