import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Modal, Snackbar, Alert, CircularProgress, Grid, IconButton, TextField
} from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteIcon from '@mui/icons-material/Delete';
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided } from 'react-beautiful-dnd';

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

interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  createdAt: string;
  category?: string; // Added category to the interface
}

const AdminGallery: React.FC = () => {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<{ title: string; description: string; category: string; files: File[]; links: string[] }>({ title: '', description: '', category: '', files: [], links: [''] });
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [editItem, setEditItem] = useState<GalleryItem | null>(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', category: '' });
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [editImageLink, setEditImageLink] = useState<string>('');
  const [orderChanged, setOrderChanged] = useState(false);

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/gallery');
      const data = await res.json();
      if (data.success) setGallery(data.data.items || data.data || []);
      else setGallery([]);
    } catch {
      setGallery([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGallery(); }, []);

  const handleOpenModal = () => {
    setForm({ title: '', description: '', category: '', files: [], links: [''] });
    setImagePreviews([]);
    setModalOpen(true);
  };
  const handleCloseModal = () => {
    setModalOpen(false);
    setForm({ title: '', description: '', category: '', files: [], links: [''] });
    setImagePreviews([]);
  };
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };
  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileArr = Array.from(files);
      setForm(f => ({ ...f, files: fileArr }));
      // Generate previews
      Promise.all(fileArr.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = ev => resolve(ev.target?.result as string);
          reader.readAsDataURL(file);
        });
      })).then(setImagePreviews);
    }
  };
  const handleLinkChange = (idx: number, value: string) => {
    setForm(f => {
      const newLinks = [...f.links];
      newLinks[idx] = value;
      return { ...f, links: newLinks };
    });
  };
  const addLinkField = () => {
    setForm(f => ({ ...f, links: [...f.links, ''] }));
  };
  const removeLinkField = (idx: number) => {
    setForm(f => {
      const newLinks = f.links.filter((_, i) => i !== idx);
      return { ...f, links: newLinks };
    });
  };
  const validateForm = () => {
    if (!form.title.trim()) return 'عنوان عکس الزامی است.';
    if (!form.category.trim()) return 'دسته‌بندی الزامی است.';
    if (form.files.length === 0 && form.links.filter(l => l.trim()).length === 0) return 'حداقل یک عکس انتخاب یا لینک وارد کنید.';
    return '';
  };
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const errorMsg = validateForm();
    if (errorMsg) {
      setSnackbar({ open: true, message: errorMsg, severity: 'error' });
      return;
    }
    setUploading(true);
    try {
      // آماده‌سازی آرایه عکس‌ها (فایل و لینک)
      const fileDatas: string[] = await Promise.all(
        form.files.map(file => new Promise<string>(resolve => {
          const reader = new FileReader();
          reader.onload = ev => resolve(ev.target?.result as string);
          reader.readAsDataURL(file);
        }))
      );
      const allImages = [...fileDatas, ...form.links.filter(l => l.trim())];
      const res = await fetch('/api/gallery/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          category: form.category || 'عمومی',
          files: allImages
        }),
        credentials: 'include'
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error?.message || 'خطا');
      setSnackbar({ open: true, message: 'همه عکس‌ها با موفقیت افزوده شدند', severity: 'success' });
      fetchGallery();
      setModalOpen(false);
    } catch (err: any) {
      let msg = err.message || 'خطا';
      if (msg.includes('JPG') || msg.includes('PNG')) msg = 'فرمت عکس فقط باید JPG یا PNG باشد';
      if (msg.includes('۲ مگابایت') || msg.includes('2MB') || msg.includes('FILE_TOO_LARGE')) msg = 'حجم عکس نباید بیشتر از ۲ مگابایت باشد';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    } finally {
      setUploading(false);
    }
  };
  const handleDelete = async (id: string) => {
    if (!window.confirm('آیا از حذف این عکس مطمئن هستید؟')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/gallery/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setSnackbar({ open: true, message: 'عکس حذف شد', severity: 'success' });
        fetchGallery();
      } else {
        setSnackbar({ open: true, message: data.error?.message || 'خطا', severity: 'error' });
      }
    } catch {
      setSnackbar({ open: true, message: 'خطا در ارتباط با سرور', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };
  const handleOpenEdit = (item: GalleryItem) => {
    setEditItem(item);
    setEditForm({ title: item.title, description: item.description || '', category: item.category || '' });
    setEditImageFile(null);
    setEditImagePreview(null);
    setEditImageLink('');
    setModalOpen(false);
  };
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm(f => ({ ...f, [name]: value }));
  };
  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setEditImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => setEditImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setEditImagePreview(null);
    }
  };
  const handleEditImageLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditImageLink(e.target.value);
    setEditImagePreview(e.target.value || null);
    setEditImageFile(null);
  };
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;
    setUploading(true);
    try {
      let imageData = null;
      if (editImageFile) {
        imageData = await new Promise<string>(resolve => {
          const reader = new FileReader();
          reader.onload = ev => resolve(ev.target?.result as string);
          reader.readAsDataURL(editImageFile);
        });
      } else if (editImageLink.trim()) {
        imageData = editImageLink.trim();
      }
      const res = await fetch(`/api/gallery/${editItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editForm, image: imageData }),
        credentials: 'include'
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error?.message || 'خطا');
      setSnackbar({ open: true, message: 'عکس با موفقیت ویرایش شد', severity: 'success' });
      fetchGallery();
      setEditItem(null);
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'خطا', severity: 'error' });
    } finally {
      setUploading(false);
    }
  };
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const reordered = Array.from(gallery);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setGallery(reordered);
    setOrderChanged(true);
  };
  const handleSaveOrder = async () => {
    setLoading(true);
    try {
      const orderPayload = gallery.map((item, idx) => ({ id: item.id, order: idx }));
      const res = await fetch('/api/gallery/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: orderPayload }),
        credentials: 'include'
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error?.message || 'خطا');
      setSnackbar({ open: true, message: 'ترتیب عکس‌ها ذخیره شد', severity: 'success' });
      setOrderChanged(false);
      fetchGallery();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'خطا', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 1, md: 3 } }}>
      <Card sx={glassCardSx}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h5" sx={neonTextSx}>مدیریت گالری تصاویر</Typography>
            <Button startIcon={<AddPhotoAlternateIcon />} onClick={handleOpenModal} sx={{ color: accent, border: '1.5px solid #22d3ee99', borderRadius: 2 }}>افزودن عکس جدید</Button>
          </Box>
          {loading ? <CircularProgress /> : (
            <DragDropContext onDragEnd={(result: DropResult) => {
              if (!result.destination) return;
              const reordered = Array.from(gallery);
              const [removed] = reordered.splice(result.source.index, 1);
              reordered.splice(result.destination.index, 0, removed);
              setGallery(reordered);
              setOrderChanged(true);
            }}>
              <Droppable droppableId="gallery-droppable">
                {(provided: DroppableProvided) => (
                  <Grid container spacing={2} ref={provided.innerRef} {...provided.droppableProps}>
                    {gallery.map((item, idx) => (
                      <Draggable key={item.id} draggableId={item.id} index={idx}>
                        {(provided: DraggableProvided) => (
                          <Grid item xs={12} sm={6} md={4} lg={3} ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                            <Card sx={{ ...glassCardSx, p: 1, position: 'relative' }}>
                              <Box sx={{ position: 'absolute', top: 8, right: 8, bgcolor: '#22d3ee', color: '#fff', px: 1.5, py: 0.5, borderRadius: 2, fontWeight: 700, fontSize: 14, zIndex: 2 }}>
                                {idx + 1}
                              </Box>
                              <img src={item.imageUrl} alt={item.title} style={{ width: '100%', borderRadius: 8, objectFit: 'cover', maxHeight: 220 }} />
                              <Typography variant="subtitle1" sx={{ color: accent, fontWeight: 700, mt: 1 }}>{item.title}</Typography>
                              {item.description && <Typography variant="body2" sx={{ color: '#fff', opacity: 0.8 }}>{item.description}</Typography>}
                              {item.category && <Typography variant="caption" sx={{ color: accent, fontWeight: 600, mt: 0.5, display: 'block' }}>دسته‌بندی: {item.category}</Typography>}
                              <IconButton onClick={() => handleDelete(item.id)} sx={{ position: 'absolute', top: 8, left: 8, color: '#ef4444', bgcolor: '#fff2', '&:hover': { bgcolor: '#fff4' } }}><DeleteIcon /></IconButton>
                              <IconButton onClick={() => handleOpenEdit(item)} sx={{ position: 'absolute', top: 8, right: 8, color: accent, bgcolor: '#fff2', '&:hover': { bgcolor: '#fff4' } }}><AddPhotoAlternateIcon /></IconButton>
                            </Card>
                          </Grid>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </Grid>
                )}
              </Droppable>
            </DragDropContext>
          )}
          {orderChanged && (
            <Button onClick={handleSaveOrder} sx={{ mt: 2, color: accent, border: '1.5px solid #22d3ee99', borderRadius: 2, fontWeight: 800 }}>
              ذخیره ترتیب
            </Button>
          )}
          {/* در بالای گالری، راهنمای کوتاه: */}
          <Box sx={{ mb: 2, color: accent, fontWeight: 700, fontSize: 15 }}>
            برای تغییر ترتیب عکس‌ها، کارت‌ها را بکشید و رها کنید (Drag & Drop) و سپس روی «ذخیره ترتیب» کلیک کنید.
          </Box>
        </CardContent>
      </Card>
      <Modal open={modalOpen} onClose={handleCloseModal}>
        <Box sx={{ ...glassCardSx, width: 400, mx: 'auto', mt: 10, p: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <form onSubmit={handleSubmit} autoComplete="off">
            <Typography variant="h6" sx={neonTextSx}>افزودن عکس جدید</Typography>
            <TextField name="title" label="عنوان" value={form.title} onChange={handleFormChange} fullWidth sx={{ input: { color: accent } }} />
            <TextField name="description" label="توضیحات (اختیاری)" value={form.description} onChange={handleFormChange} fullWidth sx={{ input: { color: accent } }} />
            <TextField name="category" label="دسته‌بندی (مثلاً طبیعت، رویداد، ... )" value={form.category} onChange={handleFormChange} fullWidth sx={{ input: { color: accent } }} />
            <Button variant="contained" component="label" sx={{ color: accent, border: '1.5px solid #22d3ee99', borderRadius: 2, bgcolor: 'transparent', '&:hover': { bgcolor: '#22d3ee22' } }}>
              انتخاب چند عکس
              <input type="file" accept="image/*" hidden multiple onChange={handleFilesChange} />
            </Button>
            {imagePreviews.length > 0 && imagePreviews.map((src, idx) => (
              <img key={idx} src={src} alt={`پیش‌نمایش ${idx+1}`} style={{ width: '100%', borderRadius: 8, marginTop: 8, objectFit: 'cover', maxHeight: 120 }} />
            ))}
            <Typography sx={{ color: accent, mt: 1, fontWeight: 700 }}>یا لینک عکس اینترنتی:</Typography>
            {form.links.map((link, idx) => (
              <Box key={idx} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField value={link} onChange={e => handleLinkChange(idx, e.target.value)} placeholder="https://..." fullWidth sx={{ input: { color: accent } }} />
                {form.links.length > 1 && <Button type="button" onClick={() => removeLinkField(idx)} sx={{ color: '#ef4444' }}>حذف</Button>}
              </Box>
            ))}
            <Button type="button" onClick={addLinkField} sx={{ color: accent, mt: 1 }}>افزودن لینک دیگر</Button>
            <Button type="submit" disabled={uploading} sx={{ mt: 2, fontWeight: 800, color: accent, border: '1.5px solid #22d3ee99', borderRadius: 2 }}>{uploading ? <CircularProgress size={24} /> : 'ثبت همه عکس‌ها'}</Button>
            <Button type="button" onClick={handleCloseModal} sx={{ color: '#fff', mt: 1 }}>انصراف</Button>
          </form>
        </Box>
      </Modal>
      <Modal open={!!editItem} onClose={() => setEditItem(null)}>
        <Box sx={{ ...glassCardSx, width: 400, mx: 'auto', mt: 10, p: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <form onSubmit={handleEditSubmit} autoComplete="off">
            <Typography variant="h6" sx={neonTextSx}>ویرایش عکس</Typography>
            <TextField name="title" label="عنوان" value={editForm.title} onChange={handleEditFormChange} fullWidth sx={{ input: { color: accent } }} />
            <TextField name="description" label="توضیحات (اختیاری)" value={editForm.description} onChange={handleEditFormChange} fullWidth sx={{ input: { color: accent } }} />
            <TextField name="category" label="دسته‌بندی" value={editForm.category} onChange={handleEditFormChange} fullWidth sx={{ input: { color: accent } }} />
            <Button variant="contained" component="label" sx={{ color: accent, border: '1.5px solid #22d3ee99', borderRadius: 2, bgcolor: 'transparent', '&:hover': { bgcolor: '#22d3ee22' } }}>
              انتخاب عکس جدید
              <input type="file" accept="image/*" hidden onChange={handleEditFileChange} />
            </Button>
            <TextField value={editImageLink} onChange={handleEditImageLinkChange} placeholder="یا لینک عکس جدید (https://...)" fullWidth sx={{ input: { color: accent }, mt: 1 }} />
            {editImagePreview && (
              <img src={editImagePreview} alt="پیش‌نمایش جدید" style={{ width: '100%', borderRadius: 8, marginTop: 8, objectFit: 'cover', maxHeight: 120 }} />
            )}
            <Button type="submit" disabled={uploading} sx={{ mt: 2, fontWeight: 800, color: accent, border: '1.5px solid #22d3ee99', borderRadius: 2 }}>{uploading ? <CircularProgress size={24} /> : 'ذخیره تغییرات'}</Button>
            <Button type="button" onClick={() => setEditItem(null)} sx={{ color: '#fff', mt: 1 }}>انصراف</Button>
          </form>
        </Box>
      </Modal>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminGallery; 