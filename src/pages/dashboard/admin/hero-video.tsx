import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, TextField, Button, Paper, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, MenuItem, IconButton, Grid } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { motion, AnimatePresence } from 'framer-motion';

const PLATFORMS = [
  { value: 'aparat', label: 'آپارات' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'faradars', label: 'فرادرس' },
  { value: 'maktabkhooneh', label: 'مکتب‌خونه' },
  { value: 'twitch', label: 'Twitch' },
  { value: 'direct', label: 'لینک مستقیم' },
];

const emptyVideo = { videoUrl: '', description: '', platform: 'aparat', order: 0 };

const AdminHeroVideo: React.FC = () => {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [newVideo, setNewVideo] = useState<any>({ ...emptyVideo });

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/hero-video');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setVideos(json.data);
      }
    } catch {
      setError('خطا در دریافت لیست ویدیوها');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (success || error) {
      setShowAlert(true);
      const timer = setTimeout(() => setShowAlert(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/hero-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVideo)
      });
      const json = await res.json();
      if (json.success) {
        setSuccess('ویدیو با موفقیت اضافه شد.');
        setNewVideo({ ...emptyVideo });
        fetchVideos();
      } else {
        setError(json.error?.message || 'خطا در افزودن ویدیو');
      }
    } catch {
      setError('خطا در افزودن ویدیو');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (id: string, data: any) => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/hero-video', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data })
      });
      const json = await res.json();
      if (json.success) {
        setSuccess('ویرایش با موفقیت انجام شد.');
        fetchVideos();
      } else {
        setError(json.error?.message || 'خطا در ویرایش ویدیو');
      }
    } catch {
      setError('خطا در ویرایش ویدیو');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/hero-video', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deleteId })
      });
      const json = await res.json();
      if (json.success) {
        setSuccess('ویدیو با موفقیت حذف شد.');
        setDeleteId(null);
        setShowDeleteDialog(false);
        fetchVideos();
      } else {
        setError(json.error?.message || 'خطا در حذف ویدیو');
      }
    } catch {
      setError('خطا در حذف ویدیو');
    } finally {
      setDeleting(false);
    }
  };

  const handleOrderChange = async (id: string, direction: 'up' | 'down') => {
    const idx = videos.findIndex(v => v.id === id);
    if (idx < 0) return;
    const newOrder = [...videos];
    if (direction === 'up' && idx > 0) {
      [newOrder[idx], newOrder[idx - 1]] = [newOrder[idx - 1], newOrder[idx]];
    } else if (direction === 'down' && idx < newOrder.length - 1) {
      [newOrder[idx], newOrder[idx + 1]] = [newOrder[idx + 1], newOrder[idx]];
    } else {
      return;
    }
    // Update order in DB
    await Promise.all(newOrder.map((v, i) => handleEdit(v.id, { ...v, order: i }))); // update all
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight={700} mb={3} align="center">مدیریت ویدیوهای صفحه اصلی</Typography>
        <form onSubmit={handleAdd} style={{ marginBottom: 32 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                label="لینک ویدیو"
                value={newVideo.videoUrl}
                onChange={e => setNewVideo({ ...newVideo, videoUrl: e.target.value })}
                fullWidth
                required
                margin="normal"
                helperText="لینک ویدیو را وارد کنید (آپارات، یوتیوب، فرادرس و ...)"
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                select
                label="پلتفرم"
                value={newVideo.platform}
                onChange={e => setNewVideo({ ...newVideo, platform: e.target.value })}
                fullWidth
                required
                margin="normal"
              >
                {PLATFORMS.map(opt => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="توضیح ویدیو (اختیاری)"
                value={newVideo.description}
                onChange={e => setNewVideo({ ...newVideo, description: e.target.value })}
                fullWidth
                margin="normal"
                helperText="این توضیح در زیر ویدیو نمایش داده می‌شود"
              />
            </Grid>
            <Grid item xs={12} sm={1} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                disabled={saving}
                sx={{ mt: 1, width: '100%' }}
              >
                افزودن
              </Button>
            </Grid>
          </Grid>
        </form>
        <AnimatePresence>
          {showAlert && (success || error) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.4 }}
              style={{ marginTop: 16 }}
            >
              <Alert severity={success ? 'success' : 'error'} sx={{ mt: 2 }}>
                {success || error}
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            {videos.length === 0 ? (
              <Typography align="center" color="text.secondary" sx={{ mt: 4 }}>
                هیچ ویدیویی ثبت نشده است.
              </Typography>
            ) : (
              <Grid container spacing={2}>
                {videos.map((video, idx) => (
                  <Grid item xs={12} key={video.id}>
                    <Paper sx={{ p: 2, borderRadius: 2, mb: 1, display: 'flex', alignItems: 'center', gap: 2, boxShadow: '0 2px 12px #22d3ee22', position: 'relative' }}>
                      <Box sx={{ flex: 1 }}>
                        <TextField
                          label="لینک ویدیو"
                          value={video.videoUrl}
                          onChange={e => handleEdit(video.id, { ...video, videoUrl: e.target.value })}
                          fullWidth
                          margin="dense"
                        />
                        <TextField
                          select
                          label="پلتفرم"
                          value={video.platform}
                          onChange={e => handleEdit(video.id, { ...video, platform: e.target.value })}
                          fullWidth
                          margin="dense"
                        >
                          {PLATFORMS.map(opt => (
                            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                          ))}
                        </TextField>
                        <TextField
                          label="توضیح ویدیو"
                          value={video.description || ''}
                          onChange={e => handleEdit(video.id, { ...video, description: e.target.value })}
                          fullWidth
                          margin="dense"
                        />
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center', minWidth: 48 }}>
                        <IconButton onClick={() => handleOrderChange(video.id, 'up')} disabled={idx === 0} size="small"><ArrowUpwardIcon /></IconButton>
                        <IconButton onClick={() => handleOrderChange(video.id, 'down')} disabled={idx === videos.length - 1} size="small"><ArrowDownwardIcon /></IconButton>
                        <IconButton color="error" onClick={() => { setDeleteId(video.id); setShowDeleteDialog(true); }} size="small"><DeleteIcon /></IconButton>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}
        <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
          <DialogTitle>تأیید حذف ویدیو</DialogTitle>
          <DialogContent>
            <Typography>
              آیا مطمئن هستید که می‌خواهید این ویدیو را حذف کنید؟ این عمل قابل بازگشت نیست.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowDeleteDialog(false)} disabled={deleting}>انصراف</Button>
            <Button onClick={handleDelete} color="error" variant="contained" disabled={deleting} startIcon={deleting ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />} aria-label="تایید حذف ویدیو">
              {deleting ? '' : 'حذف'}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default AdminHeroVideo; 