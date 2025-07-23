import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, TextField, Button, Paper, CircularProgress, Alert } from '@mui/material';

const AdminHeroVideo: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/hero-video');
        const json = await res.json();
        if (json.success && json.data) {
          setVideoUrl(json.data.videoUrl || '');
          setDescription(json.data.description || '');
        }
      } catch {
        setError('خطا در دریافت اطلاعات ویدیو');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/hero-video', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl, description })
      });
      const json = await res.json();
      if (json.success) {
        setSuccess('اطلاعات با موفقیت ذخیره شد.');
      } else {
        setError(json.error?.message || 'خطا در ذخیره اطلاعات');
      }
    } catch {
      setError('خطا در ذخیره اطلاعات');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}><CircularProgress /></Box>;
  }

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight={700} mb={3} align="center">مدیریت ویدیوی صفحه اصلی</Typography>
        <form onSubmit={handleSave}>
          <TextField
            label="لینک ویدیوی آپارات (Embed)"
            value={videoUrl}
            onChange={e => setVideoUrl(e.target.value)}
            fullWidth
            required
            margin="normal"
            helperText="لینک embed آپارات را وارد کنید (مثال: https://www.aparat.com/video/video/embed/videohash/abcde/vt/frame)"
          />
          <TextField
            label="توضیح ویدیو"
            value={description}
            onChange={e => setDescription(e.target.value)}
            fullWidth
            required
            margin="normal"
            multiline
            minRows={2}
          />
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 3 }} disabled={saving}>
            {saving ? 'در حال ذخیره...' : 'ذخیره'}
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default AdminHeroVideo;
