import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField, InputAdornment, Select, MenuItem, IconButton, Modal, Snackbar, Alert, CircularProgress, List, ListItem, ListItemText, ListItemSecondaryAction, Pagination, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import GroupIcon from '@mui/icons-material/Group';
import { useSession } from 'next-auth/react';

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

interface EventType {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  capacity: number;
  organizer: { id: string; name: string };
  participants: { id: string; userId: string; user: { name: string } }[];
  createdAt: string;
}

interface UserType {
  id: string;
  name: string;
}

const AdminEvents: React.FC = () => {
  const { data: session } = useSession();
  const [events, setEvents] = useState<EventType[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [editEvent, setEditEvent] = useState<EventType | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [form, setForm] = useState({ title: '', description: '', startDate: '', endDate: '', location: '', capacity: 0 });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<EventType | null>(null);

  // تابع دریافت رویدادها با صفحه‌بندی
  const fetchEvents = async (pageNum = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/events?page=${pageNum}&limit=${limit}`);
      const data = await res.json();
      if (data.success) {
        setEvents(data.data.events);
        setTotal(data.data.total);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents(page);
    fetchUsers();
  }, [page]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsers((data.data || []).map((u: any) => ({ id: u.id, name: u.name })));
    } catch {}
  };

  const filteredEvents = events.filter(e => e.title.includes(search) || e.description.includes(search));

  const handleOpenAdd = () => {
    setEditEvent(null);
    setForm({ title: '', description: '', startDate: '', endDate: '', location: '', capacity: 0 });
    setModalOpen(true);
  };
  const handleOpenEdit = (event: EventType) => {
    setEditEvent(event);
    setForm({
      title: event.title,
      description: event.description,
      startDate: event.startDate?.slice(0, 10) || '',
      endDate: event.endDate?.slice(0, 10) || '',
      location: event.location,
      capacity: event.capacity,
    });
    setModalOpen(true);
  };
  const handleCloseModal = () => {
    setModalOpen(false);
    setEditEvent(null);
  };
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name as string]: value }));
  };

  const validateEventForm = (form: any) => {
    if (!form.title.trim()) return 'عنوان رویداد الزامی است.';
    if (!form.description.trim()) return 'توضیحات رویداد الزامی است.';
    if (!form.startDate || !form.endDate) return 'تاریخ شروع و پایان الزامی است.';
    if (new Date(form.endDate) <= new Date(form.startDate)) return 'تاریخ پایان باید بعد از تاریخ شروع باشد.';
    if (!form.location.trim()) return 'مکان رویداد الزامی است.';
    if (!form.capacity || isNaN(Number(form.capacity)) || Number(form.capacity) <= 0) return 'ظرفیت باید عددی مثبت باشد.';
    return '';
  };

  const handleSubmit = async () => {
    const errorMsg = validateEventForm(form);
    if (errorMsg) {
      setSnackbar({ open: true, message: errorMsg, severity: 'error' });
      return;
    }
    setLoading(true);
    try {
      let res;
      if (editEvent) {
        res = await fetch(`/api/events/${editEvent.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, organizerId: session?.user?.id })
        });
      } else {
        res = await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, organizerId: session?.user?.id })
        });
      }
      const data = await res.json();
      if (data.success) {
        setSnackbar({ open: true, message: editEvent ? 'رویداد ویرایش شد' : 'رویداد افزوده شد', severity: 'success' });
        fetchEvents(page);
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
    setEventToDelete(events.find(e => e.id === id) || null);
    setDeleteDialogOpen(true);
  };
  const confirmDelete = async () => {
    if (!eventToDelete) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${eventToDelete.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setSnackbar({ open: true, message: 'رویداد حذف شد', severity: 'success' });
        fetchEvents(page);
      } else {
        setSnackbar({ open: true, message: data.error?.message || 'خطا', severity: 'error' });
      }
    } catch {
      setSnackbar({ open: true, message: 'خطا در ارتباط با سرور', severity: 'error' });
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setEventToDelete(null);
    }
  };
  // مدیریت شرکت‌کنندگان:
  const handleOpenParticipants = (event: EventType) => {
    setSelectedEvent(event);
    setParticipantsOpen(true);
  };
  const handleCloseParticipants = () => {
    setSelectedEvent(null);
    setParticipantsOpen(false);
  };
  const handleAddParticipant = async (userId: string) => {
    if (!selectedEvent) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${selectedEvent.id}/participants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      if (data.success) {
        setSnackbar({ open: true, message: 'شرکت‌کننده افزوده شد', severity: 'success' });
        fetchEvents(page);
      } else {
        setSnackbar({ open: true, message: data.error?.message || 'خطا', severity: 'error' });
      }
    } catch {
      setSnackbar({ open: true, message: 'خطا در ارتباط با سرور', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };
  const handleRemoveParticipant = async (participantId: string) => {
    if (!selectedEvent) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${selectedEvent.id}/participants/${participantId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setSnackbar({ open: true, message: 'شرکت‌کننده حذف شد', severity: 'success' });
        fetchEvents(page);
      } else {
        setSnackbar({ open: true, message: data.error?.message || 'خطا', severity: 'error' });
      }
    } catch {
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
            <Typography variant="h5" sx={neonTextSx}>مدیریت رویدادها و مسابقات</Typography>
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
                افزودن رویداد/مسابقه
              </Button>
            </Box>
          </Box>
          <TableContainer component={Paper} sx={{ bgcolor: 'transparent', boxShadow: 'none', borderRadius: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: accent, fontWeight: 700, fontSize: 16 }}>عنوان</TableCell>
                  <TableCell sx={{ color: accent, fontWeight: 700, fontSize: 16 }}>توضیحات</TableCell>
                  <TableCell sx={{ color: accent, fontWeight: 700, fontSize: 16 }}>استاد/برگزارکننده</TableCell>
                  <TableCell sx={{ color: accent, fontWeight: 700, fontSize: 16 }}>ظرفیت</TableCell>
                  <TableCell sx={{ color: accent, fontWeight: 700, fontSize: 16 }}>تاریخ شروع</TableCell>
                  <TableCell sx={{ color: accent, fontWeight: 700, fontSize: 16 }}>تاریخ پایان</TableCell>
                  <TableCell sx={{ color: accent, fontWeight: 700, fontSize: 16 }}>شرکت‌کنندگان</TableCell>
                  <TableCell sx={{ color: accent, fontWeight: 700, fontSize: 16 }}>عملیات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEvents.map(event => (
                  <TableRow key={event.id} sx={{
                    bgcolor: 'rgba(24,26,32,0.7)',
                    borderBottom: `1.5px solid ${accent}22`,
                    '&:hover': { boxShadow: `0 0 24px 0 ${accent}33`, backdropFilter: 'blur(6px)' }
                  }}>
                    <TableCell sx={{ color: accent, fontWeight: 700 }}>{event.title}</TableCell>
                    <TableCell sx={{ color: accent, fontWeight: 700 }}>{event.description}</TableCell>
                    <TableCell sx={{ color: accent, fontWeight: 700 }}>{event.organizer?.name}</TableCell>
                    <TableCell sx={{ color: accent, fontWeight: 700 }}>{event.capacity}</TableCell>
                    <TableCell sx={{ color: accent, fontWeight: 700 }}>{event.startDate?.slice(0, 10)}</TableCell>
                    <TableCell sx={{ color: accent, fontWeight: 700 }}>{event.endDate?.slice(0, 10)}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleOpenParticipants(event)}><GroupIcon sx={{ color: accent }} /></IconButton>
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleOpenEdit(event)}><EditIcon sx={{ color: accent }} /></IconButton>
                      <IconButton onClick={() => handleDelete(event.id)}><DeleteIcon sx={{ color: '#ef4444' }} /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Pagination
            count={Math.ceil(total / limit)}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
            sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}
          />
        </CardContent>
        <Modal open={modalOpen} onClose={handleCloseModal}>
          <Box sx={{ ...glassCardSx, width: 400, mx: 'auto', mt: 10, p: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6" sx={neonTextSx}>{editEvent ? 'ویرایش رویداد/مسابقه' : 'افزودن رویداد/مسابقه'}</Typography>
            <TextField name="title" label="عنوان" value={form.title} onChange={handleFormChange} fullWidth sx={{ input: { color: accent } }} />
            <TextField name="description" label="توضیحات" value={form.description} onChange={handleFormChange} fullWidth sx={{ input: { color: accent } }} />
            <TextField name="location" label="مکان" value={form.location} onChange={handleFormChange} fullWidth sx={{ input: { color: accent } }} />
            <TextField name="capacity" label="ظرفیت" type="number" value={form.capacity} onChange={handleFormChange} fullWidth sx={{ input: { color: accent } }} />
            <TextField name="startDate" label="تاریخ شروع" type="date" value={form.startDate} onChange={handleFormChange} fullWidth sx={{ input: { color: accent } }} InputLabelProps={{ shrink: true }} />
            <TextField name="endDate" label="تاریخ پایان" type="date" value={form.endDate} onChange={handleFormChange} fullWidth sx={{ input: { color: accent } }} InputLabelProps={{ shrink: true }} />
            <Button onClick={handleSubmit} disabled={loading} sx={{ mt: 2, fontWeight: 800, color: accent, border: '1.5px solid #22d3ee99', borderRadius: 2 }}>{loading ? <CircularProgress size={24} /> : 'ثبت'}</Button>
            <Button onClick={handleCloseModal} sx={{ color: '#fff', mt: 1 }}>انصراف</Button>
          </Box>
        </Modal>
        {/* Modal شرکت‌کنندگان */}
        <Modal open={participantsOpen} onClose={handleCloseParticipants}>
          <Box sx={{ ...glassCardSx, width: 400, mx: 'auto', mt: 10, p: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6" sx={neonTextSx}>شرکت‌کنندگان</Typography>
            <List>
              {selectedEvent?.participants?.map(p => (
                <ListItem key={p.id}>
                  <ListItemText primary={p.user?.name || p.userId} />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" onClick={() => handleRemoveParticipant(p.id)}><DeleteIcon sx={{ color: '#ef4444' }} /></IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
            <Select
              displayEmpty
              value=""
              onChange={e => handleAddParticipant(e.target.value as string)}
              sx={{ color: accent, mt: 2 }}
            >
              <MenuItem value="" disabled>افزودن شرکت‌کننده</MenuItem>
              {users.map(u => <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>)}
            </Select>
            <Button onClick={handleCloseParticipants} sx={{ color: '#fff', mt: 2 }}>بستن</Button>
          </Box>
        </Modal>
        <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
          <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
        </Snackbar>
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle sx={{ color: accent, fontWeight: 800 }}>تایید حذف رویداد</DialogTitle>
          <DialogContent>
            <Typography>آیا از حذف رویداد <b>{eventToDelete?.title}</b> مطمئن هستید؟ این عملیات غیرقابل بازگشت است.</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)} color="inherit">انصراف</Button>
            <Button onClick={confirmDelete} color="error" variant="contained" disabled={loading}>{loading ? <CircularProgress size={20} /> : 'حذف'}</Button>
          </DialogActions>
        </Dialog>
      </Card>
    </Box>
  );
};

export default AdminEvents; 