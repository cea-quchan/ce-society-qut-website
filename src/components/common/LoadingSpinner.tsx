import { Box, CircularProgress, Typography } from '@mui/material';
import { keyframes } from '@emotion/react';
import { styled } from '@mui/material/styles';

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const StyledBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '200px',
  animation: `${fadeIn} 0.3s ease-in-out`,
  '& .MuiCircularProgress-root': {
    color: theme.palette.primary.main,
  },
  '& .MuiTypography-root': {
    marginTop: theme.spacing(2),
    color: theme.palette.text.secondary,
  },
}));

interface LoadingSpinnerProps {
  message?: string;
  size?: number;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'در حال بارگذاری...',
  size = 40,
  fullScreen = false,
}) => {
  return (
    <StyledBox
      sx={{
        ...(fullScreen && {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          zIndex: 9999,
        }),
      }}
    >
      <CircularProgress size={size} />
      <Typography variant="body1">{message}</Typography>
    </StyledBox>
  );
};

export default LoadingSpinner; 