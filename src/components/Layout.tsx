import React, { ReactNode } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Box } from '@mui/material';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const router = useRouter();
  const isDashboard = router.pathname.startsWith('/dashboard');

  if (isDashboard) {
    return <>{children}</>;
  }

  return (
    <div className="layout-wrapper">
      <Head>
        <title>انجمن علمی مهندسی کامپیوتر - دانشگاه صنعتی قوچان</title>
        <meta name="description" content="انجمن علمی مهندسی کامپیوتر دانشگاه صنعتی قوچان - ترویج علم و فناوری در حوزه مهندسی کامپیوتر" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <Header />
      
      <main>
        {children}
      </main>
      
      <Footer />
    </div>
  );
};

export default Layout; 