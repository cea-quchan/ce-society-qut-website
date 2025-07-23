import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Head from 'next/head';
import { useTheme } from '@/hooks/useTheme';
import { 
  TextField, 
  Button, 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Grid,
  IconButton,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  Divider,
  useTheme as useMuiTheme,
  alpha,
  Alert
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LoginIcon from '@mui/icons-material/Login';
import SecurityIcon from '@mui/icons-material/Security';
import SchoolIcon from '@mui/icons-material/School';
import EventIcon from '@mui/icons-material/Event';
import { useTranslation } from 'next-i18next';
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import nextI18NextConfig from '../../next-i18next.config.cjs';
import { signIn, getSession } from 'next-auth/react';
import GoogleIcon from '@mui/icons-material/Google';
import LinkedInIcon from '@mui/icons-material/LinkedIn';

const loginSchema = z.object({
  email: z.string().email('ایمیل نامعتبر است'),
  password: z.string().min(1, 'رمز عبور الزامی است'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const { theme } = useTheme();
  const muiTheme = useMuiTheme();
  const { t } = useTranslation('common');
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false
      });

      if (result?.error) {
        throw new Error('اطلاعات ورود نامعتبر است');
      }

      if (result?.ok) {
        // پس از ورود موفق، نقش را از session بگیرید
        const session = await getSession();
        if (session?.user?.role === 'ADMIN') {
          router.push('/dashboard/admin');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    {
      icon: <SchoolIcon sx={{ fontSize: 40 }} />,
      title: 'دسترسی به دوره‌ها',
      description: 'به تمام دوره‌های آموزشی دسترسی داشته باشید'
    },
    {
      icon: <EventIcon sx={{ fontSize: 40 }} />,
      title: 'شرکت در رویدادها',
      description: 'در رویدادها و مسابقات شرکت کنید'
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      title: 'امنیت بالا',
      description: 'اطلاعات شما با امنیت کامل محافظت می‌شود'
    }
  ];

  return (
    <>
      <Head>
        <title>ورود - انجمن علمی مهندسی کامپیوتر</title>
        <meta name="description" content="ورود به انجمن علمی مهندسی کامپیوتر دانشگاه صنعتی قوچان" />
        <meta name="keywords" content="ورود, انجمن علمی, مهندسی کامپیوتر" />
      </Head>

      <Box
        sx={{
          minHeight: '100vh',
          background: muiTheme.palette.mode === 'dark' 
              ? '#000' 
              : `linear-gradient(135deg, ${alpha(muiTheme.palette.primary.main, 0.1)} 0%, ${alpha(muiTheme.palette.secondary.main, 0.1)} 100%)`,
          py: { xs: 4, md: 8 },
          px: 2
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            {/* Login Form */}
            <Grid item xs={12} md={6}>
        <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 4, md: 6 },
                    borderRadius: 3,
                    ...(muiTheme.palette.mode === 'dark'
                    ? {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(173, 216, 230, 0.3)',
                        boxShadow: '0 0 15px rgba(173, 216, 230, 0.4)',
                      }
                    : {
                        background: `linear-gradient(135deg, ${alpha(muiTheme.palette.background.paper, 0.9)} 0%, ${alpha(muiTheme.palette.background.paper, 0.7)} 100%)`,
                        backdropFilter: 'blur(10px)',
                        border: `1px solid ${alpha(muiTheme.palette.divider, 0.1)}`,
                      }),
                  }}
                >
                  <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <LoginIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
                      ورود به حساب کاربری
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      برای دسترسی به پنل کاربری وارد شوید
                    </Typography>
                  </Box>

                  <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
              <TextField
                fullWidth
                      label="ایمیل"
                type="email"
                      {...register('email')}
                      error={!!errors.email}
                      helperText={errors.email?.message}
                variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        mb: 3,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': {
                            borderColor: muiTheme.palette.primary.main,
                          },
                        },
                      }}
              />

              <TextField
                fullWidth
                      label="رمز عبور"
                      type={showPassword ? 'text' : 'password'}
                      {...register('password')}
                      error={!!errors.password}
                      helperText={errors.password?.message}
                variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        mb: 3,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': {
                            borderColor: muiTheme.palette.primary.main,
                          },
                        },
                      }}
                    />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            color="primary"
                          />
                        }
                        label="مرا به خاطر بسپار"
                      />
                      <Link 
                        href="/forgot-password" 
                        style={{ 
                          color: muiTheme.palette.primary.main, 
                          textDecoration: 'none',
                          fontWeight: 600
                        }}
                      >
                        فراموشی رمز عبور؟
                </Link>
                    </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                      disabled={loading}
                      startIcon={<LoginIcon />}
                      sx={{
                        py: 1.5,
                        borderRadius: 2,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        background: `linear-gradient(135deg, ${muiTheme.palette.primary.main} 0%, ${muiTheme.palette.secondary.main} 100%)`,
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: muiTheme.shadows[8],
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {loading ? 'در حال ورود...' : 'ورود'}
                    </Button>

                    <Divider sx={{ my: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        یا
                      </Typography>
                    </Divider>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                      <Button
                        variant="outlined"
                        startIcon={<GoogleIcon />}
                        onClick={() => signIn('google')}
                        sx={{ borderRadius: 2, fontWeight: 700, color: '#ea4335', borderColor: '#ea4335', '&:hover': { background: '#ea433511', borderColor: '#ea4335' } }}
                      >
                        ورود با گوگل
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<LinkedInIcon />}
                        onClick={() => signIn('linkedin')}
                        sx={{ borderRadius: 2, fontWeight: 700, color: '#0077b5', borderColor: '#0077b5', '&:hover': { background: '#0077b511', borderColor: '#0077b5' } }}
                      >
                        ورود با لینکدین
                      </Button>
                    </Box>

                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        حساب کاربری ندارید؟{' '}
                        <Link 
                          href="/register" 
                          style={{ 
                            color: muiTheme.palette.primary.main, 
                            textDecoration: 'none',
                            fontWeight: 600
                          }}
                        >
                          ثبت نام کنید
                        </Link>
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </motion.div>
            </Grid>

            {/* Benefits Section */}
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Box sx={{ pl: { md: 4 } }}>
                  <Typography variant="h3" component="h2" sx={{ fontWeight: 700, mb: 3, textAlign: { xs: 'center', md: 'left' } }}>
                    مزایای ورود
                  </Typography>
                  
                  <Box sx={{ space: 3 }}>
                    {benefits.map((benefit, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                      >
                        <Paper
                          elevation={0}
                          sx={{
                            p: 3,
                            mb: 3,
                            borderRadius: 2,
                            background: `linear-gradient(135deg, ${alpha(muiTheme.palette.background.paper, 0.8)} 0%, ${alpha(muiTheme.palette.background.paper, 0.6)} 100%)`,
                            backdropFilter: 'blur(10px)',
                            border: `1px solid ${alpha(muiTheme.palette.divider, 0.1)}`,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateX(8px)',
                              boxShadow: muiTheme.shadows[4],
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ color: 'primary.main' }}>
                              {benefit.icon}
                            </Box>
                            <Box>
                              <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 1 }}>
                                {benefit.title}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {benefit.description}
                              </Typography>
                            </Box>
                          </Box>
                        </Paper>
                      </motion.div>
                    ))}
                  </Box>

                  <Alert 
                    severity="info" 
                    sx={{ 
                      mt: 4, 
                      borderRadius: 2,
                      '& .MuiAlert-icon': {
                        fontSize: 28
                      }
                    }}
                  >
                    <Typography variant="body2">
                      با ورود به حساب کاربری، می‌توانید به تمام امکانات انجمن علمی دسترسی داشته باشید و تجربه بهتری داشته باشید.
                    </Typography>
                  </Alert>
                </Box>
        </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'fa', ['common'], nextI18NextConfig)),
    },
  };
};

export default Login; 