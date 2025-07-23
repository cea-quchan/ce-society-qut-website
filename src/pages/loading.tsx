import { Box, Container, Typography, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { keyframes } from '@emotion/react';

const pulse = keyframes`
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.7);
  }
  
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(25, 118, 210, 0);
  }
  
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(25, 118, 210, 0);
  }
`;

const LoadingDots = () => {
  return (
    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: index * 0.2,
          }}
        >
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: 'primary.main',
            }}
          />
        </motion.div>
      ))}
    </Box>
  );
};

export default function Loading() {
  const theme = useTheme();

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          py: 8,
          background: theme.palette.mode === 'dark' 
            ? 'linear-gradient(45deg, #1a237e 30%, #0d47a1 90%)'
            : 'linear-gradient(45deg, #e3f2fd 30%, #bbdefb 90%)',
        }}
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            duration: 0.5,
            ease: [0, 0.71, 0.2, 1.01],
          }}
        >
          <Box
            sx={{
              width: 100,
              height: 100,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'primary.main',
              animation: `${pulse} 2s infinite`,
              mb: 4,
            }}
          >
            <motion.div
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
              }}
            >
              <Box
                component="img"
                src="/images/logo.png"
                alt="Logo"
                sx={{
                  width: 60,
                  height: 60,
                  filter: 'brightness(0) invert(1)',
                }}
              />
            </motion.div>
          </Box>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Typography
            variant="h4"
            component="h1"
            sx={{
              color: 'text.primary',
              fontWeight: 'bold',
              mb: 1,
            }}
          >
            در حال بارگذاری
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              mb: 2,
            }}
          >
            لطفاً صبر کنید...
          </Typography>
          <LoadingDots />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              mt: 4,
              maxWidth: 400,
            }}
          >
            در حال آماده‌سازی محیط آموزشی برای شما هستیم
          </Typography>
        </motion.div>
      </Box>
    </Container>
  );
} 