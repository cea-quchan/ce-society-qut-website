import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Snackbar, Alert
} from '@mui/material';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

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

const AdminReports: React.FC = () => {
  const [stats, setStats] = useState<any>({});
  const [topCourses, setTopCourses] = useState<any[]>([]);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchStats();
    fetchTopCourses();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      setStats(data.stats || data.data || {});
    } catch {
      setSnackbar({ open: true, message: 'خطا در دریافت آمار', severity: 'error' });
    }
  };
  const fetchTopCourses = async () => {
    try {
      const res = await fetch('/api/courses?sort=enrolled&order=desc&limit=5');
      const data = await res.json();
      setTopCourses(data.courses || data.data || []);
    } catch {}
  };
  // Export CSV
  const handleExport = () => {
    const csv = [
      ['عنوان', 'تعداد ثبت‌نام'],
      ...topCourses.map(c => [c.title, c.enrolled])
    ].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'top-courses.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ p: { xs: 1, md: 3 } }}>
      <Card sx={glassCardSx}>
        <CardContent>
          <Typography variant="h5" sx={neonTextSx} mb={3}>گزارش‌ها و آمار</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, mb: 4 }}>
            <Box sx={{ flex: 1, minWidth: 300 }}>
              <Bar
                data={{
                  labels: ['کاربران', 'دوره‌ها', 'رویدادها', 'درآمد (تومان)'],
                  datasets: [{
                    label: 'آمار کلی',
                    data: [stats.users || 0, stats.courses || 0, stats.events || 0, stats.income || 0],
                    backgroundColor: [accent, '#a78bfa', '#f472b6', '#facc15']
                  }]
                }}
                options={{ plugins: { legend: { display: false } } }}
              />
            </Box>
            <Box sx={{ flex: 1, minWidth: 300 }}>
              <Pie
                data={{
                  labels: ['کاربران', 'دوره‌ها', 'رویدادها'],
                  datasets: [{
                    label: 'درصد سهم',
                    data: [stats.users || 0, stats.courses || 0, stats.events || 0],
                    backgroundColor: [accent, '#a78bfa', '#f472b6']
                  }]
                }}
                options={{ plugins: { legend: { position: 'bottom' } } }}
              />
            </Box>
          </Box>
          <Typography variant="h6" sx={neonTextSx} mb={2}>پرفروش‌ترین دوره‌ها</Typography>
          <Button onClick={handleExport} sx={{ mb: 2, color: accent, border: '1.5px solid #22d3ee99', borderRadius: 2 }}>خروجی CSV</Button>
          <TableContainer component={Paper} sx={{ bgcolor: 'transparent', boxShadow: 'none', borderRadius: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: accent, fontWeight: 700, fontSize: 16 }}>عنوان دوره</TableCell>
                  <TableCell sx={{ color: accent, fontWeight: 700, fontSize: 16 }}>تعداد ثبت‌نام</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topCourses.map(c => (
                  <TableRow key={c.id} sx={{ bgcolor: 'rgba(24,26,32,0.7)', borderBottom: `1.5px solid ${accent}22` }}>
                    <TableCell sx={{ color: accent, fontWeight: 700 }}>{c.title}</TableCell>
                    <TableCell sx={{ color: accent, fontWeight: 700 }}>{c.enrolled}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
        <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
          <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
        </Snackbar>
      </Card>
    </Box>
  );
};

export default AdminReports; 