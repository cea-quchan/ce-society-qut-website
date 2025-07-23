import { Box, Button, Container, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import BuildIcon from '@mui/icons-material/Build';

export default function Maintenance() {
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
          <BuildIcon
            sx={{
              fontSize: { xs: '6rem', md: '8rem' },
              color: 'warning.main',
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
            در حال تعمیر و نگهداری
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
            در حال حاضر سایت در حال تعمیر و نگهداری است. لطفاً چند دقیقه دیگر مراجعه کنید.
            <br />
            زمان تخمینی: 30 دقیقه
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
              onClick={() => router.reload()}
            >
              تلاش مجدد
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => window.location.href = 'mailto:support@root2.ir'}
            >
              تماس با پشتیبانی
            </Button>
          </Box>
        </motion.div>
      </Box>
    </Container>
  );
} 