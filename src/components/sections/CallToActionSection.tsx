import React from 'react';
import { Box, Button, Typography, Container } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';

const CallToActionSection = () => {
  const { t } = useTranslation('common');

  return (
    <Box
      component="section"
      className="section"
      sx={{
        py: 8,
        background: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))',
        color: 'white',
      }}
    >
      <Container maxWidth="md">
        <Box
          sx={{
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
          }}
        >
          <Typography variant="h3" component="h2" gutterBottom fontWeight="bold">
            {t('home.cta.title', 'به انجمن علمی مهندسی کامپیوتر بپیوندید')}
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, maxWidth: '600px' }}>
            {t('home.cta.description', 'در کارگاه‌ها، مسابقات و همایش‌های علمی ما شرکت کنید و مهارت‌های خود را ارتقا دهید')}
          </Typography>
          <Button
            component={Link}
            href="/register"
            variant="contained"
            size="large"
            endIcon={<ArrowForwardIcon />}
            sx={{
              bgcolor: 'white',
              color: 'primary.main',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.9)',
              },
            }}
          >
            {t('home.cta.button', 'ثبت نام کنید')}
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default CallToActionSection; 