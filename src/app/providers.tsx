'use client';

import React from 'react';
import { CacheProvider } from '@emotion/react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { SessionProvider } from 'next-auth/react';
import { I18nextProvider } from 'react-i18next';
import createEmotionCache from '@/utils/createEmotionCache';
import { lightTheme, darkTheme } from '@/theme';
import { useTheme } from '@/hooks/useTheme';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import i18n from '@/i18n';

const clientSideEmotionCache = createEmotionCache();

export function Providers({ children }: { children: React.ReactNode }) {
  const { theme: currentTheme } = useTheme();
  const theme = currentTheme === 'dark' ? darkTheme : lightTheme;

  return (
    <CacheProvider value={clientSideEmotionCache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SessionProvider>
          <I18nextProvider i18n={i18n}>
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </I18nextProvider>
        </SessionProvider>
      </ThemeProvider>
    </CacheProvider>
  );
} 