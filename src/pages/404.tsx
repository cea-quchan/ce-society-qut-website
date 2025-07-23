import { Box, Button, Container, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { useTheme } from '@mui/material/styles';

export default function Custom404() {
  const router = useRouter();
  const theme = useTheme();

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center',
          py: 8,
        }}
      >
        <Typography
          variant="h1"
          component="h1"
          sx={{
            fontSize: { xs: '6rem', sm: '8rem' },
            fontWeight: 'bold',
            color: theme.palette.primary.main,
            mb: 2,
          }}
        >
          404
        </Typography>
        <Typography
          variant="h4"
          component="h2"
          sx={{
            mb: 4,
            color: theme.palette.text.primary,
          }}
        >
          صفحه مورد نظر یافت نشد
        </Typography>
        <Typography
          variant="body1"
          sx={{
            mb: 6,
            color: theme.palette.text.secondary,
            maxWidth: '600px',
          }}
        >
          متأسفانه صفحه‌ای که به دنبال آن هستید وجود ندارد یا به آدرس دیگری منتقل شده است.
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => router.push('/')}
          sx={{
            px: 4,
            py: 1.5,
          }}
        >
          بازگشت به صفحه اصلی
        </Button>
      </Box>
    </Container>
  );
} 