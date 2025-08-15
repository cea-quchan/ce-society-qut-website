import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { Container, Typography, Grid, Box, Card, Button, CircularProgress, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Image from 'next/image';
import { useTranslation } from 'next-i18next';
import SEO from '@/components/common/SEO';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Mousewheel, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';
import LoginIcon from '@mui/icons-material/Login';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import Skeleton from '@mui/material/Skeleton';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ReplayIcon from '@mui/icons-material/Replay';
import IconButton from '@mui/material/IconButton';

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
  transition: 'all 0.25s cubic-bezier(.4,2,.6,1)',
  position: 'relative',
  zIndex: 1,
  '&:hover': {
    background: 'linear-gradient(90deg, #22d3ee 0%, #10b981 100%)',
    color: '#fff',
    boxShadow: '0 0 16px 4px #22d3ee99, 0 4px 24px 0 rgba(16,185,129,0.25)',
    transform: 'scale(1.06)',
    filter: 'brightness(1.08)',
  },
  '&:active': {
    transform: 'scale(0.96)',
    boxShadow: '0 1px 8px 0 rgba(16,185,129,0.12)',
  },
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    fontSize: '1rem',
    padding: '0.7rem 1.2rem',
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
  transition: 'all 0.25s cubic-bezier(.4,2,.6,1)',
  position: 'relative',
  zIndex: 1,
  '&:hover': {
    background: 'linear-gradient(90deg, #22d3ee 0%, #10b981 100%)',
    color: '#fff',
    borderColor: '#10b981',
    boxShadow: '0 0 16px 4px #22d3ee99, 0 4px 24px 0 rgba(16,185,129,0.18)',
    transform: 'scale(1.06)',
    filter: 'brightness(1.08)',
  },
  '&:active': {
    transform: 'scale(0.96)',
    boxShadow: '0 1px 8px 0 #22d3ee33',
  },
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    fontSize: '1rem',
    padding: '0.7rem 1.2rem',
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

const TypewriterText = styled(Typography)(({ theme }) => ({
  color: 'rgba(255,255,255,0.85)',
  fontWeight: 400,
  mb: 4,
  '&::after': {
    content: '""',
    display: 'inline-block',
    width: '2px',
    height: '1.2em',
    backgroundColor: '#22d3ee',
    marginLeft: '4px',
    animation: 'blink 1s infinite',
  },
  '@keyframes blink': {
    '0%, 50%': {
      opacity: 1,
    },
    '51%, 100%': {
      opacity: 0,
    },
  },
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

// 1. ابزارهای پلتفرم و آیکون‌ها
const PLATFORM_ICONS: Record<string, JSX.Element> = {
  aparat: <Image src="/icons/aparat.svg" alt="آیکون آپارات" width={28} height={28} />, 
  youtube: <Image src="/icons/youtube.svg" alt="آیکون یوتیوب" width={28} height={28} />, 
  faradars: <Image src="/icons/faradars.svg" alt="آیکون فرادرس" width={28} height={28} />, 
  maktabkhooneh: <Image src="/icons/maktabkhooneh.svg" alt="آیکون مکتب‌خونه" width={28} height={28} />, 
  twitch: <Image src="/icons/twitch.svg" alt="آیکون توییچ" width={28} height={28} />, 
  direct: <Image src="/icons/video.svg" alt="آیکون ویدیو مستقیم" width={28} height={28} />, 
};

function getEmbedUrl(video: any): string | null {
  const url = video.videoUrl;
  switch (video.platform) {
    case 'aparat': {
      const aparatEmbed = url.match(/\/embed\/([\w\d]+)/);
      if (aparatEmbed) return `https://www.aparat.com/video/video/embed/videohash/${aparatEmbed[1]}/vt/frame`;
      const aparatNormal = url.match(/aparat\.com\/v\/([\w\d]+)/);
      if (aparatNormal) return `https://www.aparat.com/video/video/embed/videohash/${aparatNormal[1]}/vt/frame`;
      return null;
    }
    case 'youtube': {
      const yt1 = url.match(/youtube\.com\/watch\?v=([\w\-]+)/);
      if (yt1) return `https://www.youtube.com/embed/${yt1[1]}`;
      const yt2 = url.match(/youtu\.be\/([\w\-]+)/);
      if (yt2) return `https://www.youtube.com/embed/${yt2[1]}`;
      return null;
    }
    case 'faradars': {
      // فرادرس embed: https://faradars.org/courses/fvfree-vid/embed
      const match = url.match(/faradars\.org\/courses\/([\w\-]+)\/embed/);
      if (match) return url;
      return null;
    }
    case 'maktabkhooneh': {
      // مکتب‌خونه embed: https://maktabkhooneh.org/embed/abcde
      const match = url.match(/maktabkhooneh\.org\/embed\/([\w\-]+)/);
      if (match) return url;
      return null;
    }
    case 'twitch': {
      // Twitch embed: https://player.twitch.tv/?video=123456&parent=yourdomain.com
      if (url.includes('twitch.tv')) return url;
      return null;
    }
    case 'direct': {
      if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(url)) return url;
      return null;
    }
    default:
      return null;
  }
}

const Home: React.FC<{ heroOpen: boolean, statsActiveMembers: number, statsWorkshops: number, statsCompetitions: number }> = ({ heroOpen, statsActiveMembers, statsWorkshops, statsCompetitions }) => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [newsData, setNewsData] = useState<any[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState(true);
  const [errorNews, setErrorNews] = useState<string | null>(null);
  const [openImageModal, setOpenImageModal] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [heroVideo, setHeroVideo] = useState<any>(null);
  const [isLoadingHero, setIsLoadingHero] = useState(true);
  const [typewriterText, setTypewriterText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showHeroVideo, setShowHeroVideo] = useState(false);
  const [heroVideos, setHeroVideos] = useState<any[]>([]);
  const [videoError, setVideoError] = useState<{ [id: string]: string }>({});
  const handleVideoError = (id: string, type: string) => {
    if (type === 'network') setVideoError((prev) => ({ ...prev, [id]: 'network' }));
    else setVideoError((prev) => ({ ...prev, [id]: 'load' }));
  };
  const handleRetry = (id: string) => {
    setVideoError((prev) => ({ ...prev, [id]: '' }));
  };
  const [videoLoading, setVideoLoading] = useState<{ [id: string]: boolean }>({});
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(true);
  const handleVideoLoad = (id: string) => {
    setVideoLoading((prev) => ({ ...prev, [id]: false }));
  };
  const handleVideoStartLoad = (id: string) => {
    setVideoLoading((prev) => ({ ...prev, [id]: true }));
  };

  const fullText = "برگزاری کارگاه‌ها، مسابقات و همایش‌های علمی و تخصصی برای ارتقای سطح دانشجویان و علاقه‌مندان به **مهندسی کامپیوتر**";

  const handleJoinNow = useCallback(() => {
    if (session) {
      router.push('/dashboard').finally(() => setIsLoading(false));
    } else {
      router.push('/register').finally(() => setIsLoading(false));
    }
  }, [session, router]);

  const handleOpenImageModal = (url: string) => { setSelectedImageUrl(url); setOpenImageModal(true); };
  const handleCloseImageModal = () => { setOpenImageModal(false); setSelectedImageUrl(null); };

  // Typewriter effect
  useEffect(() => {
    if (currentIndex < fullText.length) {
      const timeout = setTimeout(() => {
        setTypewriterText(fullText.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, 50);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, fullText]);

  // حذف تاخیرهای setTimeout و موازی‌سازی fetchها:
  const fetchAll = async () => {
    setIsLoadingNews(true);
    setIsLoadingHero(true);
    try {
      const [newsRes, heroRes] = await Promise.all([
        fetch('/api/news?published=true&limit=6'),
        fetch('/api/hero-video')
      ]);
      const newsJson = await newsRes.json();
      const heroJson = await heroRes.json();
      if (newsJson.success) setNewsData(newsJson.data.filter((item: any) => item.published).slice(0, 6));
      else setErrorNews(newsJson.error?.message || 'خطا در دریافت اخبار');
      if (heroJson.success && Array.isArray(heroJson.data)) {
        const validVideos = heroJson.data.filter((video: any) => video && video.videoUrl && getEmbedUrl(video));
        setHeroVideos(validVideos);
      }
    } catch (e) {
      setErrorNews('خطا در دریافت اخبار');
    } finally {
      setIsLoadingNews(false);
      setIsLoadingHero(false);
    }
  };

  useEffect(() => {
    fetchAll();
    setIsLoadingStats(false);
    setIsLoadingServices(false);
    setIsLoadingTeachers(false);
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

  const getNewsImages = (news: any) => (news.images && news.images.length > 0 ? news.images : (news.image ? [{ url: news.image }] : []));

  // تابع استخراج لینک embed برای آپارات، یوتیوب و لینک مستقیم ویدیو
  function getVideoEmbed(url: string): { type: 'aparat' | 'youtube' | 'direct' | 'unknown', embedUrl?: string } {
    if (!url) return { type: 'unknown', embedUrl: undefined };
    // Aparat embed or normal
    const aparatEmbed = url.match(/\/embed\/([\w\d]+)/);
    if (aparatEmbed) {
      return { type: 'aparat', embedUrl: `https://www.aparat.com/video/video/embed/videohash/${aparatEmbed[1]}/vt/frame` };
    }
    const aparatNormal = url.match(/aparat\.com\/v\/([\w\d]+)/);
    if (aparatNormal) {
      return { type: 'aparat', embedUrl: `https://www.aparat.com/video/video/embed/videohash/${aparatNormal[1]}/vt/frame` };
    }
    // YouTube
    const yt1 = url.match(/youtube\.com\/watch\?v=([\w\-]+)/);
    if (yt1) {
      return { type: 'youtube', embedUrl: `https://www.youtube.com/embed/${yt1[1]}` };
    }
    const yt2 = url.match(/youtu\.be\/([\w\-]+)/);
    if (yt2) {
      return { type: 'youtube', embedUrl: `https://www.youtube.com/embed/${yt2[1]}` };
    }
    // Direct video (mp4, webm, ogg)
    if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(url)) {
      return { type: 'direct', embedUrl: url };
    }
    return { type: 'unknown', embedUrl: undefined };
  }

  // تعریف videoInfo فقط با نوع خروجی getVideoEmbed:
  const videoInfo = getVideoEmbed(heroVideo?.videoUrl || '');

  const memoizedHeroVideos = useMemo(() => heroVideos, [heroVideos]);
  const memoizedNewsData = useMemo(() => newsData, [newsData]);
  const memoizedHandleRetryNews = useCallback(() => {
    fetchAll();
  }, []);
  const memoizedHandleNavigation = useCallback((path: string) => {
    if (router.pathname !== path) {
      setIsLoading(true);
      router.push(path).finally(() => setIsLoading(false));
    }
  }, [router]);

  return (
    <>
      <SEO
        title={t('site.title')}
        description={t('site.description')}
        keywords={t('site.keywords')}
      />
      <Box sx={{ bgcolor: '#000', minHeight: '100vh', width: '100%' }}>
        <Container maxWidth="lg" sx={{ pt: 3, pb: 1 }}>
          <Breadcrumbs items={[]} />
        </Container>
        {/* Hero Section */}
        {heroOpen && (
          <HeroSection>
            <Container maxWidth="lg">
              <Grid container spacing={4} alignItems="center">
                {/* متن و دکمه‌ها */}
                <Grid item xs={12} md={6}>
                  <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
                    <Typography
                      component="h1"
                      variant="h1"
                      sx={{
                        color: '#fff',
                        fontWeight: 800,
                        mb: 2,
                        fontSize: { xs: '2rem', sm: '2.2rem', md: '2.8rem' },
                        letterSpacing: '-1px',
                        lineHeight: { xs: 1.2, sm: 1.1, md: 1 },
                        textAlign: { xs: 'center', md: 'right' },
                      }}
                    >
                      {t('home.hero.title')}
                    </Typography>
                                         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
                       <TypewriterText variant="body1" sx={{ textAlign: { xs: 'center', md: 'right' } }}>
                         {typewriterText.split('**').map((part, index) => 
                           index % 2 === 0 ? part : (
                             <span key={index} style={{ fontWeight: 700, color: '#22d3ee' }}>
                               {part}
                             </span>
                           )
                         )}
                       </TypewriterText>
                     </motion.div>
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2, duration: 1 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          color: '#22d3ee',
                          mb: 2,
                          fontWeight: 600,
                          textAlign: { xs: 'center', md: 'right' },
                          fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                        }}
                      >
                        به باشگاه مهندسی کامپیوتر خوش آمدید!
                      </Typography>
                    </motion.div>
                    <Box sx={{ display: 'flex', gap: { xs: 1, sm: 2 }, flexWrap: 'wrap', flexDirection: { xs: 'column', sm: 'row' }, mt: { xs: 2, sm: 0 } }}>
                      <NeonButton onClick={handleJoinNow} disabled={isLoading} fullWidth={false} aria-label="عضویت در باشگاه">{t('home.hero.cta')}</NeonButton>
                      <OutlineButton onClick={() => memoizedHandleNavigation('/about')} fullWidth={false} aria-label="اطلاعات بیشتر درباره باشگاه">{t('home.hero.learnMore')}</OutlineButton>
                    </Box>
                  </motion.div>
                </Grid>
                {/* ویدیوها یا پیام جایگزین */}
                <Grid item xs={12} md={6}>
                  {isLoadingHero ? (
                                         <Box sx={{ width: '100%', height: 400, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                       <Box sx={{ 
                         borderRadius: 16, 
                         overflow: 'hidden', 
                         background: 'rgba(20,22,30,0.98)', 
                         boxShadow: '0 8px 32px 0 rgba(34, 211, 238, 0.18)', 
                         border: '2px solid rgba(34,211,238,0.10)', 
                         p: 2, 
                         width: '100%',
                         height: '100%',
                         display: 'flex',
                         flexDirection: 'column',
                         justifyContent: 'center',
                         alignItems: 'center'
                       }}>
                         <Skeleton variant="rectangular" width="100%" height={280} sx={{ borderRadius: 12, mb: 2, bgcolor: 'grey.900' }} />
                         <Skeleton variant="text" width="60%" height={32} sx={{ bgcolor: 'grey.800', mb: 1 }} />
                         <Skeleton variant="text" width="80%" height={24} sx={{ bgcolor: 'grey.800' }} />
                       </Box>
                     </Box>
                  ) : memoizedHeroVideos && memoizedHeroVideos.length > 0 ? (
                    <motion.div
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.7 }}
                    >
                      <Swiper
                        modules={[Autoplay]}
                        slidesPerView={1}
                        loop={true}
                                                 style={{ 
                           width: '100%', 
                           height: 400, 
                           borderRadius: 16, 
                           background: 'rgba(20,22,30,0.98)', 
                           boxShadow: '0 8px 32px 0 rgba(34,211,238,0.18)', 
                           border: '2px solid rgba(34,211,238,0.10)' 
                         }}

                        autoplay={{
                          delay: 4000,
                          disableOnInteraction: false,
                        }}
                      >
                        {memoizedHeroVideos.map((video: any, idx: number) => (
                          <SwiperSlide key={video.id}>
                                                         <Box sx={{
                               position: 'relative',
                               width: '100%',
                               height: '100%',
                               borderRadius: 4,
                               overflow: 'hidden',
                               boxShadow: '0 8px 32px 0 rgba(34, 211, 238, 0.18)',
                               background: 'rgba(20,22,30,0.98)',
                               border: '2px solid rgba(34,211,238,0.10)',
                               transition: 'all 0.3s',
                               display: 'flex',
                               flexDirection: 'column',
                               '&:hover': {
                                 boxShadow: '0 16px 48px 0 rgba(34, 211, 238, 0.28)',
                                 borderColor: '#22d3ee',
                                 transform: 'scale(1.02)',
                               },
                             }}>
                              {/* Platform Icon */}
                              <Box sx={{ 
                                position: 'absolute', 
                                top: 12, 
                                right: 12, 
                                zIndex: 2,
                                background: 'rgba(24,26,32,0.95)',
                                borderRadius: 2,
                                p: 0.5,
                                backdropFilter: 'blur(8px)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                              }}>
                                {PLATFORM_ICONS[video.platform] || PLATFORM_ICONS['direct']}
                              </Box>
                              {/* Loading Indicator */}
                              {videoLoading[video.id] && (
                                <Box sx={{
                                  position: 'absolute',
                                  top: '50%',
                                  left: '50%',
                                  transform: 'translate(-50%, -50%)',
                                  zIndex: 3,
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  gap: 1
                                }}>
                                  <CircularProgress size={40} sx={{ color: '#22d3ee' }} />
                                  <Typography variant="caption" sx={{ color: '#fff', opacity: 0.8 }}>
                                    در حال بارگذاری...
                                  </Typography>
                                </Box>
                              )}
                                                             {/* Video Container */}
                               <Box sx={{
                                 position: 'relative',
                                 width: '100%',
                                 flex: 1,
                                 background: '#000',
                                 borderRadius: '12px 12px 0 0',
                                 overflow: 'hidden',
                               }}>
                                {videoError[video.id] === 'network' ? (
                                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 2 }}>
                                    <WifiOffIcon sx={{ fontSize: 48, color: '#f87171', opacity: 0.7 }} />
                                    <Typography variant="body2" sx={{ color: '#fff', textAlign: 'center', fontWeight: 700, mb: 1 }}>
                                      اتصال اینترنت برقرار نیست
                                    </Typography>
                                    <IconButton color="primary" onClick={() => handleRetry(video.id)}><ReplayIcon /></IconButton>
                                  </Box>
                                ) : videoError[video.id] === 'load' ? (
                                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 2 }}>
                                    <ErrorOutlineIcon sx={{ fontSize: 48, color: '#fbbf24', opacity: 0.7 }} />
                                    <Typography variant="body2" sx={{ color: '#fff', textAlign: 'center', fontWeight: 700, mb: 1 }}>
                                      ویدیو یافت نشد یا سایت میزبان مشکل دارد
                                    </Typography>
                                    <IconButton color="primary" onClick={() => handleRetry(video.id)}><ReplayIcon /></IconButton>
                                  </Box>
                                ) : video.platform === 'direct' ? (
                                  <video
                                    src={getEmbedUrl(video) || ''}
                                    controls
                                    style={{ 
                                      width: '100%', 
                                      height: '100%', 
                                      objectFit: 'cover',
                                      borderRadius: '12px 12px 0 0'
                                    }}
                                    title="ویدیو"
                                    onLoadStart={() => handleVideoStartLoad(video.id)}
                                    onLoadedData={() => handleVideoLoad(video.id)}
                                    onError={(e) => handleVideoError(video.id, (e?.currentTarget?.error?.code === 2 ? 'network' : 'load'))}
                                  />
                                ) : getEmbedUrl(video) ? (
                                  <iframe
                                    src={getEmbedUrl(video)!}
                                    allowFullScreen
                                    style={{ 
                                      width: '100%', 
                                      height: '100%', 
                                      border: 'none',
                                      borderRadius: '12px 12px 0 0'
                                    }}
                                    title={video.platform}
                                    loading="lazy"
                                    onLoad={() => handleVideoLoad(video.id)}
                                    onError={() => handleVideoError(video.id, 'load')}
                                  />
                                ) : (
                                  <Box sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: '100%',
                                    background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
                                    gap: 1
                                  }}>
                                    <PlayArrowIcon sx={{ fontSize: 48, color: '#22d3ee', opacity: 0.5 }} />
                                    <Typography variant="body2" sx={{ 
                                      color: '#fff', 
                                      textAlign: 'center', 
                                      p: 2,
                                      opacity: 0.7,
                                      fontSize: '0.8rem'
                                    }}>
                                      لینک ویدیوی وارد شده پشتیبانی نمی‌شود
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                                                             {/* Description */}
                               <Box sx={{
                                 p: 2,
                                 background: 'rgba(24,26,32,0.98)',
                                 borderTop: '1px solid rgba(255,255,255,0.1)',
                                 minHeight: 60,
                                 display: 'flex',
                                 alignItems: 'center',
                                 justifyContent: 'center'
                               }}>
                                 <Typography variant="body2" sx={{ 
                                   color: '#22d3ee', 
                                   textAlign: 'center', 
                                   fontWeight: 600,
                                   fontSize: '0.95rem',
                                   lineHeight: 1.5
                                 }}>
                                   {video.description || 'ویدیو بدون توضیحات'}
                                 </Typography>
                               </Box>
                            </Box>
                          </SwiperSlide>
                        ))}
                      </Swiper>
                    </motion.div>
                  ) : (
                                         <Box sx={{ 
                       display: 'flex', 
                       flexDirection: 'column', 
                       alignItems: 'center', 
                       justifyContent: 'center', 
                       height: 400,
                       background: 'rgba(24,26,32,0.3)',
                       borderRadius: 4,
                       border: '2px dashed rgba(255,255,255,0.2)',
                       backdropFilter: 'blur(8px)',
                       p: 3
                     }}>
                      <PlayArrowIcon sx={{ fontSize: 80, color: '#22d3ee', opacity: 0.5, mb: 2 }} />
                      <Typography variant="h6" sx={{ 
                        color: '#fff', 
                        mb: 1,
                        opacity: 0.9,
                        textAlign: 'center',
                        fontWeight: 600
                      }}>
                        ویدیویی برای نمایش وجود ندارد
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: 'rgba(255,255,255,0.7)', 
                        textAlign: 'center',
                        maxWidth: 300
                      }}>
                        ویدیوهای جدید به زودی اضافه خواهند شد
                      </Typography>
                    </Box>
                  )}
                </Grid>
              </Grid>
            </Container>
          </HeroSection>
        )}

                  {/* Stats Section */}
          <Section>
            <Typography component="h2" variant="h4" sx={{ color: '#22d3ee', fontWeight: 700, mb: 4, textAlign: 'center' }}>{t('home.stats.title')}</Typography>
            {isLoadingStats ? (
              <Grid container spacing={4} justifyContent="center">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <Grid item xs={12} sm={4} key={idx}>
                    <Box sx={{ borderRadius: 4, overflow: 'hidden', background: 'rgba(24,26,32,0.95)', boxShadow: '0 4px 24px 0 rgba(34,211,238,0.10)', border: '2px solid rgba(255,255,255,0.1)', p: 2 }}>
                      <Skeleton variant="rectangular" width="100%" height={160} sx={{ borderRadius: 2, mb: 2, bgcolor: 'grey.900' }} />
                      <Skeleton variant="text" width="70%" height={32} sx={{ bgcolor: 'grey.800', mb: 1 }} />
                      <Skeleton variant="text" width="90%" height={24} sx={{ bgcolor: 'grey.800' }} />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Grid container spacing={4} justifyContent="center">
                {statsData.map((stat, index) => (
                  <Grid item xs={12} sm={4} key={stat.id}>
                    <motion.div
                      initial={{ 
                        opacity: 0, 
                        y: 120,
                        rotateX: 20,
                        scale: 0.7
                      }}
                      animate={{ 
                        opacity: 1, 
                        y: 0,
                        rotateX: 0,
                        scale: 1
                      }}
                      transition={{ 
                        duration: 1.4, 
                        delay: index * 0.3,
                        ease: [0.25, 0.46, 0.45, 0.94]
                      }}
                      whileHover={{
                        y: -12,
                        scale: 1.05,
                        transition: { duration: 0.4 }
                      }}
                      style={{
                        transformStyle: 'preserve-3d',
                      }}
                    >
                      <motion.div
                        animate={{
                          y: [0, -8, 0],
                          rotateZ: [0, 1, 0],
                          rotateY: [0, 2, 0],
                          x: index % 2 === 0 ? [0, 2, 0] : [0, -2, 0],
                        }}
                        transition={{
                          duration: 3 + (index * 0.5),
                          repeat: Infinity,
                          repeatType: "reverse",
                          delay: index * 0.8,
                          ease: "easeInOut"
                        }}
                        style={{
                          transformStyle: 'preserve-3d',
                        }}
                      >
                        <GlassCard
                          sx={{
                            position: 'relative',
                            overflow: 'hidden',
                            backdropFilter: 'blur(15px)',
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              background: 'radial-gradient(circle at 50% 50%, rgba(34,211,238,0.08) 0%, transparent 60%)',
                              animation: 'ripple 2.5s ease-in-out infinite',
                              '@keyframes ripple': {
                                '0%, 100%': {
                                  transform: 'scale(1)',
                                  opacity: 0.4,
                                },
                                '50%': {
                                  transform: 'scale(1.2)',
                                  opacity: 0.8,
                                },
                              },
                            },
                          }}
                        >
                          <Box sx={{ fontSize: '2.5rem', mb: 1 }}>{stat.icon}</Box>
                          <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700 }}>{stat.value}</Typography>
                          <Typography variant="subtitle1" sx={{ color: '#22d3ee', fontWeight: 600 }}>{stat.title}</Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 1 }}>{stat.description}</Typography>
                        </GlassCard>
                      </motion.div>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            )}
          </Section>

          {/* Expert Teachers Section */}
          <Section>
            <SectionTitle>اساتید برجسته</SectionTitle>
            {isLoadingTeachers ? (
              <Grid container spacing={4} justifyContent="center">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <Grid item xs={12} sm={6} md={4} key={idx}>
                    <Box sx={{ borderRadius: 4, overflow: 'hidden', background: 'rgba(24,26,32,0.95)', boxShadow: '0 4px 24px 0 rgba(34,211,238,0.10)', border: '2px solid rgba(255,255,255,0.1)', p: 2 }}>
                      <Skeleton variant="rectangular" width="100%" height={420} sx={{ borderRadius: 24, mb: 2, bgcolor: 'grey.900' }} />
                      <Skeleton variant="text" width="70%" height={32} sx={{ bgcolor: 'grey.800', mb: 1 }} />
                      <Skeleton variant="text" width="90%" height={24} sx={{ bgcolor: 'grey.800' }} />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Grid container spacing={4} justifyContent="center">
                {[
                  {
                    id: 1,
                    name: 'دکتر احمد محمدی',
                    title: 'استاد دانشگاه تهران',
                    specialty: 'هوش مصنوعی و یادگیری ماشین',
                    image: '/images/team/member1.jpg',
                    description: 'متخصص در زمینه‌های هوش مصنوعی، یادگیری عمیق و پردازش زبان طبیعی',
                    achievements: '15+ سال تجربه در پژوهش و تدریس',
                    expertise: ['هوش مصنوعی', 'یادگیری عمیق', 'پردازش زبان طبیعی']
                  },
                  {
                    id: 2,
                    name: 'دکتر فاطمه کریمی',
                    title: 'استاد دانشگاه شریف',
                    specialty: 'شبکه‌های کامپیوتری',
                    image: '/images/team/member2.jpg',
                    description: 'کارشناس در زمینه‌های امنیت شبکه، اینترنت اشیاء و محاسبات ابری',
                    achievements: '12+ سال تجربه در صنعت و دانشگاه',
                    expertise: ['امنیت شبکه', 'اینترنت اشیاء', 'محاسبات ابری']
                  },
                  {
                    id: 3,
                    name: 'دکتر علی رضایی',
                    title: 'استاد دانشگاه امیرکبیر',
                    specialty: 'مهندسی نرم‌افزار',
                    image: '/images/team/member3.jpg',
                    description: 'متخصص در معماری نرم‌افزار، الگوهای طراحی و توسعه‌ی چابک',
                    achievements: '18+ سال تجربه در توسعه نرم‌افزار',
                    expertise: ['معماری نرم‌افزار', 'الگوهای طراحی', 'توسعه چابک']
                  }
                ].map((teacher, index) => (
                  <Grid item xs={12} sm={6} md={4} key={teacher.id}>
                    <motion.div
                      initial={{ 
                        opacity: 0, 
                        y: 100,
                        rotateX: 15,
                        scale: 0.8
                      }}
                      animate={{ 
                        opacity: 1, 
                        y: 0,
                        rotateX: 0,
                        scale: 1
                      }}
                      transition={{ 
                        duration: 1.2, 
                        delay: index * 0.2,
                        ease: [0.25, 0.46, 0.45, 0.94]
                      }}
                      whileHover={{
                        y: -8,
                        scale: 1.02,
                        transition: { duration: 0.3 }
                      }}
                      style={{
                        transformStyle: 'preserve-3d',
                      }}
                    >
                      <motion.div
                        animate={{
                          y: [0, -5, 0],
                          rotateZ: [0, 0.5, 0],
                          x: index % 2 === 0 ? [0, 1, 0] : [0, -1, 0],
                          rotateY: index % 3 === 0 ? [0, 1, 0] : index % 3 === 1 ? [0, -1, 0] : [0, 0.5, 0],
                          scale: index % 4 === 0 ? [1, 1.01, 1] : index % 4 === 1 ? [1, 0.99, 1] : [1, 1.005, 1],
                        }}
                        transition={{
                          duration: 4 + (index * 0.2),
                          repeat: Infinity,
                          repeatType: "reverse",
                          delay: index * 0.5,
                          ease: "easeInOut"
                        }}
                        style={{
                          transformStyle: 'preserve-3d',
                        }}
                      >
                        <GlassCard sx={{ 
                          minHeight: 420,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          textAlign: 'center',
                          p: 3,
                          borderRadius: '24px',
                          background: 'linear-gradient(135deg, rgba(20,22,30,0.95) 0%, rgba(34,211,238,0.05) 100%)',
                          border: '2px solid rgba(34,211,238,0.15)',
                          boxShadow: '0 8px 32px rgba(34,211,238,0.1), 0 4px 16px rgba(0,0,0,0.3)',
                          position: 'relative',
                          overflow: 'hidden',
                          transition: 'all 0.3s ease',
                          backdropFilter: 'blur(10px)',
                          '&:hover': {
                            transform: 'translateY(-8px)',
                            boxShadow: '0 16px 48px rgba(34,211,238,0.2), 0 8px 24px rgba(0,0,0,0.4)',
                            borderColor: '#22d3ee',
                            '& .teacher-image': {
                              transform: 'scale(1.05)',
                              boxShadow: '0 8px 32px rgba(34,211,238,0.4)'
                            },
                            '& .expertise-tags': {
                              opacity: 1,
                              transform: 'translateY(0)'
                            }
                          },
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '2px',
                            background: 'linear-gradient(90deg, transparent, #22d3ee, transparent)',
                            opacity: 0,
                            transition: 'opacity 0.3s ease'
                          },
                          '&:hover::before': {
                            opacity: 1
                          }
                        }}>
                          {/* Water Ripple Effect */}
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              background: 'radial-gradient(circle at 50% 50%, rgba(34,211,238,0.05) 0%, transparent 70%)',
                              animation: 'ripple 3s ease-in-out infinite',
                              '@keyframes ripple': {
                                '0%, 100%': {
                                  transform: 'scale(1)',
                                  opacity: 0.3,
                                },
                                '50%': {
                                  transform: 'scale(1.1)',
                                  opacity: 0.6,
                                },
                              },
                            }}
                          />
                          {/* Background Pattern */}
                          <Box sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'radial-gradient(circle at 20% 80%, rgba(34,211,238,0.03) 0%, transparent 50%)',
                            pointerEvents: 'none'
                          }} />
                          
                          {/* Profile Image */}
                          <Box sx={{
                            width: 140,
                            height: 140,
                            borderRadius: '50%',
                            overflow: 'hidden',
                            mb: 3,
                            border: '4px solid rgba(34,211,238,0.3)',
                            boxShadow: '0 8px 32px rgba(34,211,238,0.2), inset 0 0 20px rgba(34,211,238,0.1)',
                            position: 'relative',
                            transition: 'all 0.3s ease',
                            className: 'teacher-image'
                          }}>
                            <Image
                              src={teacher.image}
                              alt={teacher.name}
                              width={140}
                              height={140}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                transition: 'transform 0.3s ease'
                              }}
                            />
                            {/* Glow Effect */}
                            <Box sx={{
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                              width: '100%',
                              height: '100%',
                              borderRadius: '50%',
                              background: 'radial-gradient(circle, rgba(34,211,238,0.1) 0%, transparent 70%)',
                              pointerEvents: 'none'
                            }} />
                          </Box>

                          {/* Name */}
                          <Typography variant="h6" sx={{ 
                            color: '#fff', 
                            fontWeight: 800, 
                            mb: 1,
                            fontSize: '1.2rem',
                            textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                          }}>
                            {teacher.name}
                          </Typography>

                          {/* Title */}
                          <Typography variant="subtitle1" sx={{ 
                            color: '#22d3ee', 
                            fontWeight: 600,
                            mb: 1,
                            fontSize: '1rem',
                            opacity: 0.9
                          }}>
                            {teacher.title}
                          </Typography>

                          {/* Specialty */}
                          <Typography variant="body1" sx={{ 
                            color: '#22d3ee', 
                            fontWeight: 700,
                            mb: 2,
                            fontSize: '0.95rem',
                            opacity: 0.95,
                            background: 'linear-gradient(90deg, rgba(34,211,238,0.1), rgba(34,211,238,0.05))',
                            borderRadius: '12px',
                            px: 2,
                            py: 1,
                            border: '1px solid rgba(34,211,238,0.2)'
                          }}>
                            {teacher.specialty}
                          </Typography>

                          {/* Achievements */}
                          <Typography variant="body2" sx={{ 
                            color: 'rgba(255,255,255,0.9)', 
                            fontSize: '0.85rem',
                            mb: 2,
                            fontWeight: 500,
                            opacity: 0.8
                          }}>
                            {teacher.achievements}
                          </Typography>

                          {/* Description */}
                          <Typography variant="body2" sx={{ 
                            color: 'rgba(255,255,255,0.8)', 
                            fontSize: '0.85rem',
                            lineHeight: 1.6,
                            mb: 2
                          }}>
                            {teacher.description}
                          </Typography>

                          {/* Expertise Tags */}
                          <Box sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 1,
                            justifyContent: 'center',
                            opacity: 0,
                            transform: 'translateY(10px)',
                            transition: 'all 0.3s ease',
                            className: 'expertise-tags'
                          }}>
                            {teacher.expertise.map((skill, skillIndex) => (
                              <Box
                                key={skillIndex}
                                sx={{
                                  background: 'linear-gradient(135deg, rgba(34,211,238,0.2), rgba(34,211,238,0.1))',
                                  color: '#22d3ee',
                                  px: 1.5,
                                  py: 0.5,
                                  borderRadius: '12px',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  border: '1px solid rgba(34,211,238,0.3)',
                                  backdropFilter: 'blur(10px)',
                                  transition: 'all 0.2s ease',
                                  '&:hover': {
                                    background: 'linear-gradient(135deg, rgba(34,211,238,0.3), rgba(34,211,238,0.2))',
                                    transform: 'scale(1.05)'
                                  }
                                }}
                              >
                                {skill}
                              </Box>
                            ))}
                          </Box>
                        </GlassCard>
                      </motion.div>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            )}
          </Section>

          {/* Services Section */}
          <Section>
            <SectionTitle>خدمات ما</SectionTitle>
            {isLoadingServices ? (
              <Grid container spacing={4} justifyContent="center">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <Grid item xs={12} sm={6} md={3} key={idx}>
                    <Box sx={{ borderRadius: 4, overflow: 'hidden', background: 'rgba(24,26,32,0.95)', boxShadow: '0 4px 24px 0 rgba(34,211,238,0.10)', border: '2px solid rgba(255,255,255,0.1)', p: 2 }}>
                      <Skeleton variant="rectangular" width="100%" height={220} sx={{ borderRadius: 2, mb: 2, bgcolor: 'grey.900' }} />
                      <Skeleton variant="text" width="70%" height={32} sx={{ bgcolor: 'grey.800', mb: 1 }} />
                      <Skeleton variant="text" width="90%" height={24} sx={{ bgcolor: 'grey.800' }} />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Grid container spacing={4} justifyContent="center">
                {servicesData.map((service, index) => (
                  <Grid item xs={12} sm={6} md={3} key={service.id}>
                    <motion.div
                      initial={{ 
                        opacity: 0, 
                        y: 80,
                        rotateX: 15,
                        scale: 0.8
                      }}
                      animate={{ 
                        opacity: 1, 
                        y: 0,
                        rotateX: 0,
                        scale: 1
                      }}
                      transition={{ 
                        duration: 1.2, 
                        delay: index * 0.3,
                        ease: [0.25, 0.46, 0.45, 0.94]
                      }}
                      whileHover={{
                        y: -8,
                        scale: 1.03,
                        transition: { duration: 0.4 }
                      }}
                      style={{
                        transformStyle: 'preserve-3d',
                      }}
                    >
                      <motion.div
                        animate={{
                          y: [0, -3, 0],
                          rotateZ: [0, 0.5, 0],
                          rotateY: [0, 1, 0],
                          x: index % 3 === 0 ? [0, 1, 0] : index % 3 === 1 ? [0, -1, 0] : [0, 0.5, 0],
                          scale: index % 2 === 0 ? [1, 1.005, 1] : [1, 0.995, 1],
                        }}
                        transition={{
                          duration: 4 + (index * 0.5),
                          repeat: Infinity,
                          repeatType: "reverse",
                          delay: index * 2,
                          ease: "easeInOut"
                        }}
                        style={{
                          transformStyle: 'preserve-3d',
                        }}
                      >
                        <GlassCard
                          onClick={service.disabled ? undefined : () => memoizedHandleNavigation(service.link)}
                          sx={{
                            cursor: service.disabled ? 'not-allowed' : 'pointer',
                            minHeight: 220,
                            opacity: service.disabled ? 0.5 : 1,
                            pointerEvents: service.disabled ? 'none' : 'auto',
                            position: 'relative',
                            overflow: 'hidden',
                            backdropFilter: 'blur(20px)',
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              background: 'radial-gradient(circle at 50% 50%, rgba(34,211,238,0.05) 0%, transparent 50%)',
                              animation: 'ripple 3s ease-in-out infinite',
                              '@keyframes ripple': {
                                '0%, 100%': {
                                  transform: 'scale(1)',
                                  opacity: 0.3,
                                },
                                '50%': {
                                  transform: 'scale(1.15)',
                                  opacity: 0.6,
                                },
                              },
                            },
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
                      </motion.div>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            )}
          </Section>

        {/* News Section */}
        <Section>
          <Typography component="h2" variant="h4" sx={{ color: '#22d3ee', fontWeight: 700, mb: 4, textAlign: 'center' }}>{t('home.news.title')}</Typography>
          {isLoadingNews ? (
            <Grid container spacing={{ xs: 2, sm: 4 }} justifyContent="center">
              {Array.from({ length: 3 }).map((_, idx) => (
                <Grid item xs={12} sm={6} md={4} key={idx}>
                  <Box sx={{ borderRadius: 4, overflow: 'hidden', background: 'rgba(24,26,32,0.95)', boxShadow: '0 4px 24px 0 rgba(34,211,238,0.10)', border: '2px solid rgba(255,255,255,0.1)', p: 2 }}>
                    <Skeleton variant="rectangular" width="100%" height={160} sx={{ borderRadius: 2, mb: 2, bgcolor: 'grey.900' }} />
                    <Skeleton variant="text" width="70%" height={32} sx={{ bgcolor: 'grey.800', mb: 1 }} />
                    <Skeleton variant="text" width="90%" height={24} sx={{ bgcolor: 'grey.800' }} />
                  </Box>
                </Grid>
              ))}
            </Grid>
          ) : errorNews ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="error" fontWeight={700} mb={2}>مشکلی در دریافت اخبار رخ داد.</Typography>
              <Button variant="outlined" color="primary" onClick={memoizedHandleRetryNews}>تلاش مجدد</Button>
            </Box>
          ) : memoizedNewsData.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <InfoOutlinedIcon sx={{ fontSize: 48, color: 'grey.500', mb: 1 }} />
              <Typography color="text.secondary">هیچ خبری برای نمایش وجود ندارد.</Typography>
            </Box>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <Grid container spacing={{ xs: 2, sm: 4 }} justifyContent="center">
                {memoizedNewsData.map((news, idx) => (
                  <motion.div
                    key={news.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: idx * 0.08 }}
                  >
                    <Grid item xs={12} sm={6} md={4}>
                      <GlassCard sx={{ minHeight: 320 }}>
                        {/* Image(s) - Mini slider */}
                        {getNewsImages(news).length > 0 && (
                          <Box sx={{ position: 'relative', borderRadius: 16, overflow: 'hidden', mb: 2 }}>
                            <Swiper
                              modules={[Navigation, Pagination]}
                              spaceBetween={8}
                              slidesPerView={1}
                              navigation
                              pagination={{ clickable: true }}
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
                                    loading="lazy"
                                  />
                                </SwiperSlide>
                              ))}
                            </Swiper>
                          </Box>
                        )}
                        <Typography
                          variant="h6"
                          fontWeight={800}
                          color="#fff"
                          mb={1}
                          sx={{ letterSpacing: 0.5, fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.3rem' }, textAlign: { xs: 'center', md: 'right' } }}
                        >
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
                  </motion.div>
                ))}
              </Grid>
            </motion.div>
          )}
        </Section>
      </Box>
    </>
  );
};

export default Home;

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/settings`);
  const settings = await res.json();
  return {
    props: {
      heroOpen: settings?.data?.heroOpen !== false,
      statsActiveMembers: settings?.data?.statsActiveMembers ?? 150,
      statsWorkshops: settings?.data?.statsWorkshops ?? 25,
      statsCompetitions: settings?.data?.statsCompetitions ?? 10,
      ...(await serverSideTranslations(locale || 'fa', ['common'])),
    },
  };
}; 