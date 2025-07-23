import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Modal,
  Snackbar,
  Alert,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Checkbox,
  Grid,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Search,
  Add,
  Delete,
  Edit,
  Send,
  Notifications,
  CheckCircle,
  Warning,
  Error,
  Info,
  People,
} from '@mui/icons-material';

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
  read: boolean;
  createdAt: string;
  userId?: string;
  user?: { id: string; name: string; email: string };
}

interface UserType {
  id: string;
  name: string;
  email: string;
  role: string;
}

const AdminNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const [form, setForm] = useState({
    title: '',
    message: '',
    type: 'info',
    userId: '',
  });

  useEffect(() => {
    fetchNotifications();
    fetchUsers();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/notifications');
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
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      setUsers(data.users || data.data || []);
    } catch {}
  };

  const filteredNotifications = notifications.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) || 
                         n.message.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'all' || n.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleOpenAdd = () => {
    setForm({
      title: '',
      message: '',
      type: 'info',
      userId: '',
    });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
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
      const res = await fetch('/api/admin/notifications', {
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

  const handleBulkDelete = async () => {
    if (!window.confirm(`آیا از حذف ${selectedNotifications.length} اعلان مطمئن هستید؟`)) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedNotifications })
      });
      const data = await res.json();
      if (data.success) {
        setSnackbar({ open: true, message: 'اعلان‌ها حذف شدند', severity: 'success' });
        setSelectedNotifications([]);
        fetchNotifications();
      } else {
        setSnackbar({ open: true, message: data.error?.message || 'خطا', severity: 'error' });
      }
    } catch (e) {
      setSnackbar({ open: true, message: 'خطا در ارتباط با سرور', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkMarkAsRead = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedNotifications, action: 'markAsRead' })
      });
      const data = await res.json();
      if (data.success) {
        setSnackbar({ open: true, message: 'اعلان‌ها به‌روزرسانی شدند', severity: 'success' });
        setSelectedNotifications([]);
        fetchNotifications();
      } else {
        setSnackbar({ open: true, message: data.error?.message || 'خطا', severity: 'error' });
      }
    } catch (e) {
      setSnackbar({ open: true, message: 'خطا در ارتباط با سرور', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'info': return <Info sx={{ color: accent }} />;
      case 'success': return <CheckCircle sx={{ color: '#10b981' }} />;
      case 'warning': return <Warning sx={{ color: '#f59e0b' }} />;
      case 'error': return <Error sx={{ color: '#ef4444' }} />;
      default: return <Info sx={{ color: accent }} />;
    }
  };

  const getTypeChip = (type: string) => {
    const typeConfig = {
      info: { color: accent, label: 'اطلاعیه' },
      success: { color: '#10b981', label: 'موفقیت' },
      warning: { color: '#f59e0b', label: 'هشدار' },
      error: { color: '#ef4444', label: 'خطا' },
    };
    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.info;
    return <Chip label={config.label} size="small" sx={{ bgcolor: config.color, color: 'white' }} />;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'row-reverse', minHeight: '100vh', bgcolor: '#181A20' }}>
      <Box sx={{ flexGrow: 1, p: { xs: 2, md: 4 } }}>
        <Typography variant="h4" sx={{ ...neonTextSx, mb: 4 }}>
          مدیریت اعلان‌ها
        </Typography>

        {/* فیلترها و جستجو */}
        <Card sx={{ ...glassCardSx, mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="جستجو در اعلان‌ها..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ color: accent }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ input: { color: '#fff' } }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: accent }}>نوع</InputLabel>
                  <Select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    sx={{ color: accent }}
                  >
                    <MenuItem value="all">همه</MenuItem>
                    <MenuItem value="info">اطلاعیه</MenuItem>
                    <MenuItem value="success">موفقیت</MenuItem>
                    <MenuItem value="warning">هشدار</MenuItem>
                    <MenuItem value="error">خطا</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={handleOpenAdd}
                    sx={{ bgcolor: accent, color: '#181A20', '&:hover': { bgcolor: '#22d3eecc' } }}
                  >
                    اعلان جدید
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* عملیات گروهی */}
        {selectedNotifications.length > 0 && (
          <Card sx={{ ...glassCardSx, mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography sx={{ color: '#fff' }}>
                  {selectedNotifications.length} اعلان انتخاب شده
                </Typography>
                <Button
                  size="small"
                  startIcon={<CheckCircle />}
                  onClick={handleBulkMarkAsRead}
                  sx={{ color: '#10b981' }}
                >
                  علامت‌گذاری به عنوان خوانده شده
                </Button>
                <Button
                  size="small"
                  startIcon={<Delete />}
                  onClick={handleBulkDelete}
                  sx={{ color: '#ef4444' }}
                >
                  حذف گروهی
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* جدول اعلان‌ها */}
        <Card sx={glassCardSx}>
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'rgba(24,26,32,0.8)' }}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedNotifications.length === filteredNotifications.length && filteredNotifications.length > 0}
                        indeterminate={selectedNotifications.length > 0 && selectedNotifications.length < filteredNotifications.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedNotifications(filteredNotifications.map(n => n.id));
                          } else {
                            setSelectedNotifications([]);
                          }
                        }}
                        sx={{ color: accent }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: accent, fontWeight: 700 }}>عنوان</TableCell>
                    <TableCell sx={{ color: accent, fontWeight: 700 }}>نوع</TableCell>
                    <TableCell sx={{ color: accent, fontWeight: 700 }}>وضعیت</TableCell>
                    <TableCell sx={{ color: accent, fontWeight: 700 }}>گیرنده</TableCell>
                    <TableCell sx={{ color: accent, fontWeight: 700 }}>تاریخ</TableCell>
                    <TableCell sx={{ color: accent, fontWeight: 700 }}>عملیات</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredNotifications.map(n => (
                    <TableRow key={n.id} sx={{
                      bgcolor: 'rgba(24,26,32,0.7)',
                      borderBottom: `1.5px solid ${accent}22`,
                      '&:hover': { boxShadow: `0 0 24px 0 ${accent}33`, backdropFilter: 'blur(6px)' }
                    }}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedNotifications.includes(n.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedNotifications([...selectedNotifications, n.id]);
                            } else {
                              setSelectedNotifications(selectedNotifications.filter(id => id !== n.id));
                            }
                          }}
                          sx={{ color: accent }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 600 }}>{n.title}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getTypeIcon(n.type)}
                          {getTypeChip(n.type)}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={n.read ? 'خوانده شده' : 'نخوانده'} 
                          size="small" 
                          sx={{ 
                            bgcolor: n.read ? '#10b981' : '#f59e0b', 
                            color: 'white' 
                          }} 
                        />
                      </TableCell>
                      <TableCell sx={{ color: '#fff' }}>
                        {n.user?.name || 'نامشخص'}
                      </TableCell>
                      <TableCell sx={{ color: '#fff' }}>
                        {new Date(n.createdAt).toLocaleDateString('fa-IR')}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="ویرایش">
                            <IconButton size="small">
                              <Edit sx={{ color: accent }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="حذف">
                            <IconButton size="small">
                              <Delete sx={{ color: '#ef4444' }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* مودال اعلان جدید */}
        <Modal open={modalOpen} onClose={handleCloseModal}>
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', md: 500 },
            bgcolor: '#181A20',
            border: `2px solid ${accent}`,
            borderRadius: 4,
            p: 4,
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <Typography variant="h6" sx={neonTextSx} gutterBottom>
              ارسال اعلان جدید
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 3 }}>
              <TextField
                name="title"
                label="عنوان"
                value={form.title}
                onChange={handleFormChange}
                fullWidth
                sx={{ input: { color: accent } }}
              />

              <TextField
                name="message"
                label="متن پیام"
                value={form.message}
                onChange={handleFormChange}
                fullWidth
                multiline
                rows={4}
                sx={{ textarea: { color: accent } }}
              />

              <FormControl fullWidth>
                <InputLabel sx={{ color: accent }}>نوع اعلان</InputLabel>
                <Select
                  value={form.type}
                  onChange={handleTypeChange}
                  sx={{ color: accent }}
                >
                  <MenuItem value="info">اطلاعیه</MenuItem>
                  <MenuItem value="success">موفقیت</MenuItem>
                  <MenuItem value="warning">هشدار</MenuItem>
                  <MenuItem value="error">خطا</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel sx={{ color: accent }}>گیرنده</InputLabel>
                <Select
                  value={form.userId}
                  onChange={handleUserChange}
                  sx={{ color: accent }}
                  displayEmpty
                >
                  <MenuItem value="" disabled>انتخاب گیرنده</MenuItem>
                  {users.map(user => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <Send />}
                  sx={{
                    bgcolor: accent,
                    color: '#181A20',
                    '&:hover': { bgcolor: '#22d3eecc' }
                  }}
                >
                  ارسال
                </Button>
                <Button
                  onClick={handleCloseModal}
                  sx={{ color: '#fff' }}
                >
                  انصراف
                </Button>
              </Box>
            </Box>
          </Box>
        </Modal>

        <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
          <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default AdminNotifications; 