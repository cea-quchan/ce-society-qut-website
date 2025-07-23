import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, TextField, Button, Snackbar, Alert, CircularProgress
} from '@mui/material';

const accent = '#22d3ee';
const glassCardSx = {
  bgcolor: 'rgba(24,26,32,0.55)',
  border: '1.5px solid #22d3ee55',
  boxShadow: '0 0 32px 0 #22d3ee33',
  borderRadius: 4,
  p: 2,
  backdropFilter: 'blur(10px)',
  transition: 'box-shadow 0.2s',
  '&:hover': {
    boxShadow: '0 0 48px 0 #22d3ee99',
    borderColor: '#22d3ee',
  },
};
const neonTextSx = {
  color: accent,
  fontWeight: 900,
  textShadow: '0 0 12px #22d3ee, 0 0 2px #fff',
  letterSpacing: 1,
};

const AdminSettings: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', newPassword: '' });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/users/me');
      const data = await res.json();
      if (data.success && data.data) {
        setForm(f => ({ ...f, name: data.data.name, email: data.data.email }));
      }
    } catch {}
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password, newPassword: form.newPassword })
      });
      const data = await res.json();
      if (data.success) {
        setSnackbar({ open: true, message: 'اطلاعات با موفقیت به‌روزرسانی شد', severity: 'success' });
        setForm(f => ({ ...f, password: '', newPassword: '' }));
      } else {
        setSnackbar({ open: true, message: data.error?.message || 'خطا', severity: 'error' });
      }
    } catch (e) {
      setSnackbar({ open: true, message: 'خطا در ارتباط با سرور', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 1, md: 3 } }}>
      <Card sx={glassCardSx}>
        <CardContent>
          <Typography variant="h5" sx={neonTextSx} mb={3}>تنظیمات پنل ادمین</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 400 }}>
            <TextField name="name" label="نام" value={form.name} onChange={handleFormChange} fullWidth sx={{ input: { color: accent } }} />
            <TextField name="email" label="ایمیل" value={form.email} onChange={handleFormChange} fullWidth sx={{ input: { color: accent } }} />
            <TextField name="password" label="رمز عبور فعلی" type="password" value={form.password} onChange={handleFormChange} fullWidth sx={{ input: { color: accent } }} />
            <TextField name="newPassword" label="رمز عبور جدید" type="password" value={form.newPassword} onChange={handleFormChange} fullWidth sx={{ input: { color: accent } }} />
            <Button onClick={handleSubmit} disabled={loading} sx={{ fontWeight: 800, color: accent, border: '1.5px solid #22d3ee99', borderRadius: 2 }}>{loading ? <CircularProgress size={24} /> : 'ذخیره تغییرات'}</Button>
          </Box>
        </CardContent>
        <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
          <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
        </Snackbar>
      </Card>
    </Box>
  );
};

export default AdminSettings; 