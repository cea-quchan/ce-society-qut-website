import '@/styles/globals.css';
import '@/styles/global.css';
import { AppProps } from 'next/app';
import { ThemeProvider as CustomThemeProvider } from '../context/contexts/ThemeContext';
import Layout from '@/components/Layout';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { SessionProvider } from 'next-auth/react';
import { appWithTranslation } from 'next-i18next';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { CacheProvider, EmotionCache } from '@emotion/react';
import createEmotionCache from '@/utils/createEmotionCache';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

// Client-side cache, shared for the whole session of the user in the browser
const clientSideEmotionCache = createEmotionCache();

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

function MyApp({ Component, pageProps: { session, ...pageProps }, emotionCache = clientSideEmotionCache }: MyAppProps) {
  return (
    <CacheProvider value={emotionCache}>
      <QueryClientProvider client={queryClient}>
        <SessionProvider session={session}>
            <CustomThemeProvider>
              <ErrorBoundary>
                <Layout>
                  <Component {...pageProps} />
                </Layout>
              </ErrorBoundary>
              <Toaster position="top-center" />
              {process.env.NODE_ENV === 'production' && (
                <>
                  <Analytics />
                  <SpeedInsights />
                </>
              )}
              {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
            </CustomThemeProvider>
        </SessionProvider>
      </QueryClientProvider>
    </CacheProvider>
  );
}

export default appWithTranslation(MyApp); 