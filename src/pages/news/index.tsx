import { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetServerSideProps } from 'next';
import Image from 'next/image';
import SEO from '@/components/common/SEO';
import SchemaMarkup from '@/components/common/SchemaMarkup';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { Container, Grid, Typography, Box, Card, Chip, Button, Modal } from '@mui/material';
import { styled } from '@mui/material/styles';
import { CalendarToday, Person, Category } from '@mui/icons-material';
import nextI18NextConfig from '../../../next-i18next.config.cjs';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';

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
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    boxShadow: '0 12px 40px 0 rgba(16,185,129,0.18)',
    transform: 'translateY(-4px) scale(1.03)',
  },
}));

interface NewsItem {
  id: string;
  title: string;
  content: string;
  summary?: string;
  date: string;
  author: string;
  category: string;
  image?: string;
  published: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  images?: { url: string; alt: string }[];
}

const getCategoryLabel = (category: string) => {
  const categoryMap: Record<string, string> = {
    'technology': 'فناوری',
    'events': 'رویدادها',
    'updates': 'به‌روزرسانی‌ها',
    'general': 'عمومی',
    'education': 'آموزشی',
    'announcement': 'اعلان‌ها',
  };
  return categoryMap[category] || category;
};

const getCategoryColor = (category: string) => {
  const colorMap: Record<string, string> = {
    'technology': '#22d3ee',
    'events': '#f59e0b',
    'updates': '#10b981',
    'general': '#8b5cf6',
    'education': '#ef4444',
    'announcement': '#f97316',
  };
  return colorMap[category] || '#22d3ee';
};

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openImageModal, setOpenImageModal] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

  const handleOpenImageModal = (url: string) => { setSelectedImageUrl(url); setOpenImageModal(true); };
  const handleCloseImageModal = () => { setOpenImageModal(false); setSelectedImageUrl(null); };

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await fetch('/api/news?published=true&limit=20');
        const json = await res.json();
        if (json.success) {
          // Filter only published news
          const publishedNews = json.data.filter((item: NewsItem) => item.published);
          setNews(publishedNews);
        } else {
          setError(json.error?.message || 'خطا در دریافت اخبار');
        }
      } catch (err) {
        console.error('خطا در دریافت اخبار', err);
        setError('خطا در دریافت اخبار');
      } finally {
        setIsLoading(false);
      }
    };
    fetchNews();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <Box sx={{ bgcolor: '#000', minHeight: '100vh', width: '100%' }}>
      <ErrorBoundary>
        <SEO
          title="اخبار"
          description="آخرین اخبار و رویدادهای انجمن علمی مهندسی کامپیوتر"
        />
        <SchemaMarkup
          type="Organization"
          data={{
            name: 'اخبار انجمن علمی',
            url: process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com',
            logo: '/images/logo.png',
          }}
        />
      </ErrorBoundary>
      <Container maxWidth="lg" sx={{ pt: 3, pb: 1 }}>
        <Breadcrumbs showHome items={[{ label: 'اخبار', href: '/news' }]} />
      </Container>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h3" fontWeight={900} color="#22d3ee" align="center" mb={2} sx={{ letterSpacing: 1, textShadow: '0 0 16px #22d3ee99' }}>
          اخبار و رویدادها
        </Typography>
        <Typography variant="h6" color="text.secondary" align="center" mb={6}>
          آخرین اخبار، اطلاعیه‌ها و رویدادهای مهم انجمن علمی مهندسی کامپیوتر
        </Typography>
        
        {error && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="error" variant="h6">
              {error}
            </Typography>
            <Button 
              variant="outlined" 
              onClick={() => window.location.reload()}
              sx={{ mt: 2, color: '#22d3ee', borderColor: '#22d3ee' }}
            >
              تلاش مجدد
            </Button>
          </Box>
        )}
        
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <LoadingSpinner size={40} />
          </Box>
        ) : news.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              در حال حاضر خبری برای نمایش وجود ندارد
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={4} justifyContent="center">
            {news.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.id}>
                <GlassCard>
                  {/* Category Chip */}
                  <Box sx={{ mb: 2 }}>
                    <Chip
                      icon={<Category />}
                      label={getCategoryLabel(item.category)}
                      size="small"
                      sx={{
                        bgcolor: `${getCategoryColor(item.category)}20`,
                        color: getCategoryColor(item.category),
                        border: `1px solid ${getCategoryColor(item.category)}40`,
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                  
                  {/* Image(s) - Mini slider */}
                  {((item.images && item.images.length > 0) || item.image) && (
                    <Box sx={{ position: 'relative', borderRadius: 3, overflow: 'hidden', mb: 2 }}>
                      <Swiper
                        modules={[Navigation, Pagination, Autoplay]}
                        spaceBetween={8}
                        slidesPerView={1}
                        navigation
                        pagination={{ clickable: true }}
                        autoplay={{ delay: 3500, disableOnInteraction: false }}
                        style={{ borderRadius: 16 }}
                      >
                        {(item.images && item.images.length > 0 ? item.images : [{ url: item.image }]).map((img, idx) => (
                          img.url ? (
                            <SwiperSlide key={idx}>
                              <Image
                                src={img.url}
                                alt={item.title}
                                width={400}
                                height={200}
                                style={{ width: '100%', height: 'auto', objectFit: 'cover', borderRadius: 16, boxShadow: '0 4px 24px 0 rgba(34,211,238,0.12)', cursor: 'pointer' }}
                                onClick={() => handleOpenImageModal(img.url ?? '')}
                              />
                            </SwiperSlide>
                          ) : null
                        ))}
                      </Swiper>
                      {(item.images && item.images.length > 1) && (
                        <Box sx={{ position: 'absolute', top: 8, left: 8, bgcolor: 'rgba(24,26,32,0.7)', color: '#22d3ee', px: 1.5, py: 0.5, borderRadius: 2, fontWeight: 700, fontSize: 14, zIndex: 2 }}>
                          {item.images.length} عکس
                        </Box>
                      )}
                      {/* Modal for image preview */}
                      {openImageModal && selectedImageUrl && (
                        <Modal open={openImageModal} onClose={handleCloseImageModal}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', bgcolor: 'rgba(0,0,0,0.85)' }}>
                            <img src={selectedImageUrl} alt="news" style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 16, boxShadow: '0 8px 32px 0 #22d3ee99' }} />
                          </Box>
                        </Modal>
                      )}
                    </Box>
                  )}
                  
                  {/* Title */}
                  <Typography variant="h6" fontWeight={800} color="#fff" mb={1} sx={{ letterSpacing: 0.5 }}>
                    {item.title}
                  </Typography>
                  
                  {/* Summary/Content */}
                  <Typography variant="body2" color="rgba(255,255,255,0.7)" mb={2} sx={{ flex: 1 }}>
                    {item.summary ? truncateText(item.summary, 120) : truncateText(item.content, 120)}
                  </Typography>
                  
                  {/* Meta Info */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Person sx={{ fontSize: 16, color: '#22d3ee' }} />
                      <Typography variant="caption" color="#22d3ee" fontWeight={700}>
                        {item.author}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(item.publishedAt || item.date)}
                      </Typography>
                    </Box>
                  </Box>
                </GlassCard>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'fa', ['common'], nextI18NextConfig)),
    },
  };
}; 