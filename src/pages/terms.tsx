import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';
import { 
  Box, 
  Container, 
  Typography, 
  Paper,
  useTheme as useMuiTheme,
  alpha
} from '@mui/material';
import { useTranslation } from 'next-i18next';
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import SEO from '@/components/common/SEO';
import SchemaMarkup from '@/components/common/SchemaMarkup';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import nextI18NextConfig from '../../next-i18next.config.cjs';

const terms = [
  {
    title: 'ماده ۱: تعاریف',
    content: 'انجمن علمی مهندسی کامپیوتر دانشگاه صنعتی قوچان، یک نهاد دانشجویی است که با هدف ارتقای سطح علمی و مهارتی دانشجویان فعالیت می‌کند.'
  },
  {
    title: 'ماده ۲: عضویت',
    content: [
      'عضویت در انجمن برای تمامی دانشجویان رشته‌های مهندسی کامپیوتر، نرم‌افزار و فناوری اطلاعات آزاد است.',
      'اعضای انجمن موظف به رعایت قوانین و مقررات انجمن هستند.',
      'عضویت در انجمن با پرداخت حق عضویت سالانه امکان‌پذیر است.'
    ]
  },
  {
    title: 'ماده ۳: فعالیت‌ها',
    content: [
      'انجمن موظف به برگزاری دوره‌های آموزشی، کارگاه‌ها و همایش‌های علمی است.',
      'اعضای انجمن می‌توانند در فعالیت‌های انجمن شرکت کنند.',
      'برگزاری هرگونه فعالیت نیاز به تأیید هیئت مدیره انجمن دارد.'
    ]
  },
  {
    title: 'ماده ۴: امکانات',
    content: [
      'اعضای انجمن می‌توانند از امکانات انجمن استفاده کنند.',
      'استفاده از امکانات انجمن نیاز به رزرو قبلی دارد.',
      'در صورت بروز خسارت، عضو مربوطه موظف به جبران خسارت است.'
    ]
  },
  {
    title: 'ماده ۵: انضباط',
    content: [
      'اعضای انجمن موظف به رعایت اصول اخلاقی و انضباطی هستند.',
      'در صورت تخلف، هیئت مدیره انجمن می‌تواند عضو را از انجمن اخراج کند.',
      'تصمیمات هیئت مدیره در مورد تخلفات قطعی است.'
    ]
  },
  {
    title: 'ماده ۶: مالی',
    content: [
      'منابع مالی انجمن از طریق حق عضویت، کمک‌های مالی و درآمد حاصل از فعالیت‌ها تأمین می‌شود.',
      'هزینه‌های انجمن باید با تأیید هیئت مدیره انجام شود.',
      'صورت‌های مالی انجمن باید به صورت دوره‌ای به اعضا ارائه شود.'
    ]
  },
  {
    title: 'ماده ۷: تغییرات',
    content: [
      'تغییر در قوانین و مقررات انجمن نیاز به تأیید مجمع عمومی دارد.',
      'تغییرات باید حداقل یک ماه قبل از اجرا به اعضا اطلاع‌رسانی شود.',
      'اعضا می‌توانند پیشنهادات خود را برای تغییر قوانین ارائه دهند.'
    ]
  }
];

const Terms: React.FC = () => {
  const { theme } = useTheme();
  const muiTheme = useMuiTheme();
  const { t } = useTranslation('common');

  return (
    <Box sx={theme => ({
        bgcolor: 'background.default',
        color: 'text.primary',
        minHeight: '100vh',
        ...(theme.palette.mode === 'dark' && {
            backgroundColor: '#000',
        })
    })}>
      <ErrorBoundary>
        <SEO
          title="قوانین و مقررات"
          description="قوانین و مقررات انجمن علمی مهندسی کامپیوتر دانشگاه صنعتی قوچان"
        />
        <SchemaMarkup
          type="Organization"
          data={{
            name: 'انجمن علمی مهندسی کامپیوتر',
            url: process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com',
            logo: '/images/logo.png',
          }}
        />
        <Breadcrumbs
          items={[
            { label: 'خانه', href: '/' },
            { label: 'قوانین و مقررات', href: '/terms' },
          ]}
        />

        {/* Hero Section */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${muiTheme.palette.primary.main} 0%, ${muiTheme.palette.secondary.main} 100%)`,
            color: 'white',
            py: { xs: 10, md: 16 },
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%)',
            }
          }}
        >
          <Container maxWidth="lg">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                <Typography 
                  variant="h1" 
                  component="h1" 
                  sx={{ 
                    fontWeight: 700, 
                    mb: 2,
                    fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
                    background: 'linear-gradient(45deg, #FFFFFF 30%, #E0E7FF 90%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  قوانین و مقررات
                </Typography>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    opacity: 0.9, 
                    maxWidth: 700, 
                    mx: 'auto',
                    fontSize: { xs: '1.1rem', md: '1.3rem' },
                    lineHeight: 1.6
                  }}
                >
                  قوانین و مقررات انجمن علمی مهندسی کامپیوتر
                </Typography>
              </Box>
            </motion.div>
          </Container>
        </Box>

        {/* Terms Content */}
        <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
          <Paper
            sx={theme => ({
              p: { xs: 4, md: 6 },
              borderRadius: 3,
              ...(theme.palette.mode === 'dark' && {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(173, 216, 230, 0.3)',
                boxShadow: '0 0 15px rgba(173, 216, 230, 0.4)',
              }),
            })}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {terms.map((term, index) => (
                <Box key={index} sx={{ mb: 4 }}>
                  <Typography 
                    variant="h4" 
                    component="h2" 
                    sx={{ 
                      fontWeight: 600, 
                      mb: 2, 
                      color: 'primary.main',
                      borderBottom: `2px solid ${alpha(muiTheme.palette.primary.main, 0.3)}`,
                      pb: 1
                    }}
                  >
                    {term.title}
                  </Typography>
                  {Array.isArray(term.content) ? (
                    term.content.map((item, itemIndex) => (
                      <Typography 
                        key={itemIndex} 
                        variant="body1" 
                        paragraph 
                        sx={{ 
                          mb: 1,
                          pl: 2,
                          position: 'relative',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            left: 0,
                            top: '0.7em',
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            backgroundColor: muiTheme.palette.primary.main,
                          }
                        }}
                      >
                        {item}
                      </Typography>
                    ))
                  ) : (
                    <Typography variant="body1" paragraph>
                      {term.content}
                    </Typography>
                  )}
                </Box>
              ))}
            </motion.div>
          </Paper>
        </Container>
      </ErrorBoundary>
    </Box>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'fa', ['common'], nextI18NextConfig)),
    },
  };
};

export default Terms; 