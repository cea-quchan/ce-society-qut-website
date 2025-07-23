import { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, CircularProgress, Alert, Grid } from '@mui/material';
import Link from 'next/link';
import { motion } from 'framer-motion';
import AnimatedButton from '@/components/ui/AnimatedButton';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor?: { name?: string };
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/courses')
      .then(res => res.ok ? res.json() : Promise.reject(res.statusText))
      .then(data => setCourses(data.courses || data))
      .catch(() => setError('خطا در دریافت لیست دوره‌ها'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', background: 'var(--background-color)', py: 6 }}>
      <Typography variant="h4" fontWeight={700} color="primary.main" textAlign="center" mb={4}>
        لیست دوره‌ها
      </Typography>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ maxWidth: 400, mx: 'auto' }}>{error}</Alert>
      ) : courses.length === 0 ? (
        <Alert severity="info" sx={{ maxWidth: 400, mx: 'auto' }}>هیچ دوره‌ای یافت نشد.</Alert>
      ) : (
        <Grid container spacing={3} justifyContent="center">
          {courses.map((course, i) => (
            <Grid item xs={12} sm={6} md={4} key={course.id}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.5, type: 'spring' }}
                whileHover={{ scale: 1.03, boxShadow: '0 8px 32px rgba(37,99,235,0.18)' }}
                style={{ height: '100%' }}
              >
                <Card sx={{ borderRadius: 3, boxShadow: 3, minHeight: 180, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'box-shadow 0.3s' }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={700} color="primary.main" gutterBottom>
                      {course.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      {course.description?.slice(0, 100) || 'بدون توضیح'}
                    </Typography>
                    {course.instructor?.name && (
                      <Typography variant="caption" color="text.secondary">
                        مدرس: {course.instructor.name}
                      </Typography>
                    )}
                  </CardContent>
                  <Box sx={{ p: 2, pt: 0 }}>
                    <Link href={`/courses/${course.id}`} passHref legacyBehavior>
                      <AnimatedButton variant="contained" color="primary" fullWidth>
                        مشاهده دوره
                      </AnimatedButton>
                    </Link>
                  </Box>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
} 