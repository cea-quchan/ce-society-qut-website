import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField, InputAdornment, IconButton, Modal, Snackbar, Alert, CircularProgress, Select, MenuItem
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

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

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  user: { id: string; name: string };
  createdAt: string;
}

interface UserType {
  id: string;
  name: string;
}

const AdminMessages: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', type: 'info', userId: '' });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchNotifications();
    fetchUsers();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      setNotifications(data.notifications || data.data || []);
    } catch {
      setSnackbar({ open: true, message: 'خطا در دریافت لیست اعلان‌ها', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };
  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsers((data.data || []).map((u: UserType) => ({ id: u.id, name: u.name })));
    } catch {}
  };

  const filteredNotifications = notifications.filter(n => n.title.includes(search) || n.message.includes(search));

  const handleOpenAdd = () => {
    setForm({ title: '', message: '', type: 'info', userId: '' });
    setModalOpen(true);
  };
  const handleCloseModal = () => {
    setModalOpen(false);
  };
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name as string]: value }));
  };
  const handleTypeChange = (e: any) => {
    setForm(f => ({ ...f, type: e.target.value }));
  };
  const handleUserChange = (e: any) => {
    setForm(f => ({ ...f, userId: e.target.value }));
  };
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        setSnackbar({ open: true, message: 'اعلان ارسال شد', severity: 'success' });
        fetchNotifications();
        setModalOpen(false);
      } else {
        setSnackbar({ open: true, message: data.error?.message || 'خطا', severity: 'error' });
      }
    } catch (e) {
      setSnackbar({ open: true, message: 'خطا در ارتباط با سرور', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async (id: string) => {
    if (!window.confirm('آیا از حذف اعلان مطمئن هستید؟')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setSnackbar({ open: true, message: 'اعلان حذف شد', severity: 'success' });
        setNotifications(notifications => notifications.filter(n => n.id !== id));
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
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { md: 'center' }, justifyContent: 'space-between', mb: 3, gap: 2 }}>
            <Typography variant="h5" sx={neonTextSx}>پیام‌ها و اعلان‌ها</Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                variant="outlined"
                size="small"
                placeholder="جستجو..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                sx={{ bgcolor: 'rgba(24,26,32,0.7)', borderRadius: 2, input: { color: accent, fontWeight: 700 } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: accent }} />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                startIcon={<AddIcon />}
                onClick={handleOpenAdd}
                sx={{
                  px: 3,
                  py: 1,
                  fontWeight: 800,
                  fontSize: '1rem',
                  borderRadius: 3,
                  color: accent,
                  background: 'rgba(24,26,32,0.7)',
                  border: '1.5px solid #22d3ee99',
                  boxShadow: '0 0 24px 0 #22d3ee55',
                  textShadow: '0 0 8px #22d3ee, 0 0 2px #fff',
                  backdropFilter: 'blur(8px)',
                  transition: 'all 0.2s',
                  '&:hover': {
                    background: '#22d3ee',
                    color: '#181A20',
                    boxShadow: '0 0 32px 0 #22d3ee',
                    borderColor: '#22d3ee',
                  },
                }}
              >
                ارسال اعلان جدید
              </Button>
            </Box>
          </Box>
          <TableContainer component={Paper} sx={{ bgcolor: 'transparent', boxShadow: 'none', borderRadius: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: accent, fontWeight: 700, fontSize: 16 }}>عنوان</TableCell>
                  <TableCell sx={{ color: accent, fontWeight: 700, fontSize: 16 }}>متن پیام</TableCell>
                  <TableCell sx={{ color: accent, fontWeight: 700, fontSize: 16 }}>نوع</TableCell>
                  <TableCell sx={{ color: accent, fontWeight: 700, fontSize: 16 }}>گیرنده</TableCell>
                  <TableCell sx={{ color: accent, fontWeight: 700, fontSize: 16 }}>تاریخ</TableCell>
                  <TableCell sx={{ color: accent, fontWeight: 700, fontSize: 16 }}>عملیات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredNotifications.map(n => (
                  <TableRow key={n.id} sx={{
                    bgcolor: 'rgba(24,26,32,0.7)',
                    borderBottom: `1.5px solid ${accent}22`,
                    '&:hover': { boxShadow: `0 0 24px 0 ${accent}33`, backdropFilter: 'blur(6px)' }
                  }}>
                    <TableCell sx={{ color: accent, fontWeight: 700 }}>{n.title}</TableCell>
                    <TableCell sx={{ color: accent, fontWeight: 700 }}>{n.message}</TableCell>
                    <TableCell sx={{ color: accent, fontWeight: 700 }}>{n.type}</TableCell>
                    <TableCell sx={{ color: accent, fontWeight: 700 }}>{n.user?.name}</TableCell>
                    <TableCell sx={{ color: accent, fontWeight: 700 }}>{n.createdAt?.slice(0, 10)}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleDelete(n.id)}><DeleteIcon sx={{ color: '#ef4444' }} /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
        <Modal open={modalOpen} onClose={handleCloseModal}>
          <Box sx={{ ...glassCardSx, width: 400, mx: 'auto', mt: 10, p: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6" sx={neonTextSx}>ارسال اعلان جدید</Typography>
            <TextField name="title" label="عنوان" value={form.title} onChange={handleFormChange} fullWidth sx={{ input: { color: accent } }} />
            <TextField name="message" label="متن پیام" value={form.message} onChange={handleFormChange} fullWidth sx={{ input: { color: accent } }} />
            <Select name="type" value={form.type} onChange={handleTypeChange} fullWidth sx={{ color: accent }}>
              <MenuItem value="info">اطلاعیه</MenuItem>
              <MenuItem value="success">موفقیت</MenuItem>
              <MenuItem value="warning">هشدار</MenuItem>
              <MenuItem value="error">خطا</MenuItem>
            </Select>
            <Select name="userId" value={form.userId} onChange={handleUserChange} fullWidth sx={{ color: accent }} displayEmpty>
              <MenuItem value="" disabled>انتخاب گیرنده</MenuItem>
              {users.map(u => <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>)}
            </Select>
            <Button onClick={handleSubmit} disabled={loading} sx={{ mt: 2, fontWeight: 800, color: accent, border: '1.5px solid #22d3ee99', borderRadius: 2 }}>{loading ? <CircularProgress size={24} /> : 'ارسال'}</Button>
            <Button onClick={handleCloseModal} sx={{ color: '#fff', mt: 1 }}>انصراف</Button>
          </Box>
        </Modal>
        <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
          <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
        </Snackbar>
      </Card>
    </Box>
  );
};

export default AdminMessages; 