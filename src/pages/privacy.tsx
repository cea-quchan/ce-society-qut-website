import React from 'react';
import { motion } from 'framer-motion';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  useTheme as useMuiTheme,
  alpha
} from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import StorageIcon from '@mui/icons-material/Storage';
import LockIcon from '@mui/icons-material/Lock';
import ShareIcon from '@mui/icons-material/Share';
import CookieIcon from '@mui/icons-material/Cookie';
import PersonIcon from '@mui/icons-material/Person';
import RefreshIcon from '@mui/icons-material/Refresh';
import EmailIcon from '@mui/icons-material/Email';
import { useTranslation } from 'next-i18next';
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import SEO from '@/components/common/SEO';
import SchemaMarkup from '@/components/common/SchemaMarkup';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import nextI18NextConfig from '../../next-i18next.config.cjs';
import { useTheme } from '@/hooks/useTheme';

const sections = [
  {
    icon: <SecurityIcon sx={{ fontSize: 40, color: '#3B82F6' }} />,
    title: 'جمع‌آوری اطلاعات',
    content: [
      'نام و نام خانوادگی',
      'شماره دانشجویی',
      'آدرس ایمیل',
      'شماره تماس',
      'رشته و مقطع تحصیلی'
    ],
    description: 'انجمن علمی مهندسی کامپیوتر دانشگاه صنعتی قوچان، اطلاعات شخصی شما را با رعایت اصول حفظ حریم خصوصی جمع‌آوری می‌کند. این اطلاعات شامل:'
  },
  {
    icon: <StorageIcon sx={{ fontSize: 40, color: '#8B5CF6' }} />,
    title: 'استفاده از اطلاعات',
    content: [
      'ارائه خدمات انجمن',
      'ارسال اطلاعیه‌ها و اخبار',
      'برگزاری رویدادها و دوره‌ها',
      'ارتباط با اعضا',
      'بهبود خدمات انجمن'
    ],
    description: 'اطلاعات جمع‌آوری شده برای اهداف زیر استفاده می‌شود:'
  },
  {
    icon: <LockIcon sx={{ fontSize: 40, color: '#10B981' }} />,
    title: 'حفظ امنیت اطلاعات',
    content: [
      'از سیستم‌های امنیتی پیشرفته استفاده می‌شود',
      'دسترسی به اطلاعات محدود به افراد مجاز است',
      'اطلاعات به صورت دوره‌ای پشتیبان‌گیری می‌شود',
      'از رمزنگاری برای انتقال اطلاعات استفاده می‌شود'
    ],
    description: 'انجمن متعهد به حفظ امنیت اطلاعات شخصی شما است. برای این منظور:'
  },
  {
    icon: <ShareIcon sx={{ fontSize: 40, color: '#EC4899' }} />,
    title: 'اشتراک‌گذاری اطلاعات',
    content: [
      'با دانشگاه صنعتی قوچان',
      'با شرکای انجمن در برگزاری رویدادها',
      'در صورت درخواست قانونی'
    ],
    description: 'اطلاعات شخصی شما با رضایت شما و در موارد زیر به اشتراک گذاشته می‌شود:'
  },
  {
    icon: <CookieIcon sx={{ fontSize: 40, color: '#F59E0B' }} />,
    title: 'کوکی‌ها و فناوری‌های مشابه',
    content: [
      'به حفظ تنظیمات کاربر کمک می‌کنند',
      'عملکرد سایت را بهبود می‌بخشند',
      'به تحلیل رفتار کاربران کمک می‌کنند'
    ],
    description: 'انجمن از کوکی‌ها و فناوری‌های مشابه برای بهبود تجربه کاربری استفاده می‌کند. این فناوری‌ها:'
  },
  {
    icon: <PersonIcon sx={{ fontSize: 40, color: '#14B8A6' }} />,
    title: 'حقوق کاربران',
    content: [
      'به اطلاعات شخصی خود دسترسی داشته باشید',
      'اطلاعات نادرست را اصلاح کنید',
      'درخواست حذف اطلاعات خود را بدهید',
      'از دریافت پیام‌های تبلیغاتی خودداری کنید'
    ],
    description: 'شما به عنوان کاربر حق دارید:'
  },
  {
    icon: <RefreshIcon sx={{ fontSize: 40, color: '#6366F1' }} />,
    title: 'تغییرات در سیاست حفظ حریم خصوصی',
    content: [
      'تغییرات در سایت اطلاع‌رسانی می‌شود',
      'تاریخ آخرین به‌روزرسانی تغییر می‌کند',
      'در صورت تغییرات اساسی، به کاربران اطلاع‌رسانی می‌شود'
    ],
    description: 'انجمن ممکن است این سیاست را در آینده تغییر دهد. در صورت تغییر:'
  },
];

const Privacy: React.FC = () => {
  const muiTheme = useMuiTheme();

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
          title="حریم خصوصی"
          description="سیاست حفظ حریم خصوصی انجمن علمی مهندسی کامپیوتر دانشگاه صنعتی قوچان"
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
            { label: 'حریم خصوصی', href: '/privacy' },
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
                  حریم خصوصی
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
                  سیاست حفظ حریم خصوصی انجمن علمی مهندسی کامپیوتر
                </Typography>
              </Box>
            </motion.div>
          </Container>
        </Box>

        {/* Privacy Sections */}
        <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
          <Grid container spacing={4}>
              {sections.map((section, idx) => (
              <Grid item xs={12} md={6} key={idx}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                >
                  <Card
                    sx={theme => ({
                      height: '100%',
                      p: 4,
                      borderRadius: 3,
                      transition: 'all 0.3s ease',
                      borderTop: `4px solid ${section.icon.props.sx.color}`,
                      ...(theme.palette.mode === 'dark' && {
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(173, 216, 230, 0.3)',
                        boxShadow: '0 0 15px rgba(173, 216, 230, 0.4)',
                      }),
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: `0 20px 40px ${alpha(section.icon.props.sx.color, 0.2)}`,
                      },
                    })}
                  >
                    <CardContent>
                      <Box sx={{ textAlign: 'center', mb: 3 }}>
                  {section.icon}
                        <Typography variant="h5" component="h2" sx={{ fontWeight: 600, mt: 2, color: section.icon.props.sx.color }}>
                          {section.title}
                        </Typography>
                      </Box>
                      <Typography variant="body1" paragraph sx={{ mb: 2 }}>
                        {section.description}
                      </Typography>
                      <List dense>
                        {section.content.map((item, index) => (
                          <ListItem key={index} sx={{ py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <Box
                                sx={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: '50%',
                                  backgroundColor: section.icon.props.sx.color,
                                }}
                              />
                            </ListItemIcon>
                            <ListItemText primary={item} />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
              ))}
          </Grid>
        </Container>

        {/* Contact Box */}
        <Container maxWidth="md" sx={{ pb: { xs: 8, md: 12 } }}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
          >
            <Card
              sx={theme => ({
                p: 6,
                borderRadius: 3,
                textAlign: 'center',
                background: `linear-gradient(135deg, ${alpha(muiTheme.palette.primary.main, 0.1)} 0%, ${alpha(muiTheme.palette.secondary.main, 0.1)} 100%)`,
                borderTop: `4px solid ${muiTheme.palette.primary.main}`,
                ...(theme.palette.mode === 'dark' && {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(173, 216, 230, 0.3)',
                  boxShadow: '0 0 15px rgba(173, 216, 230, 0.4)',
                }),
              })}
            >
              <CardContent>
                <EmailIcon sx={{ fontSize: 60, color: 'primary.main', mb: 3 }} />
                <Typography variant="h4" component="h2" sx={{ fontWeight: 600, mb: 3, color: 'primary.main' }}>
                  تماس با ما
                </Typography>
                <Typography variant="body1" paragraph sx={{ mb: 3 }}>
                  در صورت سؤال یا نگرانی در مورد سیاست حفظ حریم خصوصی، می‌توانید با ما تماس بگیرید:
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText 
                      primary="ایمیل: privacy@computer-society.ir"
                      secondary="برای سؤالات مربوط به حریم خصوصی"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="تلفن: ۰۵۸-۳۲۲۵۴۰۰۰"
                      secondary="خط مستقیم انجمن"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="آدرس: قوچان، دانشگاه صنعتی قوچان، دانشکده مهندسی کامپیوتر"
                      secondary="دفتر انجمن علمی"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
            </motion.div>
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

export default Privacy; 