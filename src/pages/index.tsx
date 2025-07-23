import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { Container, Typography, Grid, Box, Card, Button, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Image from 'next/image';
import { useTranslation } from 'next-i18next';
import SEO from '@/components/common/SEO';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';

const HeroSection = styled(Box)(({ theme }) => ({
  position: 'relative',
  minHeight: '70vh',
  display: 'flex',
  alignItems: 'center',
  background: '#000',
  overflow: 'hidden',
}));

const GlassCard = styled(Card)(({ theme }) => ({
  background: 'rgba(24,26,32,0.7)',
  border: '1px solid rgba(255,255,255,0.06)',
  boxShadow: '0 8px 32px 0 rgba(0,0,0,0.37)',
  borderRadius: 20,
  color: '#f1f1f1',
  transition: 'all 0.2s',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  padding: theme.spacing(3),
  '&:hover': {
    borderColor: theme.palette.primary.main,
    boxShadow: '0 12px 40px 0 rgba(16,185,129,0.18)',
    transform: 'translateY(-4px) scale(1.03)',
  },
}));

const NeonButton = styled(Button)(({ theme }) => ({
  borderRadius: 14,
  fontWeight: 700,
  fontSize: '1.1rem',
  padding: '0.75rem 2.5rem',
  background: 'linear-gradient(90deg, #10b981 0%, #22d3ee 100%)',
  color: '#fff',
  boxShadow: '0 2px 16px 0 rgba(16,185,129,0.18)',
  border: 'none',
  transition: 'all 0.2s',
  '&:hover': {
    background: 'linear-gradient(90deg, #22d3ee 0%, #10b981 100%)',
    color: '#fff',
    boxShadow: '0 4px 24px 0 rgba(16,185,129,0.25)',
    transform: 'scale(1.04)',
  },
}));

const OutlineButton = styled(Button)(({ theme }) => ({
  borderRadius: 14,
  fontWeight: 700,
  fontSize: '1.1rem',
  padding: '0.75rem 2.5rem',
  background: '#000',
  color: '#22d3ee',
  border: '2px solid #22d3ee',
  boxShadow: 'none',
  transition: 'all 0.2s',
  '&:hover': {
    background: '#000',
    color: '#10b981',
    borderColor: '#10b981',
    transform: 'scale(1.04)',
  },
}));

const Section = styled(Box)(({ theme }) => ({
  margin: '0 auto',
  padding: theme.spacing(8, 0, 8, 0),
  maxWidth: 1400,
  width: '100%',
  background: '#000',
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  color: '#fff',
  fontWeight: 800,
  fontSize: '2.2rem',
  marginBottom: theme.spacing(4),
  textAlign: 'center',
  letterSpacing: '-1px',
}));

const statsData = [
  { id: 1, title: 'اعضای فعال', value: '150+', icon: '👥', description: 'از ابتدای سال' },
  { id: 2, title: 'کارگاه‌ها', value: '25+', icon: '🎯', description: 'در سه ماه گذشته' },
  { id: 3, title: 'مسابقات', value: '10+', icon: '🏆', description: 'در سال جاری' },
];

const servicesData = [
  { id: 1, title: 'کارگاه‌های آموزشی', icon: '🎓', description: 'کارگاه‌های تخصصی در زمینه‌های مختلف مهندسی کامپیوتر', link: '/courses', disabled: true },
  { id: 2, title: 'مسابقات برنامه‌نویسی', icon: '🏆', description: 'مسابقات هیجان‌انگیز برنامه‌نویسی و هکاتون', link: '/competitions', disabled: true },
  { id: 3, title: 'همایش‌های علمی', icon: '🎤', description: 'همایش‌های تخصصی با حضور اساتید برجسته', link: '/events', disabled: true },
  { id: 4, title: 'مشاوره و راهنمایی', icon: '💡', description: 'مشاوره تحصیلی و شغلی برای دانشجویان', link: '/contact', disabled: false },
  { id: 5, title: 'گالری تصاویر', icon: '🖼️', description: 'مشاهده تصاویر و رویدادهای گذشته', link: '/gallery', disabled: false },
];

const Home: React.FC = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [newsData, setNewsData] = useState<any[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState(true);
  const [errorNews, setErrorNews] = useState<string | null>(null);
  const [openImageModal, setOpenImageModal] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

  const handleNavigation = useCallback((path: string) => {
    if (router.pathname !== path) {
      setIsLoading(true);
      router.push(path).finally(() => setIsLoading(false));
    }
  }, [router]);

  const handleJoinNow = useCallback(() => {
    if (session) {
      handleNavigation('/dashboard');
    } else {
      handleNavigation('/register');
    }
  }, [session, handleNavigation]);

  const handleOpenImageModal = (url: string) => { setSelectedImageUrl(url); setOpenImageModal(true); };
  const handleCloseImageModal = () => { setOpenImageModal(false); setSelectedImageUrl(null); };

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setIsLoadingNews(true);
        const res = await fetch('/api/news?published=true&limit=6');
        const json = await res.json();
        if (json.success) {
          // Filter only published news and take latest 6
          const publishedNews = json.data.filter((item: any) => item.published).slice(0, 6);
          setNewsData(publishedNews);
          setErrorNews(null);
        } else {
          setErrorNews(json.error?.message || 'خطا در دریافت اخبار');
        }
      } catch (err) {
        setErrorNews('خطا در دریافت اخبار');
      } finally {
        setIsLoadingNews(false);
      }
    };
    fetchNews();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR', {
      month: 'short',
      day: 'numeric',
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Helper for news images
  const getNewsImages = (news: any) => (news.images && news.images.length > 0 ? news.images : (news.image ? [{ url: news.image }] : []));

  return (
    <>
      <SEO title={t('site.title')} description={t('site.description')} keywords={t('site.keywords')} />
      <Box sx={{ bgcolor: '#000', minHeight: '100vh', width: '100%' }}>
        <Container maxWidth="lg" sx={{ pt: 3, pb: 1 }}>
          <Breadcrumbs showHome items={[]} />
        </Container>
        {/* Hero Section */}
        <HeroSection>
          <Container maxWidth="lg">
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={6}>
                <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
                  <Typography variant="h1" sx={{ color: '#fff', fontWeight: 800, mb: 2, fontSize: { xs: '2.2rem', md: '2.8rem' }, letterSpacing: '-1px' }}>{t('home.hero.title')}</Typography>
                  <Typography variant="h5" sx={{ color: '#22d3ee', mb: 3, fontWeight: 600, fontSize: { xs: '1.1rem', md: '1.25rem' } }}>{t('home.hero.subtitle')}</Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.85)', mb: 4, fontWeight: 400 }}>{t('home.hero.description')}</Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <NeonButton onClick={handleJoinNow} disabled={isLoading}>{t('home.hero.cta')}</NeonButton>
                    <OutlineButton onClick={() => handleNavigation('/about')}>{t('home.hero.learnMore')}</OutlineButton>
                  </Box>
                </motion.div>
              </Grid>
              <Grid item xs={12} md={6}>
                <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Image src="/images/hero-image.svg" alt="Hero" width={420} height={320} style={{ maxWidth: '100%', borderRadius: 24, boxShadow: '0 8px 32px 0 rgba(0,0,0,0.37)' }} />
                  </Box>
                </motion.div>
              </Grid>
            </Grid>
          </Container>
        </HeroSection>

        {/* Stats Section */}
        <Section>
          <Grid container spacing={4} justifyContent="center">
            {statsData.map((stat) => (
              <Grid item xs={12} sm={4} key={stat.id}>
                <GlassCard>
                  <Box sx={{ fontSize: '2.5rem', mb: 1 }}>{stat.icon}</Box>
                  <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700 }}>{stat.value}</Typography>
                  <Typography variant="subtitle1" sx={{ color: '#22d3ee', fontWeight: 600 }}>{stat.title}</Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 1 }}>{stat.description}</Typography>
                </GlassCard>
              </Grid>
            ))}
          </Grid>
        </Section>

        {/* Services Section */}
        <Section>
          <SectionTitle>{t('home.features.expertTeachers')}</SectionTitle>
          <Grid container spacing={4} justifyContent="center">
            {servicesData.map((service) => (
              <Grid item xs={12} sm={6} md={3} key={service.id}>
                <GlassCard
                  onClick={service.disabled ? undefined : () => handleNavigation(service.link)}
                  sx={{
                    cursor: service.disabled ? 'not-allowed' : 'pointer',
                    minHeight: 220,
                    opacity: service.disabled ? 0.5 : 1,
                    pointerEvents: service.disabled ? 'none' : 'auto',
                  }}
                >
                  <Box sx={{ fontSize: '2.2rem', mb: 1 }}>{service.icon}</Box>
                  <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700 }}>{service.title}</Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 1 }}>{service.description}</Typography>
                  {service.disabled && (
                    <Typography variant="caption" sx={{ color: '#fff', mt: 2, display: 'block', fontWeight: 800, bgcolor: '#22d3ee', borderRadius: 2, px: 1.5, py: 0.5, fontSize: '1rem', boxShadow: '0 0 8px #22d3ee88', textAlign: 'center', letterSpacing: 0.5 }}>
                      به زودی...
                    </Typography>
                  )}
                </GlassCard>
              </Grid>
            ))}
          </Grid>
        </Section>

        {/* News Section */}
        <Section>
          <SectionTitle>{t('home.news.title')}</SectionTitle>
          {isLoadingNews ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress sx={{ color: '#22d3ee' }} />
            </Box>
          ) : errorNews ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="error" variant="h6">
                {errorNews}
              </Typography>
            </Box>
          ) : newsData.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                در حال حاضر خبری برای نمایش وجود ندارد
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={4} justifyContent="center">
              {newsData.map((news) => (
                <Grid item xs={12} sm={6} md={4} key={news.id}>
                  <GlassCard sx={{ minHeight: 320 }}>
                    {/* Image(s) - Mini slider */}
                    {getNewsImages(news).length > 0 && (
                      <Box sx={{ position: 'relative', borderRadius: 16, overflow: 'hidden', mb: 2 }}>
                        <Swiper
                          modules={[Navigation, Pagination, Autoplay]}
                          spaceBetween={8}
                          slidesPerView={1}
                          navigation
                          pagination={{ clickable: true }}
                          autoplay={{ delay: 3500, disableOnInteraction: false }}
                          style={{ borderRadius: 16 }}
                        >
                          {getNewsImages(news).map((img: { url: string }, idx: number) => (
                            <SwiperSlide key={idx}>
                              <Image
                                src={img.url}
                                alt={news.title}
                                width={400}
                                height={200}
                                style={{ width: '100%', height: 'auto', objectFit: 'cover', borderRadius: 16, boxShadow: '0 4px 24px 0 rgba(34,211,238,0.12)' }}
                              />
                            </SwiperSlide>
                          ))}
                        </Swiper>
                      </Box>
                    )}
                    <Typography variant="h6" fontWeight={800} color="#fff" mb={1} sx={{ letterSpacing: 0.5 }}>
                      {news.title}
                    </Typography>
                    <Typography variant="body2" color="rgba(255,255,255,0.7)" mb={2}>
                      {truncateText(news.summary, 120)}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                      <Typography variant="caption" color="#22d3ee" fontWeight={700}>
                        {formatDate(news.date)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {news.author}
                      </Typography>
                    </Box>
                  </GlassCard>
                </Grid>
              ))}
            </Grid>
          )}
        </Section>
      </Box>
    </>
  );
};

export default Home;

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'fa', ['common'])),
    },
  };
};