import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField, InputAdornment, Select, MenuItem, IconButton, Modal, Snackbar, Alert, CircularProgress, Pagination, Dialog, DialogTitle, DialogContent, DialogActions, SelectChangeEvent
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
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

interface Course {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  capacity: number;
  price: number;
  instructor: { id: string; name: string };
  createdAt: string;
}

interface Instructor {
  id: string;
  name: string;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string;
  order: number;
  duration: number;
  type: string;
  createdAt: string;
  updatedAt: string;
}

const AdminCourses: React.FC = () => {
  const { data: session } = useSession();
  const [courses, setCourses] = useState<Course[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [form, setForm] = useState({ title: '', description: '', startDate: '', endDate: '', capacity: 0, price: 0, instructorId: '' });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [lessonLoading, setLessonLoading] = useState(false);
  const [lessonForm, setLessonForm] = useState({ id: '', title: '', description: '', content: '', order: 1, duration: 0, type: '' });
  const [editLesson, setEditLesson] = useState<Lesson | null>(null);
  const [lessonFormOpen, setLessonFormOpen] = useState(false);
  const [lessonDeleteDialogOpen, setLessonDeleteDialogOpen] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState<Lesson | null>(null);

  // تابع دریافت دوره‌ها با صفحه‌بندی
  const fetchCourses = async (pageNum = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/courses?page=${pageNum}&limit=${limit}`);
      const data = await res.json();
      if (data.success) {
        setCourses(data.data.items);
        setTotal(data.data.pagination.total);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses(page);
    fetchInstructors();
  }, [page]);

  const fetchInstructors = async () => {
    try {
      const res = await fetch('/api/users?role=teacher');
      const data = await res.json();
      setInstructors((data.data || []).map((u: any) => ({ id: u.id, name: u.name })));
    } catch {}
  };

  const filteredCourses = courses.filter(c => c.title.includes(search) || c.description.includes(search));

  const handleOpenAdd = () => {
    setEditCourse(null);
    setForm({ title: '', description: '', startDate: '', endDate: '', capacity: 0, price: 0, instructorId: '' });
    setModalOpen(true);
  };
  const handleOpenEdit = (course: Course) => {
    setEditCourse(course);
    setForm({
      title: course.title,
      description: course.description,
      startDate: course.startDate?.slice(0, 10) || '',
      endDate: course.endDate?.slice(0, 10) || '',
      capacity: course.capacity,
      price: course.price,
      instructorId: course.instructor?.id || '',
    });
    setModalOpen(true);
  };
  const handleCloseModal = () => {
    setModalOpen(false);
    setEditCourse(null);
  };
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name as string]: value }));
  };
  const handleInstructorChange = (event: SelectChangeEvent<string>, child: React.ReactNode) => {
    setForm(f => ({ ...f, instructorId: String(event.target.value) }));
  };

  const validateCourseForm = (form: any) => {
    if (!form.title.trim()) return 'عنوان دوره الزامی است.';
    if (!form.description.trim()) return 'توضیحات دوره الزامی است.';
    if (!form.startDate || !form.endDate) return 'تاریخ شروع و پایان الزامی است.';
    if (new Date(form.endDate) <= new Date(form.startDate)) return 'تاریخ پایان باید بعد از تاریخ شروع باشد.';
    if (!form.capacity || isNaN(Number(form.capacity)) || Number(form.capacity) <= 0) return 'ظرفیت باید عددی مثبت باشد.';
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) return 'قیمت باید عددی مثبت باشد.';
    if (!form.instructorId) return 'مدرس دوره را انتخاب کنید.';
    return '';
  };

  const handleSubmit = async () => {
    const errorMsg = validateCourseForm(form);
    if (errorMsg) {
      setSnackbar({ open: true, message: errorMsg, severity: 'error' });
      return;
    }
    setLoading(true);
    try {
      let res;
      if (editCourse) {
        res = await fetch(`/api/courses/${editCourse.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, creatorId: session?.user?.id })
        });
      } else {
        res = await fetch('/api/courses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, creatorId: session?.user?.id })
        });
      }
      const data = await res.json();
      if (data.success) {
        setSnackbar({ open: true, message: editCourse ? 'دوره ویرایش شد' : 'دوره افزوده شد', severity: 'success' });
        fetchCourses(page);
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
    setCourseToDelete(courses.find(c => c.id === id) || null);
    setDeleteDialogOpen(true);
  };
  const confirmDelete = async () => {
    if (!courseToDelete) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/courses/${courseToDelete.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setSnackbar({ open: true, message: 'دوره حذف شد', severity: 'success' });
        fetchCourses(page);
      } else {
        setSnackbar({ open: true, message: data.error?.message || 'خطا', severity: 'error' });
      }
    } catch {
      setSnackbar({ open: true, message: 'خطا در ارتباط با سرور', severity: 'error' });
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setCourseToDelete(null);
    }
  };

  const handleOpenLessons = async (course: Course) => {
    setSelectedCourse(course);
    setLessonModalOpen(true);
    setLessonLoading(true);
    try {
      const res = await fetch(`/api/courses/${course.id}/lessons`);
      const data = await res.json();
      if (data.success) {
        setLessons(data.data.items || []);
      } else {
        setLessons([]);
      }
    } catch {
      setLessons([]);
    } finally {
      setLessonLoading(false);
    }
  };
  const handleCloseLessons = () => {
    setLessonModalOpen(false);
    setSelectedCourse(null);
    setLessons([]);
  };
  const handleOpenLessonForm = (lesson?: Lesson) => {
    if (lesson) {
      setEditLesson(lesson);
      setLessonForm({ ...lesson });
    } else {
      setEditLesson(null);
      setLessonForm({ id: '', title: '', description: '', content: '', order: lessons.length + 1, duration: 0, type: '' });
    }
    setLessonFormOpen(true);
  };
  const handleCloseLessonForm = () => {
    setLessonFormOpen(false);
    setEditLesson(null);
  };
  const handleLessonFormChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setLessonForm(f => ({ ...f, [name as string]: value }));
  };
  const validateLessonForm = (form: any) => {
    if (!form.title.trim()) return 'عنوان جلسه الزامی است.';
    if (!form.description.trim()) return 'توضیحات جلسه الزامی است.';
    if (!form.content.trim()) return 'محتوای جلسه الزامی است.';
    if (!form.type.trim()) return 'نوع جلسه الزامی است.';
    if (!form.order || isNaN(Number(form.order)) || Number(form.order) <= 0) return 'ترتیب باید عددی مثبت باشد.';
    if (!form.duration || isNaN(Number(form.duration)) || Number(form.duration) <= 0) return 'مدت زمان باید عددی مثبت باشد.';
    return '';
  };
  const handleLessonSubmit = async () => {
    const errorMsg = validateLessonForm(lessonForm);
    if (errorMsg) {
      setSnackbar({ open: true, message: errorMsg, severity: 'error' });
      return;
    }
    setLessonLoading(true);
    try {
      let res;
      if (editLesson) {
        res = await fetch(`/api/courses/${selectedCourse?.id}/lessons/${editLesson.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...lessonForm })
        });
      } else {
        res = await fetch(`/api/courses/${selectedCourse?.id}/lessons`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...lessonForm })
        });
      }
      const data = await res.json();
      if (data.success) {
        setSnackbar({ open: true, message: editLesson ? 'جلسه ویرایش شد' : 'جلسه افزوده شد', severity: 'success' });
        handleOpenLessons(selectedCourse!);
        setLessonFormOpen(false);
      } else {
        setSnackbar({ open: true, message: data.error?.message || 'خطا', severity: 'error' });
      }
    } catch {
      setSnackbar({ open: true, message: 'خطا در ارتباط با سرور', severity: 'error' });
    } finally {
      setLessonLoading(false);
    }
  };
  const handleLessonDelete = (lesson: Lesson) => {
    setLessonToDelete(lesson);
    setLessonDeleteDialogOpen(true);
  };
  const confirmLessonDelete = async () => {
    if (!lessonToDelete) return;
    setLessonLoading(true);
    try {
      const res = await fetch(`/api/courses/${selectedCourse?.id}/lessons/${lessonToDelete.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setSnackbar({ open: true, message: 'جلسه حذف شد', severity: 'success' });
        handleOpenLessons(selectedCourse!);
      } else {
        setSnackbar({ open: true, message: data.error?.message || 'خطا', severity: 'error' });
      }
    } catch {
      setSnackbar({ open: true, message: 'خطا در ارتباط با سرور', severity: 'error' });
    } finally {
      setLessonLoading(false);
      setLessonDeleteDialogOpen(false);
      setLessonToDelete(null);
    }
  };

  return (
    <Box sx={{ p: { xs: 1, md: 3 } }}>
      <Card sx={glassCardSx}>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { md: 'center' }, justifyContent: 'space-between', mb: 3, gap: 2 }}>
            <Typography variant="h5" sx={neonTextSx}>مدیریت دوره‌ها</Typography>
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
                افزودن دوره
              </Button>
            </Box>
          </Box>
          <TableContainer component={Paper} sx={{ bgcolor: 'transparent', boxShadow: 'none', borderRadius: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: accent, fontWeight: 700, fontSize: 16 }}>عنوان</TableCell>
                  <TableCell sx={{ color: accent, fontWeight: 700, fontSize: 16 }}>توضیحات</TableCell>
                  <TableCell sx={{ color: accent, fontWeight: 700, fontSize: 16 }}>استاد</TableCell>
                  <TableCell sx={{ color: accent, fontWeight: 700, fontSize: 16 }}>ظرفیت</TableCell>
                  <TableCell sx={{ color: accent, fontWeight: 700, fontSize: 16 }}>قیمت</TableCell>
                  <TableCell sx={{ color: accent, fontWeight: 700, fontSize: 16 }}>تاریخ شروع</TableCell>
                  <TableCell sx={{ color: accent, fontWeight: 700, fontSize: 16 }}>تاریخ پایان</TableCell>
                  <TableCell sx={{ color: accent, fontWeight: 700, fontSize: 16 }}>عملیات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCourses.map(course => (
                  <TableRow key={course.id} sx={{
                    bgcolor: 'rgba(24,26,32,0.7)',
                    borderBottom: `1.5px solid ${accent}22`,
                    '&:hover': { boxShadow: `0 0 24px 0 ${accent}33`, backdropFilter: 'blur(6px)' }
                  }}>
                    <TableCell sx={{ color: accent, fontWeight: 700 }}>{course.title}</TableCell>
                    <TableCell sx={{ color: accent, fontWeight: 700 }}>{course.description}</TableCell>
                    <TableCell sx={{ color: accent, fontWeight: 700 }}>{course.instructor?.name}</TableCell>
                    <TableCell sx={{ color: accent, fontWeight: 700 }}>{course.capacity}</TableCell>
                    <TableCell sx={{ color: accent, fontWeight: 700 }}>{course.price}</TableCell>
                    <TableCell sx={{ color: accent, fontWeight: 700 }}>{course.startDate?.slice(0, 10)}</TableCell>
                    <TableCell sx={{ color: accent, fontWeight: 700 }}>{course.endDate?.slice(0, 10)}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleOpenEdit(course)}><EditIcon sx={{ color: accent }} /></IconButton>
                      <IconButton onClick={() => handleDelete(course.id)}><DeleteIcon sx={{ color: '#ef4444' }} /></IconButton>
                      <IconButton onClick={() => handleOpenLessons(course)}><PlaylistAddCheckIcon sx={{ color: '#22d3ee' }} /></IconButton>
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
            <Typography variant="h6" sx={neonTextSx}>{editCourse ? 'ویرایش دوره' : 'افزودن دوره'}</Typography>
            <TextField name="title" label="عنوان" value={form.title} onChange={handleFormChange} fullWidth sx={{ input: { color: accent } }} />
            <TextField name="description" label="توضیحات" value={form.description} onChange={handleFormChange} fullWidth sx={{ input: { color: accent } }} />
            <Select name="instructorId" value={form.instructorId} onChange={handleInstructorChange} fullWidth sx={{ color: accent }} displayEmpty>
              <MenuItem value="" disabled>انتخاب استاد</MenuItem>
              {instructors.map(i => <MenuItem key={i.id} value={i.id}>{i.name}</MenuItem>)}
            </Select>
            <TextField name="capacity" label="ظرفیت" type="number" value={form.capacity} onChange={handleFormChange} fullWidth sx={{ input: { color: accent } }} />
            <TextField name="price" label="قیمت" type="number" value={form.price} onChange={handleFormChange} fullWidth sx={{ input: { color: accent } }} />
            <TextField name="startDate" label="تاریخ شروع" type="date" value={form.startDate} onChange={handleFormChange} fullWidth sx={{ input: { color: accent } }} InputLabelProps={{ shrink: true }} />
            <TextField name="endDate" label="تاریخ پایان" type="date" value={form.endDate} onChange={handleFormChange} fullWidth sx={{ input: { color: accent } }} InputLabelProps={{ shrink: true }} />
            <Button onClick={handleSubmit} disabled={loading} sx={{ mt: 2, fontWeight: 800, color: accent, border: '1.5px solid #22d3ee99', borderRadius: 2 }}>{loading ? <CircularProgress size={24} /> : 'ثبت'}</Button>
            <Button onClick={handleCloseModal} sx={{ color: '#fff', mt: 1 }}>انصراف</Button>
          </Box>
        </Modal>
        <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
          <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
        </Snackbar>
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle sx={{ color: accent, fontWeight: 800 }}>تایید حذف دوره</DialogTitle>
          <DialogContent>
            <Typography>آیا از حذف دوره <b>{courseToDelete?.title}</b> مطمئن هستید؟ این عملیات غیرقابل بازگشت است.</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)} color="inherit">انصراف</Button>
            <Button onClick={confirmDelete} color="error" variant="contained" disabled={loading}>{loading ? <CircularProgress size={20} /> : 'حذف'}</Button>
          </DialogActions>
        </Dialog>
        <Modal open={lessonModalOpen} onClose={handleCloseLessons}>
          <Box sx={{ ...glassCardSx, width: 600, mx: 'auto', mt: 8, p: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6" sx={neonTextSx}>مدیریت جلسات دوره: {selectedCourse?.title}</Typography>
            <Button onClick={() => handleOpenLessonForm()} sx={{ color: accent, border: '1.5px solid #22d3ee99', borderRadius: 2, mb: 2 }}>افزودن جلسه جدید</Button>
            {lessonLoading ? <CircularProgress /> : (
              <TableContainer component={Paper} sx={{ bgcolor: 'transparent', boxShadow: 'none', borderRadius: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: accent, fontWeight: 700 }}>عنوان</TableCell>
                      <TableCell sx={{ color: accent, fontWeight: 700 }}>توضیحات</TableCell>
                      <TableCell sx={{ color: accent, fontWeight: 700 }}>نوع</TableCell>
                      <TableCell sx={{ color: accent, fontWeight: 700 }}>مدت (دقیقه)</TableCell>
                      <TableCell sx={{ color: accent, fontWeight: 700 }}>ترتیب</TableCell>
                      <TableCell sx={{ color: accent, fontWeight: 700 }}>عملیات</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {lessons.map(lesson => (
                      <TableRow key={lesson.id}>
                        <TableCell sx={{ color: accent }}>{lesson.title}</TableCell>
                        <TableCell sx={{ color: accent }}>{lesson.description}</TableCell>
                        <TableCell sx={{ color: accent }}>{lesson.type}</TableCell>
                        <TableCell sx={{ color: accent }}>{lesson.duration}</TableCell>
                        <TableCell sx={{ color: accent }}>{lesson.order}</TableCell>
                        <TableCell>
                          <IconButton onClick={() => handleOpenLessonForm(lesson)}><EditIcon sx={{ color: accent }} /></IconButton>
                          <IconButton onClick={() => handleLessonDelete(lesson)}><DeleteIcon sx={{ color: '#ef4444' }} /></IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            <Button onClick={handleCloseLessons} sx={{ color: '#fff', mt: 2 }}>بستن</Button>
          </Box>
        </Modal>
        <Modal open={lessonFormOpen} onClose={handleCloseLessonForm}>
          <Box sx={{ ...glassCardSx, width: 400, mx: 'auto', mt: 10, p: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6" sx={neonTextSx}>{editLesson ? 'ویرایش جلسه' : 'افزودن جلسه'}</Typography>
            <TextField name="title" label="عنوان" value={lessonForm.title} onChange={handleLessonFormChange} fullWidth sx={{ input: { color: accent } }} />
            <TextField name="description" label="توضیحات" value={lessonForm.description} onChange={handleLessonFormChange} fullWidth sx={{ input: { color: accent } }} />
            <TextField name="content" label="محتوا" value={lessonForm.content} onChange={handleLessonFormChange} fullWidth multiline rows={3} sx={{ input: { color: accent } }} />
            <TextField name="type" label="نوع جلسه (مثلاً ویدیو، متن و ...)" value={lessonForm.type} onChange={handleLessonFormChange} fullWidth sx={{ input: { color: accent } }} />
            <TextField name="order" label="ترتیب" type="number" value={lessonForm.order} onChange={handleLessonFormChange} fullWidth sx={{ input: { color: accent } }} />
            <TextField name="duration" label="مدت (دقیقه)" type="number" value={lessonForm.duration} onChange={handleLessonFormChange} fullWidth sx={{ input: { color: accent } }} />
            <Button onClick={handleLessonSubmit} disabled={lessonLoading} sx={{ mt: 2, fontWeight: 800, color: accent, border: '1.5px solid #22d3ee99', borderRadius: 2 }}>{lessonLoading ? <CircularProgress size={24} /> : 'ثبت'}</Button>
            <Button onClick={handleCloseLessonForm} sx={{ color: '#fff', mt: 1 }}>انصراف</Button>
          </Box>
        </Modal>
        <Dialog open={lessonDeleteDialogOpen} onClose={() => setLessonDeleteDialogOpen(false)}>
          <DialogTitle sx={{ color: accent }}>حذف جلسه</DialogTitle>
          <DialogContent>آیا از حذف این جلسه مطمئن هستید؟</DialogContent>
          <DialogActions>
            <Button onClick={() => setLessonDeleteDialogOpen(false)} color="inherit">انصراف</Button>
            <Button onClick={confirmLessonDelete} color="error" disabled={lessonLoading}>{lessonLoading ? <CircularProgress size={20} /> : 'حذف'}</Button>
          </DialogActions>
        </Dialog>
      </Card>
    </Box>
  );
};

export default AdminCourses; 