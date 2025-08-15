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

const Login: React.FC<{ loginOpen: boolean }> = ({ loginOpen }) => {
  const muiTheme = useMuiTheme();
  if (!loginOpen) {
    return (
      <Box sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: muiTheme.palette.mode === 'dark'
          ? '#000'
          : `linear-gradient(135deg, ${alpha(muiTheme.palette.primary.main, 0.1)} 0%, ${alpha(muiTheme.palette.secondary.main, 0.1)} 100%)`
      }}>
        <Paper elevation={3} sx={{ p: 6, borderRadius: 3, maxWidth: 420, width: '100%', textAlign: 'center' }}>
          <LoginIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 2 }}>
            ورود غیرفعال است
          </Typography>
          <Typography variant="body1" color="text.secondary">
            ورود کاربران جدید در این فصل غیرفعال شده است.<br />لطفاً در فصل بعدی مجدداً تلاش کنید.
          </Typography>
        </Paper>
      </Box>
    );
  }
  // --- Original login form below (disabled) ---
  // (the entire original return JSX here)
};

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/settings`);
  const settings = await res.json();
  return {
    props: {
      loginOpen: settings?.data?.loginOpen ?? false,
      ...(await serverSideTranslations(locale ?? 'fa', ['common'], nextI18NextConfig)),
    },
  };
};

export default Login; 