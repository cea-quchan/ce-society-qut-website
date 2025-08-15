import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { 
  TextField, 
  Box, 
  Container, 
  Typography, 
  Button, 
  Paper, 
  Grid,
  Divider,
  IconButton,
  InputAdornment,
  useTheme,
  alpha,
  Alert
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import SchoolIcon from '@mui/icons-material/School';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Validation schema
const registerSchema = z.object({
  name: z.string()
    .min(2, 'نام باید حداقل 2 کاراکتر باشد')
    .max(50, 'نام نمی‌تواند بیشتر از 50 کاراکتر باشد'),
  email: z.string().email('ایمیل نامعتبر است'),
  password: z.string()
    .min(8, 'رمز عبور باید حداقل 8 کاراکتر باشد')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'رمز عبور باید شامل حروف بزرگ، کوچک و اعداد باشد'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'رمز عبور و تکرار آن مطابقت ندارند',
  path: ['confirmPassword']
});

type RegisterFormData = z.infer<typeof registerSchema>;

const Register: React.FC = () => {
  const router = useRouter();
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);

    try {
      // Register user
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'خطا در ثبت نام');
      }

      // Sign in the user after successful registration
      const signInResult = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false
      });

      if (signInResult?.error) {
        throw new Error(signInResult.error);
      }

      toast.success('ثبت نام با موفقیت انجام شد');
      router.push('/dashboard');
    } catch (error) {
        toast.error(error instanceof Error ? error.message : 'خطا در ثبت نام');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <SchoolIcon sx={{ fontSize: 40 }} />,
      title: 'دسترسی به دوره‌ها',
      description: 'به تمام دوره‌های آموزشی دسترسی داشته باشید'
    },
    {
      icon: <PersonIcon sx={{ fontSize: 40 }} />,
      title: 'پروفایل شخصی',
      description: 'پروفایل شخصی خود را مدیریت کنید'
    },
    {
      icon: <HowToRegIcon sx={{ fontSize: 40 }} />,
      title: 'ثبت‌نام در رویدادها',
      description: 'در رویدادها و مسابقات شرکت کنید'
    }
  ];

  return (
    <>
      <Head>
        <title>ثبت نام - انجمن علمی مهندسی کامپیوتر</title>
        <meta name="description" content="ثبت نام در انجمن علمی مهندسی کامپیوتر دانشگاه صنعتی قوچان" />
        <meta name="keywords" content="ثبت نام, انجمن علمی, مهندسی کامپیوتر" />
      </Head>
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: theme.palette.mode === 'dark' ? '#000' : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)` }}>
        <Paper elevation={3} sx={{ p: 6, borderRadius: 3, maxWidth: 420, width: '100%', textAlign: 'center' }}>
          <HowToRegIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 2 }}>
            ثبت نام
          </Typography>
          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <TextField
              fullWidth
              label="نام و نام خانوادگی"
              {...register('name')}
              error={!!errors.name}
              helperText={errors.name?.message}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
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
              sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <TextField
              fullWidth
              label="تکرار رمز عبور"
              type={showConfirmPassword ? 'text' : 'password'}
              {...register('confirmPassword')}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                      {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ py: 1.5, borderRadius: 2, fontSize: '1.1rem', fontWeight: 600, mt: 2 }}
            >
              {loading ? 'در حال ثبت نام...' : 'ثبت نام'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </>
  );
};

export default Register; 