import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Head from 'next/head';
import { useTheme } from '@/hooks/useTheme';
import { 
  TextField, 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Button, 
  Paper, 
  Snackbar, 
  Alert,
  Card,
  CardContent,
  Stack,
  useTheme as useMuiTheme,
  alpha,
  Avatar,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SendIcon from '@mui/icons-material/Send';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import TelegramIcon from '@mui/icons-material/Telegram';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetServerSideProps } from 'next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AnimatedButton from '@/components/ui/AnimatedButton';
import nextI18NextConfig from '../../next-i18next.config.cjs';
import SEO from '@/components/common/SEO';
import SchemaMarkup from '@/components/common/SchemaMarkup';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { styled } from '@mui/material/styles';

const GlassCard = styled(Paper)(({ theme }) => ({
  background: 'rgba(24,26,32,0.7)',
  border: '1px solid rgba(255,255,255,0.06)',
  boxShadow: '0 8px 32px 0 rgba(0,0,0,0.37)',
  borderRadius: 20,
  color: '#f1f1f1',
  transition: 'all 0.2s',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    boxShadow: '0 12px 40px 0 rgba(16,185,129,0.18)',
    transform: 'translateY(-4px) scale(1.03)',
  },
}));

const contactSchema = z.object({
  name: z.string().min(2, 'نام باید حداقل 2 کاراکتر باشد'),
  email: z.string().email('ایمیل نامعتبر است'),
  subject: z.string().min(5, 'موضوع باید حداقل 5 کاراکتر باشد'),
  message: z.string().min(10, 'پیام باید حداقل 10 کاراکتر باشد'),
});

type ContactFormData = z.infer<typeof contactSchema>;

const Contact: React.FC = () => {
  const muiTheme = useMuiTheme();
  const { t } = useTranslation('common');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'خطا در ارسال پیام');
      }

      setSnackbar({
        open: true,
        message: 'پیام شما با موفقیت ارسال شد',
        severity: 'success',
      });
      reset();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'خطا در ارسال پیام',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: <LocationOnIcon sx={{ fontSize: 40 }} />,
      title: 'آدرس',
      content: 'قوچان، دانشگاه صنعتی قوچان، دانشکده مهندسی کامپیوتر',
      color: '#3B82F6',
    },
    {
      icon: <PhoneIcon sx={{ fontSize: 40 }} />,
      title: 'تلفن',
      content: '۰۵۸-۳۲۲۹۶۰۰۰',
      color: '#10B981',
    },
    {
      icon: <EmailIcon sx={{ fontSize: 40 }} />,
      title: 'ایمیل',
      content: 'info@qiet.ac.ir',
      color: '#F59E0B',
    },
    {
      icon: <AccessTimeIcon sx={{ fontSize: 40 }} />,
      title: 'ساعات کاری',
      content: 'شنبه تا چهارشنبه: ۸ صبح تا ۴ عصر',
      color: '#8B5CF6',
    },
  ];

  const socialLinks = [
    { icon: <WhatsAppIcon />, label: 'واتساپ', color: '#25D366', href: 'https://wa.me/989123456789' },
    { icon: <TelegramIcon />, label: 'تلگرام', color: '#0088CC', href: 'https://t.me/qiet_channel' },
    { icon: <InstagramIcon />, label: 'اینستاگرام', color: '#E4405F', href: 'https://instagram.com/qiet_official' },
    { icon: <LinkedInIcon />, label: 'لینکدین', color: '#0A66C2', href: 'https://linkedin.com/company/qiet' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <Box sx={{ bgcolor: '#000', minHeight: '100vh', width: '100%' }}>
      <SEO title="تماس با ما" description="ارتباط با انجمن علمی مهندسی کامپیوتر دانشگاه صنعتی قوچان" />
      <SchemaMarkup type="Organization" data={{ name: 'انجمن علمی مهندسی کامپیوتر', url: process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com', logo: '/images/logo.png' }} />
      <Container maxWidth="lg" sx={{ pt: 3, pb: 1 }}>
        <Breadcrumbs showHome items={[{ label: 'تماس با ما', href: '/contact' }]} />
      </Container>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h3" fontWeight={900} color="#22d3ee" align="center" mb={2} sx={{ letterSpacing: 1, textShadow: '0 0 16px #22d3ee99' }}>
          تماس با ما
        </Typography>
        <Typography variant="h6" color="text.secondary" align="center" mb={6}>
          برای ارتباط با انجمن علمی مهندسی کامپیوتر فرم زیر را پر کنید یا از اطلاعات تماس استفاده کنید.
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <GlassCard as="form" onSubmit={handleSubmit(onSubmit)} elevation={0}>
              <Typography variant="h5" fontWeight={800} color="#fff" mb={2}>
                فرم تماس
              </Typography>
              <TextField
                label="نام و نام خانوادگی"
                {...register('name')}
                error={!!errors.name}
                helperText={errors.name?.message}
                fullWidth
                required
                margin="normal"
                variant="outlined"
                sx={{ input: { color: '#fff' } }}
              />
              <TextField
                label="ایمیل"
                type="email"
                {...register('email')}
                error={!!errors.email}
                helperText={errors.email?.message}
                fullWidth
                required
                margin="normal"
                variant="outlined"
                sx={{ input: { color: '#fff' } }}
              />
              <TextField
                label="موضوع"
                {...register('subject')}
                error={!!errors.subject}
                helperText={errors.subject?.message}
                fullWidth
                required
                margin="normal"
                variant="outlined"
                sx={{ input: { color: '#fff' } }}
              />
              <TextField
                label="پیام"
                multiline
                rows={4}
                {...register('message')}
                error={!!errors.message}
                helperText={errors.message?.message}
                fullWidth
                required
                margin="normal"
                variant="outlined"
                sx={{ textarea: { color: '#fff' } }}
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 3, fontWeight: 700, borderRadius: 2, fontSize: '1.1rem', py: 1.5, background: 'linear-gradient(90deg, #10b981 0%, #22d3ee 100%)', color: '#fff', boxShadow: '0 2px 16px 0 rgba(16,185,129,0.18)' }}
                disabled={loading}
              >
                ارسال پیام
              </Button>
            </GlassCard>
          </Grid>
          <Grid item xs={12} md={6}>
            <GlassCard elevation={0} sx={{ height: '100%', justifyContent: 'center' }}>
              <Typography variant="h5" fontWeight={800} color="#fff" mb={2}>
                اطلاعات تماس
              </Typography>
              <Grid container spacing={3}>
                {contactInfo.map((info, idx) => (
                  <Grid item xs={12} key={idx}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: info.color, width: 48, height: 48 }}>{info.icon}</Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={700} color="#22d3ee">
                          {info.title}
                        </Typography>
                        <Typography variant="body2" color="rgba(255,255,255,0.7)">
                          {info.content}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </GlassCard>
          </Grid>
        </Grid>
        <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'fa', ['common'])),
    },
  };
};

export default Contact; 