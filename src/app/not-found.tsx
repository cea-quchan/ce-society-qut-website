'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Button, Container } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center',
          py: 4,
        }}
      >
        <Typography variant="h1" component="h1" gutterBottom>
          {t('notFound.title')}
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          {t('notFound.message')}
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => router.back()}
            sx={{ mr: 2 }}
          >
            {t('notFound.goBack')}
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => router.push('/')}
          >
            {t('notFound.goHome')}
          </Button>
        </Box>
      </Box>
    </Container>
  );
} 