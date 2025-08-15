import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';
import { 
  TextField, 
  Button, 
  MenuItem, 
  Alert, 
  Snackbar,
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  useTheme as useMuiTheme,
} from '@mui/material';
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import SEO from '@/components/common/SEO';
import SchemaMarkup from '@/components/common/SchemaMarkup';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import nextI18NextConfig from '../../next-i18next.config.cjs';

interface FormData {
  name: string;
  studentId: string;
  email: string;
  phone: string;
  major: string;
  year: number;
  interests: string;
  experience: string;
}

const majors = [
  'مهندسی کامپیوتر - نرم‌افزار',
  'مهندسی کامپیوتر - سخت‌افزار',
  'مهندسی کامپیوتر - هوش مصنوعی',
  'مهندسی کامپیوتر - شبکه',
  'مهندسی کامپیوتر - امنیت'
];

const years = [1, 2, 3, 4, 5, 6, 7, 8];

const Join: React.FC = () => {
  const { theme } = useTheme();
  const muiTheme = useMuiTheme();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    studentId: '',
    email: '',
    phone: '',
    major: '',
    year: 1,
    interests: '',
    experience: ''
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: 'درخواست عضویت شما با موفقیت ثبت شد',
          severity: 'success'
        });
        setFormData({
          name: '',
          studentId: '',
          email: '',
          phone: '',
          major: '',
          year: 1,
          interests: '',
          experience: ''
        });
      } else {
        const error = await response.json();
        throw new Error(error.message || 'خطا در ثبت درخواست');
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'خطا در ثبت درخواست',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

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
          title="پیوستن به انجمن"
          description="فرم عضویت در انجمن علمی مهندسی کامپیوتر دانشگاه صنعتی قوچان"
        />
        <SchemaMarkup
          type="Organization"
          data={{
            name: 'انجمن علمی مهندسی کامپیوتر',
            url: process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com',
            logo: '/images/logo.png',
          }}
        />
        <Breadcrumbs items={[{ label: 'پیوستن به انجمن', href: '/join' }]} />

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
              background: 'radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%)',
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
                  پیوستن به انجمن
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
                  به جمع اعضای انجمن علمی مهندسی کامپیوتر بپیوندید
                </Typography>
              </Box>
            </motion.div>
          </Container>
        </Box>

        {/* Form Section */}
        <Container maxWidth="md" sx={{ py: { xs: 8, md: 12 } }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
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
              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="نام و نام خانوادگی"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="شماره دانشجویی"
                      name="studentId"
                      value={formData.studentId}
                      onChange={handleChange}
                      required
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="ایمیل"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="شماره تماس"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      select
                      label="رشته تحصیلی"
                      name="major"
                      value={formData.major}
                      onChange={handleChange}
                      required
                      variant="outlined"
                    >
                      {majors.map((major) => (
                        <MenuItem key={major} value={major}>
                          {major}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      select
                      label="مقطع تحصیلی"
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      required
                      variant="outlined"
                    >
                      {years.map((year) => (
                        <MenuItem key={year} value={year}>
                          {year}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="علایق و زمینه‌های مورد علاقه"
                      name="interests"
                      value={formData.interests}
                      onChange={handleChange}
                      multiline
                      rows={3}
                      variant="outlined"
                      helperText="زمینه‌های مورد علاقه خود را بنویسید (مثل برنامه‌نویسی، هوش مصنوعی، شبکه و...)"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="تجربیات قبلی"
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      multiline
                      rows={3}
                      variant="outlined"
                      helperText="تجربیات قبلی خود در زمینه‌های مختلف را بنویسید"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      size="large"
                      disabled={loading}
                      sx={{
                        mt: 2,
                        mb: 2,
                        py: 1.5,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        borderRadius: 2,
                        background: `linear-gradient(135deg, ${muiTheme.palette.primary.main} 0%, ${muiTheme.palette.secondary.main} 100%)`,
                        '&:hover': {
                          background: `linear-gradient(135deg, ${muiTheme.palette.primary.dark} 0%, ${muiTheme.palette.secondary.dark} 100%)`,
                        }
                      }}
                    >
                      {loading ? 'در حال ثبت...' : 'ثبت درخواست عضویت'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </motion.div>
        </Container>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
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

export default Join; 