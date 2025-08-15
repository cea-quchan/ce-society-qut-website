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
  Select,
  MenuItem,
  IconButton,
  Chip,
  Modal,
  Snackbar,
  Alert,
  CircularProgress,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import type { GetServerSideProps } from 'next';
import { prisma } from '@/lib/prisma';
import AdvancedSearch, { SearchParams } from '@/components/admin/AdvancedSearch';
import SortingSystem from '@/components/admin/SortingSystem';
import ModalSystem from '@/components/admin/ModalSystem';
import { useModal } from '@/hooks/useModal';
import { TableSkeleton, LoadingOverlay } from '@/components/admin/LoadingStates';
import { ErrorDisplay, NetworkErrorHandler, ValidationErrorDisplay } from '@/components/admin/ErrorHandling';
import Breadcrumbs from '@/components/admin/Breadcrumbs';
import Image from 'next/image';
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

// تعریف لیست نقش‌ها
export const ROLES = [
  { value: 'ADMIN', label: 'ادمین' },
  { value: 'INSTRUCTOR', label: 'استاد' },
  { value: 'STUDENT', label: 'دانشجو' },
  { value: 'USER', label: 'کاربر عادی' }
];

export function getRoleLabel(role: string) {
  return ROLES.find(r => r.value === role)?.label || role;
}

const roleIcons: { [key: string]: JSX.Element } = {
  admin: <SupervisorAccountIcon sx={{ color: accent }} />,
  teacher: <SchoolIcon sx={{ color: accent }} />,
  student: <PersonIcon sx={{ color: accent }} />,
  user: <PersonIcon sx={{ color: accent }} />,
};

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  active: boolean; // Added active property
  image?: string | null; // اضافه شد
}

interface AdminUsersProps {
  users: User[];
}

const AdminUsers: React.FC<AdminUsersProps> = ({ users: initialUsers }) => {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('all');
  const [editUser, setEditUser] = useState<User | null>(null);
  const [form, setForm] = useState({ name: '', email: '', role: 'user', password: '' });
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
    categories: [],
    statuses: [],
    types: [],
    roles: [
      { label: 'ادمین', value: 'admin', count: 0 },
      { label: 'استاد', value: 'teacher', count: 0 },
      { label: 'دانشجو', value: 'student', count: 0 },
      { label: 'کاربر عادی', value: 'user', count: 0 },
    ],
  });

  // Modal system
  const { modalConfig, isOpen, closeModal, showConfirmation, showForm } = useModal();

  // Sort options for users
  const sortOptions = [
    { value: 'name', label: 'نام', icon: <PersonIcon />, description: 'مرتب‌سازی بر اساس نام کاربر' },
    { value: 'email', label: 'ایمیل', icon: <PersonIcon />, description: 'مرتب‌سازی بر اساس آدرس ایمیل' },
    { value: 'role', label: 'نقش', icon: <SupervisorAccountIcon />, description: 'مرتب‌سازی بر اساس نقش کاربر' },
    { value: 'createdAt', label: 'تاریخ عضویت', icon: <PersonIcon />, description: 'مرتب‌سازی بر اساس تاریخ عضویت' },
  ];

  // تابع دریافت کاربران با صفحه‌بندی
  const fetchUsers = async (pageNum = 1, searchParams?: SearchParams) => {
    setLoading(true);
    setError(null);
    try {
      let url = `/api/users?page=${pageNum}&limit=${limit}`;
      
      if (searchParams) {
        if (searchParams.query) url += `&search=${encodeURIComponent(searchParams.query)}`;
        if (searchParams.role) url += `&role=${searchParams.role}`;
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
        setUsers(data.data.users);
        setTotal(data.data.total);
        
        // Update filter stats
        if (data.data.stats) {
          setFilterStats(prev => ({
            ...prev,
            roles: prev.roles.map(role => ({
              ...role,
              count: data.data.stats[role.value] || 0
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
    fetchUsers(1, searchParams).finally(() => setInitialLoading(false));
  };

  // تابع پاک کردن فیلترها
  const handleClearFilters = () => {
    setPage(1);
    setCurrentSort(null);
    setError(null);
    setInitialLoading(true);
    fetchUsers(1).finally(() => setInitialLoading(false));
  };

  // تابع مرتب‌سازی
  const handleSort = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    setCurrentSort({ field: sortBy, order: sortOrder });
    setPage(1);
    setError(null);
    setInitialLoading(true);
    fetchUsers(1, { query: '', sortBy, sortOrder }).finally(() => setInitialLoading(false));
  };

  // تابع پاک کردن مرتب‌سازی
  const handleClearSort = () => {
    setCurrentSort(null);
    setPage(1);
    setError(null);
    setInitialLoading(true);
    fetchUsers(1).finally(() => setInitialLoading(false));
  };

  // دریافت پیشنهادات جستجو
  const fetchSearchSuggestions = async () => {
    try {
      const res = await fetch('/api/users/suggestions');
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      if (data.success) {
        setSearchSuggestions(data.data);
      }
    } catch (error) {
      console.error('Error fetching search suggestions:', error);
    }
  };

  useEffect(() => {
    setInitialLoading(true);
    setError(null);
    fetchUsers(page).finally(() => setInitialLoading(false));
    fetchSearchSuggestions();
  }, [page]);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenAdd = () => {
    const fields = [
      { name: 'name', label: 'نام', type: 'text', required: true },
      { name: 'email', label: 'ایمیل', type: 'email', required: true },
      { 
        name: 'role', 
        label: 'نقش', 
        type: 'select', 
        required: true,
        options: ROLES.map(r => ({ value: r.value, label: r.label })),
      },
      { name: 'password', label: 'رمز عبور', type: 'password', required: true },
    ];

    showForm('افزودن کاربر جدید', fields, handleFormSubmit);
  };

  const handleOpenEdit = (user: User) => {
    setEditUser(user);
    const fields = [
      { name: 'name', label: 'نام', type: 'text', required: true, defaultValue: user.name },
      { name: 'email', label: 'ایمیل', type: 'email', required: true, defaultValue: user.email },
      { 
        name: 'role', 
        label: 'نقش', 
        type: 'select', 
        required: true,
        defaultValue: user.role,
        options: ROLES.map(r => ({ value: r.value, label: r.label })),
      },
      { name: 'password', label: 'رمز عبور جدید (اختیاری)', type: 'password', required: false },
    ];

    showForm('ویرایش کاربر', fields, handleFormSubmit);
  };

  const handleDelete = async (id: string) => {
    const user = users.find(u => u.id === id);
    if (!user) return;

    showConfirmation(
      'تایید حذف کاربر',
      `آیا از حذف کاربر "${user.name}" مطمئن هستید؟ این عملیات غیرقابل بازگشت است.`,
      async () => {
        setLoading(true);
        setError(null);
        try {
          const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          const data = await res.json();
          if (data.success) {
            setSnackbar({ open: true, message: 'کاربر حذف شد', severity: 'success' });
            fetchUsers(page);
          } else {
            throw new Error(data.error?.message || 'خطا در حذف کاربر');
          }
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

  const handleFormSubmit = async (formData: Record<string, any>) => {
    setLoading(true);
    setError(null);
    setValidationErrors({});
    
    try {
      // Validate form data
      const errors: Record<string, string> = {};
      if (!formData.name?.trim()) {
        errors.name = 'نام کاربر الزامی است';
      }
      if (!formData.email?.trim()) {
        errors.email = 'ایمیل الزامی است';
      } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
        errors.email = 'ایمیل معتبر وارد کنید';
      }
      if (!editUser && (!formData.password || formData.password.length < 8)) {
        errors.password = 'رمز عبور باید حداقل ۸ کاراکتر باشد';
      }

      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        setLoading(false);
        return;
      }

      let res;
      if (editUser) {
        const body: any = { name: formData.name, email: formData.email, role: formData.role };
        if (formData.password) body.password = formData.password;
        
        res = await fetch(`/api/users/${editUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
      } else {
        res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      if (data.success) {
        setSnackbar({ open: true, message: editUser ? 'کاربر ویرایش شد' : 'کاربر افزوده شد', severity: 'success' });
        fetchUsers(page);
        closeModal();
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

  return (
    <Box sx={{ p: { xs: 1, md: 3 } }}>
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'داشبورد', href: '/dashboard/admin', icon: <PersonIcon /> },
          { label: 'مدیریت کاربران', href: '/dashboard/admin/users', icon: <SupervisorAccountIcon /> },
        ]}
        showHome={true}
        showIcons={true}
        showHistory={true}
        showBookmarks={true}
        variant="detailed"
      />

      <Typography variant="h5" sx={{ ...neonTextSx, mb: 3 }}>مدیریت کاربران</Typography>
      
      {/* Error Display */}
      {error && (
        <Box sx={{ mb: 3 }}>
          <NetworkErrorHandler
            error={error}
            onRetry={() => {
              setError(null);
              fetchUsers(page);
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
        placeholder="جستجو در کاربران..."
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

      {/* دکمه افزودن کاربر */}
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
          افزودن کاربر
        </Button>
      </Box>

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <TextField
          label="جستجو کاربر..."
          variant="outlined"
          size="small"
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ minWidth: 220, bgcolor: '#181A20', borderRadius: 2, input: { color: '#fff' } }}
        />
      </Box>

      <Card sx={glassCardSx}>
        <CardContent>
          {initialLoading ? (
            <TableSkeleton rows={5} columns={5} />
          ) : error ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <ErrorDisplay
                error={error}
                title="خطا در بارگذاری کاربران"
                severity="error"
                showDetails={true}
                onRetry={() => {
                  setError(null);
                  fetchUsers(page);
                }}
              />
            </Box>
          ) : (
            <>
              <TableContainer component={Paper} sx={{ bgcolor: 'transparent', boxShadow: 'none', borderRadius: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: accent, fontWeight: 700, fontSize: 16 }}>نام</TableCell>
                      <TableCell sx={{ color: accent, fontWeight: 700, fontSize: 16 }}>ایمیل</TableCell>
                      <TableCell sx={{ color: accent, fontWeight: 700, fontSize: 16 }}>نقش</TableCell>
                      <TableCell sx={{ color: accent, fontWeight: 700, fontSize: 16 }}>تاریخ عضویت</TableCell>
                      <TableCell sx={{ color: accent, fontWeight: 700, fontSize: 16 }}>عملیات</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4, color: '#aaa' }}>
                          هیچ کاربری یافت نشد
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map(user => (
                        <TableRow key={user.id} sx={{
                          bgcolor: 'rgba(24,26,32,0.7)',
                          borderBottom: `1.5px solid ${accent}22`,
                          '&:hover': { boxShadow: `0 0 24px 0 ${accent}33`, backdropFilter: 'blur(6px)', background: 'rgba(34,211,238,0.08)' }
                        }}>
                          <TableCell sx={{ color: accent, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                            {user.image && (
                              <Image src={user.image} alt={user.name} width={40} height={40} style={{ borderRadius: '50%', marginLeft: 8 }} />
                            )}
                            {roleIcons[user.role] || roleIcons['user']} {user.name}
                            {user.active ? (
                              <CheckCircleIcon sx={{ color: '#10b981', ml: 1 }} titleAccess="فعال" />
                            ) : (
                              <BlockIcon sx={{ color: '#ef4444', ml: 1 }} titleAccess="غیرفعال" />
                            )}
                          </TableCell>
                          <TableCell sx={{ color: accent, fontWeight: 700 }}>{user.email}</TableCell>
                          <TableCell>
                            <Chip label={getRoleLabel(user.role)} sx={{ bgcolor: 'rgba(34,211,238,0.15)', color: accent, fontWeight: 700, fontSize: 15 }} />
                          </TableCell>
                          <TableCell sx={{ color: accent, fontWeight: 700 }}>{user.createdAt}</TableCell>
                          <TableCell>
                            <IconButton onClick={() => handleOpenEdit(user)} disabled={initialLoading}>
                              <EditIcon sx={{ color: accent }} />
                            </IconButton>
                            <IconButton onClick={() => handleDelete(user.id)} disabled={initialLoading}>
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

export const getServerSideProps: GetServerSideProps = async () => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      image: true, // اضافه شد
    },
    orderBy: { createdAt: 'desc' },
  });
  // Define the type for the raw user from Prisma
  type RawUser = {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: Date;
    image: string | null; // اضافه شد
  };
  // Format date for display (e.g., yyyy/mm/dd)
  const formattedUsers = users.map((u: RawUser) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt ? u.createdAt.toLocaleDateString('fa-IR') : '',
    image: u.image ?? null,
  }));
  return {
    props: {
      users: formattedUsers,
    },
  };
};

export default AdminUsers; 