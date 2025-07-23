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
  IconButton,
  Chip,
  Snackbar,
  Alert,
  CircularProgress,
  Pagination,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextareaAutosize,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Article as ArticleIcon,
  Category as CategoryIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import AdvancedSearch, { SearchParams } from '@/components/admin/AdvancedSearch';
import SortingSystem from '@/components/admin/SortingSystem';
import ModalSystem from '@/components/admin/ModalSystem';
import { useModal } from '@/hooks/useModal';
import { TableSkeleton, LoadingOverlay } from '@/components/admin/LoadingStates';
import { ErrorDisplay, NetworkErrorHandler, ValidationErrorDisplay } from '@/components/admin/ErrorHandling';
import Breadcrumbs from '@/components/admin/Breadcrumbs';
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided } from 'react-beautiful-dnd';

const accent = '#22d3ee';

interface News {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
  category: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
  published: boolean;
  publishedAt?: string;
  summary?: string;
  images?: { url: string }[]; // Ensure images is always optional and type-safe
}

interface AdminNewsProps {
  news: News[];
}

const glassCardSx = {
  bgcolor: 'rgba(24,26,32,0.85)',
  border: '1.5px solid #22d3ee55',
  borderRadius: 4,
  boxShadow: '0 0 48px 0 #22d3ee55',
  backdropFilter: 'blur(16px)',
  color: '#fff',
};

const neonTextSx = {
  color: accent,
  fontWeight: 800,
  fontSize: '2rem',
  textShadow: '0 0 16px #22d3ee',
  letterSpacing: 1,
};

const AdminNews: React.FC<AdminNewsProps> = ({ news: initialNews }) => {
  const [news, setNews] = useState<News[]>(initialNews);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [currentSort, setCurrentSort] = useState<{ field: string; order: 'asc' | 'desc' } | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [filterStats, setFilterStats] = useState({
    categories: [
      { label: 'فناوری', value: 'technology', count: 0 },
      { label: 'رویدادها', value: 'events', count: 0 },
      { label: 'به‌روزرسانی‌ها', value: 'updates', count: 0 },
      { label: 'عمومی', value: 'general', count: 0 },
    ],
    statuses: [],
    types: [],
    roles: [],
  });

  // Modal system
  const { modalConfig, isOpen, closeModal, showConfirmation, showForm, openModal } = useModal();

  // ۱. State جدید برای عکس‌ها (در ابتدای کامپوننت)
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageLinks, setImageLinks] = useState<string[]>(['']);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [editingInitialImages, setEditingInitialImages] = useState<string[]>([]);

  // ۲. هندلر انتخاب فایل
  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileArr = Array.from(files);
      setImageFiles(fileArr);
      // Generate previews
      Promise.all(fileArr.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = ev => resolve(ev.target?.result as string);
          reader.readAsDataURL(file);
        });
      })).then(setImagePreviews);
    } else {
      setImageFiles([]);
      setImagePreviews([]);
    }
  };
  // ۳. هندلر لینک‌ها
  const handleLinkChange = (idx: number, value: string) => {
    setImageLinks(links => {
      const newLinks = [...links];
      newLinks[idx] = value;
      return newLinks;
    });
  };
  const addLinkField = () => setImageLinks(links => [...links, '']);
  const removeLinkField = (idx: number) => setImageLinks(links => links.filter((_, i) => i !== idx));

  // ۴. مقداردهی اولیه state هنگام افزودن یا ویرایش
  const resetImageStates = () => {
    setImageFiles([]);
    setImageLinks(['']);
    setImagePreviews([]);
    setEditingInitialImages([]);
    setEditingNewsId(null);
  };

  // Sort options for news
  const sortOptions = [
    { value: 'title', label: 'عنوان', icon: <ArticleIcon />, description: 'مرتب‌سازی بر اساس عنوان خبر' },
    { value: 'author', label: 'نویسنده', icon: <PersonIcon />, description: 'مرتب‌سازی بر اساس نویسنده' },
    { value: 'category', label: 'دسته‌بندی', icon: <CategoryIcon />, description: 'مرتب‌سازی بر اساس دسته‌بندی' },
    { value: 'date', label: 'تاریخ', icon: <CalendarIcon />, description: 'مرتب‌سازی بر اساس تاریخ انتشار' },
  ];

  // تابع دریافت اخبار با صفحه‌بندی
  const fetchNews = async (pageNum = 1, searchParams?: SearchParams) => {
    setLoading(true);
    setError(null);
    try {
      let url = `/api/news?page=${pageNum}&limit=${limit}`;
      
      if (searchParams) {
        if (searchParams.query) url += `&search=${encodeURIComponent(searchParams.query)}`;
        if (searchParams.category) url += `&category=${searchParams.category}`;
        if (searchParams.sortBy) url += `&sortBy=${searchParams.sortBy}`;
        if (searchParams.sortOrder) url += `&sortOrder=${searchParams.sortOrder}`;
        if (searchParams.dateRange?.start) url += `&startDate=${searchParams.dateRange.start.toISOString()}`;
        if (searchParams.dateRange?.end) url += `&endDate=${searchParams.dateRange.end.toISOString()}`;
      }
      
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      if (data.success) {
        setNews(data.data.news || data.data);
        setTotal(data.data.total || data.data.length);
        
        // Update filter stats
        if (data.data.stats) {
          setFilterStats(prev => ({
            ...prev,
            categories: prev.categories.map(cat => ({
              ...cat,
              count: data.data.stats[cat.value] || 0
            }))
          }));
        }
      } else {
        throw new Error(data.error?.message || 'خطا در دریافت اطلاعات');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('خطای نامشخص');
      setError(error);
      setSnackbar({ open: true, message: error.message, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // تابع جستجوی پیشرفته
  const handleAdvancedSearch = (searchParams: SearchParams) => {
    setPage(1);
    setInitialLoading(true);
    setError(null);
    fetchNews(1, searchParams).finally(() => setInitialLoading(false));
  };

  // تابع پاک کردن فیلترها
  const handleClearFilters = () => {
    setPage(1);
    setCurrentSort(null);
    setError(null);
    setInitialLoading(true);
    fetchNews(1).finally(() => setInitialLoading(false));
  };

  // تابع مرتب‌سازی
  const handleSort = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    setCurrentSort({ field: sortBy, order: sortOrder });
    setPage(1);
    setError(null);
    setInitialLoading(true);
    fetchNews(1, { query: '', sortBy, sortOrder }).finally(() => setInitialLoading(false));
  };

  // تابع پاک کردن مرتب‌سازی
  const handleClearSort = () => {
    setCurrentSort(null);
    setPage(1);
    setError(null);
    setInitialLoading(true);
    fetchNews(1).finally(() => setInitialLoading(false));
  };

  useEffect(() => {
    setInitialLoading(true);
    setError(null);
    fetchNews(page).finally(() => setInitialLoading(false));
  }, [page]);

  const handleOpenAdd = () => {
    resetImageStates();
    const fields: import('@/components/admin/ModalSystem').FormField[] = [
      { 
        name: 'title', 
        label: 'عنوان خبر *', 
        type: 'text', 
        required: true,
        placeholder: 'عنوان کامل خبر را وارد کنید'
      },
      { 
        name: 'summary', 
        label: 'خلاصه خبر', 
        type: 'textarea', 
        required: false, 
        rows: 3,
        placeholder: 'خلاصه کوتاه از محتوای خبر (اختیاری)'
      },
      { 
        name: 'content', 
        label: 'محتوا *', 
        type: 'textarea', 
        required: true, 
        rows: 8,
        placeholder: 'محتوا کامل خبر را وارد کنید'
      },
      { 
        name: 'author', 
        label: 'نویسنده *', 
        type: 'text', 
        required: true,
        placeholder: 'نام نویسنده خبر'
      },
      { 
        name: 'category', 
        label: 'دسته‌بندی *', 
        type: 'select', 
        required: true,
        placeholder: 'دسته‌بندی خبر را انتخاب کنید',
        options: [
          { value: 'technology', label: 'فناوری' },
          { value: 'events', label: 'رویدادها' },
          { value: 'updates', label: 'به‌روزرسانی‌ها' },
          { value: 'general', label: 'عمومی' },
          { value: 'education', label: 'آموزشی' },
          { value: 'announcement', label: 'اعلان‌ها' },
        ]
      },
      { 
        name: 'date', 
        label: 'تاریخ انتشار *', 
        type: 'date', 
        required: true
      },
      { 
        name: 'image', 
        label: 'آدرس تصویر', 
        type: 'text', 
        required: false,
        placeholder: 'https://example.com/image.jpg'
      },
      { 
        name: 'published', 
        label: 'وضعیت انتشار', 
        type: 'checkbox', 
        required: false
      },
    ];

    // Extra content for image upload/link
    const extraContent = (
      <Box sx={{ my: 2 }}>
        <Button variant="contained" component="label" sx={{ mb: 1 }}>
          انتخاب چند عکس
          <input type="file" accept="image/*" hidden multiple onChange={handleFilesChange} />
        </Button>
        <DragDropContext onDragEnd={(result: DropResult) => {
          if (!result.destination) return;
          const reordered = Array.from(imagePreviews);
          const [removed] = reordered.splice(result.source.index, 1);
          reordered.splice(result.destination.index, 0, removed);
          setImagePreviews(reordered);
        }}>
          <Droppable droppableId="imagePreviews-droppable">
            {(provided: DroppableProvided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {imagePreviews.length > 0 && imagePreviews.map((src, idx) => (
                  <Draggable key={src} draggableId={src} index={idx}>
                    {(provided: DraggableProvided) => (
                      <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} style={{ marginBottom: 8 }}>
                        <img src={src} alt={`پیش‌نمایش ${idx+1}`} style={{ width: '100%', borderRadius: 8, objectFit: 'cover', maxHeight: 120 }} />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        <Typography sx={{ mt: 1, fontWeight: 700 }}>یا لینک عکس اینترنتی:</Typography>
        {imageLinks.map((link, idx) => (
          <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <TextField
              value={link}
              onChange={e => handleLinkChange(idx, e.target.value)}
              label={`لینک عکس ${idx+1}`}
              fullWidth
              size="small"
            />
            {imageLinks.length > 1 && (
              <Button onClick={() => removeLinkField(idx)} color="error">حذف</Button>
            )}
          </Box>
        ))}
        <Button onClick={addLinkField} sx={{ mt: 1 }}>افزودن لینک دیگر</Button>
      </Box>
    );

    // Use openModal directly to pass both fields and extra content
    openModal({
      type: 'form',
      title: 'افزودن خبر جدید',
      fields,
      content: extraContent,
      onSubmit: handleFormSubmit,
    });
  };

  const handleOpenEdit = (newsItem: News) => {
    // مقداردهی اولیه عکس‌ها
    setEditingNewsId(newsItem.id);
    const imgs = Array.isArray(newsItem.images) ? newsItem.images.map((img: any) => img.url) : [];
    setEditingInitialImages(imgs);
    setImagePreviews(imgs);
    setImageFiles([]);
    setImageLinks(['']);
    const fields: import('@/components/admin/ModalSystem').FormField[] = [
      { 
        name: 'title', 
        label: 'عنوان خبر *', 
        type: 'text', 
        required: true, 
        defaultValue: newsItem.title,
        placeholder: 'عنوان کامل خبر را وارد کنید'
      },
      { 
        name: 'summary', 
        label: 'خلاصه خبر', 
        type: 'textarea', 
        required: false, 
        rows: 3, 
        defaultValue: newsItem.summary,
        placeholder: 'خلاصه کوتاه از محتوای خبر (اختیاری)'
      },
      { 
        name: 'content', 
        label: 'محتوا *', 
        type: 'textarea', 
        required: true, 
        rows: 8, 
        defaultValue: newsItem.content,
        placeholder: 'محتوا کامل خبر را وارد کنید'
      },
      { 
        name: 'author', 
        label: 'نویسنده *', 
        type: 'text', 
        required: true, 
        defaultValue: newsItem.author,
        placeholder: 'نام نویسنده خبر'
      },
      { 
        name: 'category', 
        label: 'دسته‌بندی *', 
        type: 'select', 
        required: true,
        defaultValue: newsItem.category,
        placeholder: 'دسته‌بندی خبر را انتخاب کنید',
        options: [
          { value: 'technology', label: 'فناوری' },
          { value: 'events', label: 'رویدادها' },
          { value: 'updates', label: 'به‌روزرسانی‌ها' },
          { value: 'general', label: 'عمومی' },
          { value: 'education', label: 'آموزشی' },
          { value: 'announcement', label: 'اعلان‌ها' },
        ]
      },
      { 
        name: 'date', 
        label: 'تاریخ انتشار *', 
        type: 'date', 
        required: true, 
        defaultValue: newsItem.date
      },
      { 
        name: 'image', 
        label: 'آدرس تصویر', 
        type: 'text', 
        required: false, 
        defaultValue: newsItem.image,
        placeholder: 'https://example.com/image.jpg'
      },
      { 
        name: 'published', 
        label: 'وضعیت انتشار', 
        type: 'checkbox', 
        required: false, 
        defaultValue: newsItem.published
      },
    ];

    // Extra content for image upload/link (edit mode)
    const extraContent = (
      <Box sx={{ my: 2 }}>
        <Button variant="contained" component="label" sx={{ mb: 1 }}>
          انتخاب چند عکس جدید (در صورت انتخاب، عکس‌های قبلی حذف می‌شوند)
          <input type="file" accept="image/*" hidden multiple onChange={handleFilesChange} />
        </Button>
        {/* پیش‌نمایش عکس‌های قبلی */}
        {editingInitialImages.length > 0 && imagePreviews.length === 0 && editingInitialImages.map((src, idx) => (
          <img key={idx} src={src} alt={`عکس قبلی ${idx+1}`} style={{ width: '100%', borderRadius: 8, marginTop: 8, objectFit: 'cover', maxHeight: 120 }} />
        ))}
        {/* پیش‌نمایش عکس‌های جدید */}
        {imagePreviews.length > 0 && imagePreviews.map((src, idx) => (
          <img key={idx} src={src} alt={`پیش‌نمایش ${idx+1}`} style={{ width: '100%', borderRadius: 8, marginTop: 8, objectFit: 'cover', maxHeight: 120 }} />
        ))}
        <Typography sx={{ mt: 1, fontWeight: 700 }}>یا لینک عکس اینترنتی:</Typography>
        {imageLinks.map((link, idx) => (
          <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <TextField
              value={link}
              onChange={e => handleLinkChange(idx, e.target.value)}
              label={`لینک عکس ${idx+1}`}
              fullWidth
              size="small"
            />
            {imageLinks.length > 1 && (
              <Button onClick={() => removeLinkField(idx)} color="error">حذف</Button>
            )}
          </Box>
        ))}
        <Button onClick={addLinkField} sx={{ mt: 1 }}>افزودن لینک دیگر</Button>
      </Box>
    );

    openModal({
      type: 'form',
      title: 'ویرایش خبر',
      fields,
      content: extraContent,
      onSubmit: (data) => handleFormSubmit(data, newsItem),
    });
  };

  const handleDelete = async (id: string) => {
    const newsItem = news.find(n => n.id === id);
    if (!newsItem) return;

    showConfirmation(
      'تایید حذف خبر',
      `آیا از حذف خبر "${newsItem.title}" مطمئن هستید؟ این عملیات غیرقابل بازگشت است.`,
      async () => {
        setLoading(true);
        setError(null);
        try {
          const res = await fetch(`/api/news/${id}`, { method: 'DELETE' });
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          setSnackbar({ open: true, message: 'خبر حذف شد', severity: 'success' });
          fetchNews(page);
        } catch (err) {
          const error = err instanceof Error ? err : new Error('خطای نامشخص');
          setError(error);
          setSnackbar({ open: true, message: error.message, severity: 'error' });
        } finally {
          setLoading(false);
        }
      },
      undefined,
      'error'
    );
  };

  // ۵. بروزرسانی handleFormSubmit برای ارسال آرایه images (هم برای افزودن و هم ویرایش)
  const handleFormSubmit = async (formData: Record<string, any>, newsItem?: any) => {
    setLoading(true);
    setError(null);
    setValidationErrors({});
    try {
      // Validate form data
      const errors: Record<string, string> = {};
      
      if (!formData.title?.trim()) {
        errors.title = 'عنوان خبر الزامی است';
      } else if (formData.title.trim().length < 3) {
        errors.title = 'عنوان خبر باید حداقل ۳ کاراکتر باشد';
      }
      
      if (!formData.content?.trim()) {
        errors.content = 'محتوا الزامی است';
      } else if (formData.content.trim().length < 10) {
        errors.content = 'محتوا باید حداقل ۱۰ کاراکتر باشد';
      }
      
      if (!formData.author?.trim()) {
        errors.author = 'نویسنده الزامی است';
      } else if (formData.author.trim().length < 2) {
        errors.author = 'نام نویسنده باید حداقل ۲ کاراکتر باشد';
      }
      
      if (!formData.category?.trim()) {
        errors.category = 'دسته‌بندی الزامی است';
      }
      
      if (!formData.date) {
        errors.date = 'تاریخ انتشار الزامی است';
      } else {
        const selectedDate = new Date(formData.date);
        if (isNaN(selectedDate.getTime())) {
          errors.date = 'تاریخ نامعتبر است';
        }
      }
      
      // Validate image URL if provided
      if (formData.image?.trim()) {
        try {
          new URL(formData.image);
        } catch {
          errors.image = 'آدرس تصویر نامعتبر است';
        }
      }

      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        setLoading(false);
        return;
      }

      // آماده‌سازی آرایه عکس‌ها
      let images: string[] = [];
      if (imageFiles.length > 0) {
        // اگر فایل جدید انتخاب شده فقط فایل‌های جدید را بفرست
        images = await Promise.all(
          imageFiles.map(file => {
            return new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(file);
            });
          })
        );
        for (const link of imageLinks.filter(l => l.trim())) {
          images.push(link.trim());
        }
      } else if (editingInitialImages.length > 0 && editingNewsId) {
        // اگر فایل جدید انتخاب نشده و ویرایش است، عکس‌های قبلی را نگه دار
        images = [...editingInitialImages, ...imageLinks.filter(l => l.trim())];
      } else {
        images = imageLinks.filter(l => l.trim());
      }

      const url = newsItem && newsItem.id ? `/api/news/${newsItem.id}` : '/api/news';
      const method = newsItem && newsItem.id ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          images,
          published: formData.published || false,
        }),
        credentials: 'include'
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error?.message || `HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      if (data.success) {
        setSnackbar({ open: true, message: newsItem ? 'خبر با موفقیت ویرایش شد' : 'خبر با موفقیت افزوده شد', severity: 'success' });
        fetchNews(page);
        closeModal();
        resetImageStates();
      } else {
        throw new Error(data.error?.message || 'خطا در عملیات');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('خطای نامشخص');
      setError(error);
      setSnackbar({ open: true, message: error.message, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR');
  };

  const getCategoryLabel = (category: string) => {
    const categoryMap: Record<string, string> = {
      'technology': 'فناوری',
      'events': 'رویدادها',
      'updates': 'به‌روزرسانی‌ها',
      'general': 'عمومی',
    };
    return categoryMap[category] || category;
  };

  const handleTogglePublish = async (id: string, publish: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/news/${id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: publish }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      if (data.success) {
        setSnackbar({ open: true, message: `خبر ${publish ? 'منتشر شد' : 'پیش‌نویس شد'}`, severity: 'success' });
        fetchNews(page);
      } else {
        throw new Error(data.error?.message || 'خطا در تغییر وضعیت خبر');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('خطای نامشخص');
      setError(error);
      setSnackbar({ open: true, message: error.message, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 1, md: 3 } }}>
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'داشبورد', href: '/dashboard/admin', icon: <PersonIcon /> },
          { label: 'مدیریت اخبار', href: '/dashboard/admin/news', icon: <ArticleIcon /> },
        ]}
        showHome={true}
        showIcons={true}
        showHistory={true}
        showBookmarks={true}
        variant="detailed"
      />

      <Typography variant="h5" sx={{ ...neonTextSx, mb: 3 }}>مدیریت اخبار</Typography>
      
      {/* Error Display */}
      {error && (
        <Box sx={{ mb: 3 }}>
          <NetworkErrorHandler
            error={error}
            onRetry={() => {
              setError(null);
              fetchNews(page);
            }}
            onDismiss={() => setError(null)}
          />
        </Box>
      )}

      {/* Validation Errors */}
      {Object.keys(validationErrors).length > 0 && (
        <Box sx={{ mb: 3 }}>
          <ValidationErrorDisplay
            errors={validationErrors}
            onDismiss={() => setValidationErrors({})}
          />
        </Box>
      )}
      
      {/* جستجوی پیشرفته */}
      <AdvancedSearch
        onSearch={handleAdvancedSearch}
        onClear={handleClearFilters}
        filters={filterStats}
        searchSuggestions={searchSuggestions}
        placeholder="جستجو در اخبار..."
        showAdvanced={true}
        loading={loading}
      />

      {/* سیستم مرتب‌سازی */}
      <Box sx={{ mb: 3 }}>
        <SortingSystem
          onSort={handleSort}
          onClear={handleClearSort}
          sortOptions={sortOptions}
          currentSort={currentSort || undefined}
          showAdvanced={false}
          disabled={loading}
        />
      </Box>

      {/* دکمه افزودن خبر */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <Button
          startIcon={<AddIcon />}
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
          onClick={handleOpenAdd}
          disabled={initialLoading}
        >
          افزودن خبر
        </Button>
      </Box>

      <Card sx={glassCardSx}>
        <CardContent>
          {initialLoading ? (
            <TableSkeleton rows={5} columns={6} />
          ) : error ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <ErrorDisplay
                error={error}
                title="خطا در بارگذاری اخبار"
                severity="error"
                showDetails={true}
                onRetry={() => {
                  setError(null);
                  fetchNews(page);
                }}
              />
            </Box>
          ) : (
            <>
              <TableContainer component={Paper} sx={{ bgcolor: 'transparent', boxShadow: 'none', borderRadius: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: accent, fontWeight: 700, fontSize: 16 }}>عنوان</TableCell>
                      <TableCell sx={{ color: accent, fontWeight: 700, fontSize: 16 }}>نویسنده</TableCell>
                      <TableCell sx={{ color: accent, fontWeight: 700, fontSize: 16 }}>دسته‌بندی</TableCell>
                      <TableCell sx={{ color: accent, fontWeight: 700, fontSize: 16 }}>تاریخ انتشار</TableCell>
                      <TableCell sx={{ color: accent, fontWeight: 700, fontSize: 16 }}>تاریخ ایجاد</TableCell>
                      <TableCell sx={{ color: accent, fontWeight: 700, fontSize: 16 }}>عملیات</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {news.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4, color: '#aaa' }}>
                          هیچ خبری یافت نشد
                        </TableCell>
                      </TableRow>
                    ) : (
                      news.map(newsItem => (
                        <TableRow key={newsItem.id} sx={{
                          bgcolor: 'rgba(24,26,32,0.7)',
                          borderBottom: `1.5px solid ${accent}22`,
                          '&:hover': { boxShadow: `0 0 24px 0 ${accent}33`, backdropFilter: 'blur(6px)' }
                        }}>
                          <TableCell sx={{ color: accent, fontWeight: 700, maxWidth: 200 }}>
                            <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {newsItem.title}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ color: accent, fontWeight: 700 }}>{newsItem.author}</TableCell>
                          <TableCell>
                            <Chip 
                              label={getCategoryLabel(newsItem.category)} 
                              sx={{ 
                                bgcolor: 'rgba(34,211,238,0.15)', 
                                color: accent, 
                                fontWeight: 700, 
                                fontSize: 15 
                              }} 
                            />
                          </TableCell>
                          <TableCell sx={{ color: accent, fontWeight: 700 }}>{formatDate(newsItem.date)}</TableCell>
                          <TableCell sx={{ color: accent, fontWeight: 700 }}>{formatDate(newsItem.createdAt)}</TableCell>
                          <TableCell>
                            {Array.isArray(newsItem.images) && newsItem.images.length > 0 && newsItem.images.map((img, idx) => (
                              <img key={idx} src={img.url} alt={`img${idx+1}`} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4, marginLeft: 4 }} />
                            ))}
                          </TableCell>
                          <TableCell>
                            <IconButton onClick={() => handleOpenEdit(newsItem)} disabled={initialLoading}>
                              <EditIcon sx={{ color: accent }} />
                            </IconButton>
                            <IconButton onClick={() => handleDelete(newsItem.id)} disabled={initialLoading}>
                              <DeleteIcon sx={{ color: '#ef4444' }} />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <Pagination
                count={Math.ceil(total / limit)}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
                sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}
                disabled={initialLoading}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal System */}
      {modalConfig && (
        <ModalSystem
          open={isOpen}
          config={modalConfig}
          onClose={closeModal}
        />
      )}

      {/* Loading Overlay for operations */}
      <LoadingOverlay
        open={loading && !initialLoading}
        message="در حال انجام عملیات..."
        showSpinner={true}
        backdrop={false}
        zIndex={1000}
      />

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return {
      redirect: {
        destination: '/auth/signin',
        permanent: false,
      },
    };
  }

  try {
    const news = await prisma.news.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return {
      props: {
        news: JSON.parse(JSON.stringify(news)),
      },
    };
  } catch (error) {
    console.error('Error fetching news:', error);
    return {
      props: {
        news: [],
      },
    };
  }
};

export default AdminNews; 