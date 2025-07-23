import React from 'react';
import {
  Box,
  Skeleton,
  CircularProgress,
  LinearProgress,
  Typography,
  Paper,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  useTheme,
  Fade,
  Backdrop,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

const accent = '#22d3ee';

export interface SkeletonConfig {
  type: 'table' | 'card' | 'list' | 'form' | 'chart' | 'custom';
  rows?: number;
  columns?: number;
  height?: number;
  width?: number;
  variant?: 'text' | 'rectangular' | 'circular';
  animation?: 'pulse' | 'wave';
}

export interface ProgressConfig {
  type: 'linear' | 'circular' | 'determinate' | 'indeterminate';
  value?: number;
  total?: number;
  label?: string;
  showPercentage?: boolean;
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  size?: 'small' | 'medium' | 'large';
}

export interface LoadingOverlayConfig {
  message?: string;
  showSpinner?: boolean;
  backdrop?: boolean;
  zIndex?: number;
}

// Skeleton Components
export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({ 
  rows = 5, 
  columns = 4 
}) => {
  return (
    <TableContainer component={Paper} sx={{ bgcolor: 'transparent', boxShadow: 'none' }}>
      <Table>
        <TableHead>
          <TableRow>
            {Array.from({ length: columns }).map((_, index) => (
              <TableCell key={index}>
                <Skeleton 
                  variant="text" 
                  width={100} 
                  height={24}
                  sx={{ bgcolor: 'rgba(34,211,238,0.2)' }}
                />
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <TableCell key={colIndex}>
                  <Skeleton 
                    variant="text" 
                    width={colIndex === columns - 1 ? 80 : 120} 
                    height={20}
                    sx={{ bgcolor: 'rgba(34,211,238,0.15)' }}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export const CardSkeleton: React.FC<{ count?: number; variant?: 'simple' | 'detailed' }> = ({ 
  count = 3, 
  variant = 'simple' 
}) => {
  return (
    <Grid container spacing={2}>
      {Array.from({ length: count }).map((_, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Card sx={{ 
            bgcolor: 'rgba(24,26,32,0.55)', 
            border: '1.5px solid #22d3ee55',
            borderRadius: 4,
          }}>
            <CardContent>
              <Skeleton 
                variant="rectangular" 
                width="100%" 
                height={variant === 'detailed' ? 120 : 80}
                sx={{ bgcolor: 'rgba(34,211,238,0.2)', borderRadius: 2, mb: 2 }}
              />
              <Skeleton 
                variant="text" 
                width="60%" 
                height={24}
                sx={{ bgcolor: 'rgba(34,211,238,0.15)', mb: 1 }}
              />
              <Skeleton 
                variant="text" 
                width="100%" 
                height={16}
                sx={{ bgcolor: 'rgba(34,211,238,0.15)', mb: 1 }}
              />
              {variant === 'detailed' && (
                <>
                  <Skeleton 
                    variant="text" 
                    width="80%" 
                    height={16}
                    sx={{ bgcolor: 'rgba(34,211,238,0.15)', mb: 1 }}
                  />
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Skeleton 
                      variant="rectangular" 
                      width={60} 
                      height={24}
                      sx={{ bgcolor: 'rgba(34,211,238,0.15)', borderRadius: 1 }}
                    />
                    <Skeleton 
                      variant="rectangular" 
                      width={80} 
                      height={24}
                      sx={{ bgcolor: 'rgba(34,211,238,0.15)', borderRadius: 1 }}
                    />
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export const ListSkeleton: React.FC<{ count?: number; showAvatar?: boolean }> = ({ 
  count = 5, 
  showAvatar = true 
}) => {
  return (
    <List>
      {Array.from({ length: count }).map((_, index) => (
        <React.Fragment key={index}>
          <ListItem>
            {showAvatar && (
              <ListItemAvatar>
                <Skeleton 
                  variant="circular" 
                  width={40} 
                  height={40}
                  sx={{ bgcolor: 'rgba(34,211,238,0.2)' }}
                />
              </ListItemAvatar>
            )}
            <ListItemText
              primary={
                <Skeleton 
                  variant="text" 
                  width="60%" 
                  height={20}
                  sx={{ bgcolor: 'rgba(34,211,238,0.15)' }}
                />
              }
              secondary={
                <Skeleton 
                  variant="text" 
                  width="40%" 
                  height={16}
                  sx={{ bgcolor: 'rgba(34,211,238,0.15)' }}
                />
              }
            />
          </ListItem>
          {index < count - 1 && <Divider sx={{ borderColor: '#22d3ee33' }} />}
        </React.Fragment>
      ))}
    </List>
  );
};

export const FormSkeleton: React.FC<{ fields?: number }> = ({ fields = 4 }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {Array.from({ length: fields }).map((_, index) => (
        <Box key={index}>
          <Skeleton 
            variant="text" 
            width={100} 
            height={20}
            sx={{ bgcolor: 'rgba(34,211,238,0.15)', mb: 1 }}
          />
          <Skeleton 
            variant="rectangular" 
            width="100%" 
            height={40}
            sx={{ bgcolor: 'rgba(34,211,238,0.2)', borderRadius: 1 }}
          />
        </Box>
      ))}
    </Box>
  );
};

// Progress Components
export const ProgressIndicator: React.FC<ProgressConfig> = ({
  type = 'linear',
  value = 0,
  total = 100,
  label,
  showPercentage = true,
  color = 'primary',
  size = 'medium',
}) => {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  const progressColor = color === 'primary' ? accent : undefined;

  return (
    <Box sx={{ width: '100%' }}>
      {label && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" sx={{ color: accent }}>
            {label}
          </Typography>
          {showPercentage && (
            <Typography variant="body2" sx={{ color: accent }}>
              {percentage}%
            </Typography>
          )}
        </Box>
      )}
      
      {type === 'linear' ? (
        <LinearProgress
          variant={value >= 0 ? 'determinate' : 'indeterminate'}
          value={value >= 0 ? percentage : undefined}
          color={color}
          sx={{
            height: size === 'large' ? 8 : size === 'small' ? 4 : 6,
            borderRadius: 4,
            bgcolor: 'rgba(34,211,238,0.1)',
            '& .MuiLinearProgress-bar': {
              bgcolor: progressColor,
            },
          }}
        />
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress
            variant={value >= 0 ? 'determinate' : 'indeterminate'}
            value={value >= 0 ? percentage : undefined}
            color={color}
            size={size === 'large' ? 60 : size === 'small' ? 24 : 40}
            sx={{ color: progressColor }}
          />
        </Box>
      )}
    </Box>
  );
};

// Loading Overlay
export const LoadingOverlay: React.FC<LoadingOverlayConfig & { open: boolean }> = ({
  open,
  message = 'در حال بارگذاری...',
  showSpinner = true,
  backdrop = true,
  zIndex = 1000,
}) => {
  const theme = useTheme();

  if (backdrop) {
    return (
      <Backdrop
        sx={{
          color: accent,
          zIndex: zIndex,
          bgcolor: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(4px)',
        }}
        open={open}
      >
        <Box sx={{ textAlign: 'center' }}>
          {showSpinner && (
            <CircularProgress 
              color="inherit" 
              size={60}
              sx={{ mb: 2 }}
            />
          )}
          <Typography variant="h6" sx={{ color: accent, fontWeight: 600 }}>
            {message}
          </Typography>
        </Box>
      </Backdrop>
    );
  }

  return (
    <Fade in={open}>
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'rgba(24,26,32,0.8)',
          backdropFilter: 'blur(4px)',
          zIndex: zIndex,
          borderRadius: 2,
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          {showSpinner && (
            <CircularProgress 
              color="primary" 
              size={40}
              sx={{ mb: 1, color: accent }}
            />
          )}
          <Typography variant="body2" sx={{ color: accent }}>
            {message}
          </Typography>
        </Box>
      </Box>
    </Fade>
  );
};

// Status Indicators
export const StatusIndicator: React.FC<{
  status: 'loading' | 'success' | 'error' | 'warning' | 'info';
  message?: string;
  showIcon?: boolean;
}> = ({ status, message, showIcon = true }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'success':
        return { icon: <CheckCircleIcon />, color: '#10b981', bgColor: 'rgba(16,185,129,0.1)' };
      case 'error':
        return { icon: <ErrorIcon />, color: '#ef4444', bgColor: 'rgba(239,68,68,0.1)' };
      case 'warning':
        return { icon: <WarningIcon />, color: '#f59e0b', bgColor: 'rgba(245,158,11,0.1)' };
      case 'loading':
        return { icon: <CircularProgress size={16} />, color: accent, bgColor: 'rgba(34,211,238,0.1)' };
      default:
        return { icon: <RefreshIcon />, color: accent, bgColor: 'rgba(34,211,238,0.1)' };
    }
  };

  const config = getStatusConfig();

  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 1,
      p: 1,
      borderRadius: 1,
      bgcolor: config.bgColor,
    }}>
      {showIcon && (
        <Box sx={{ color: config.color }}>
          {config.icon}
        </Box>
      )}
      {message && (
        <Typography variant="body2" sx={{ color: config.color, fontWeight: 500 }}>
          {message}
        </Typography>
      )}
    </Box>
  );
};

// Main Loading Component
export const LoadingStates: React.FC<{
  type: 'skeleton' | 'progress' | 'overlay' | 'status';
  config: SkeletonConfig | ProgressConfig | LoadingOverlayConfig;
  open?: boolean;
  status?: 'loading' | 'success' | 'error' | 'warning' | 'info';
  message?: string;
}> = ({ type, config, open = true, status, message }) => {
  switch (type) {
    case 'skeleton':
      const skeletonConfig = config as SkeletonConfig;
      switch (skeletonConfig.type) {
        case 'table':
          return <TableSkeleton rows={skeletonConfig.rows} columns={skeletonConfig.columns} />;
        case 'card':
          return <CardSkeleton count={skeletonConfig.rows} />;
        case 'list':
          return <ListSkeleton count={skeletonConfig.rows} />;
        case 'form':
          return <FormSkeleton fields={skeletonConfig.rows} />;
        default:
          return <Skeleton variant={skeletonConfig.variant} width={skeletonConfig.width} height={skeletonConfig.height} />;
      }

    case 'progress':
      return <ProgressIndicator {...(config as ProgressConfig)} />;

    case 'overlay':
      return <LoadingOverlay {...(config as LoadingOverlayConfig)} open={open} />;

    case 'status':
      return <StatusIndicator status={status || 'loading'} message={message} />;

    default:
      return null;
  }
};

export default LoadingStates; 