import { Box, Button, Container, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

export default function Custom500() {
  const router = useRouter();

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          py: 8,
        }}
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <ErrorOutlineIcon
            sx={{
              fontSize: { xs: '6rem', md: '8rem' },
              color: 'error.main',
              mb: 2,
            }}
          />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Typography
            variant="h4"
            component="h2"
            sx={{ mb: 3, color: 'text.primary' }}
          >
            خطای سرور
          </Typography>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Typography
            variant="body1"
            sx={{ mb: 4, color: 'text.secondary', maxWidth: '600px' }}
          >
            متأسفانه مشکلی در سرور رخ داده است. لطفاً چند لحظه صبر کنید و دوباره تلاش کنید.
          </Typography>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => router.push('/')}
            >
              بازگشت به صفحه اصلی
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => router.reload()}
            >
              تلاش مجدد
            </Button>
          </Box>
        </motion.div>
      </Box>
    </Container>
  );
} 