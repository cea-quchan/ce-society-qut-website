import React from 'react';
import { Box, CssBaseline, Grid, Card, CardContent, Typography, Button, Paper, List, ListItem, ListItemText, ListItemIcon, Divider } from '@mui/material';
import AdminSidebar from '@/components/admin/AdminSidebar';
import type { GetServerSideProps } from 'next';
import { prisma } from '@/lib/prisma';
import AdminPanelHeader from '@/components/admin/AdminPanelHeader';
import AdminPanelFooter from '@/components/admin/AdminPanelFooter';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import EventIcon from '@mui/icons-material/Event';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import BarChartIcon from '@mui/icons-material/BarChart';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArticleIcon from '@mui/icons-material/Article';
import PhotoIcon from '@mui/icons-material/Photo';
import MessageIcon from '@mui/icons-material/Message';

interface DashboardStats {
  totalUsers: number;
  students: number;
  teachers: number;
  admins: number;
  courses: number;
  events: number;
  competitions: number;
  news: number;
  gallery: number;
  messages: number;
}

interface RecentActivity {
  id: string;
  type: 'user' | 'news' | 'event' | 'course' | 'gallery';
  title: string;
  description: string;
  timestamp: string; // Changed from Date to string for serialization
}

const accent = '#22d3ee';

const glassCardSx = {
  bgcolor: 'rgba(24,26,32,0.55)',
  border: '1.5px solid #22d3ee55',
  boxShadow: '0 0 32px 0 #22d3ee33',
  borderRadius: 4,
  p: 1.5,
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

// Sample data for charts
const userRegistrationData = [
  { month: 'فروردین', users: 12 },
  { month: 'اردیبهشت', users: 19 },
  { month: 'خرداد', users: 15 },
  { month: 'تیر', users: 25 },
  { month: 'مرداد', users: 22 },
  { month: 'شهریور', users: 30 },
];

const activityData = [
  { name: 'کاربران', value: 45, color: '#22d3ee' },
  { name: 'اخبار', value: 23, color: '#10b981' },
  { name: 'رویدادها', value: 18, color: '#f59e0b' },
  { name: 'دوره‌ها', value: 12, color: '#8b5cf6' },
];

const AdminDashboard: React.FC<{ stats: DashboardStats; recentActivities: RecentActivity[] }> = ({ stats, recentActivities }) => {
  const cardIcons = [
    <PeopleIcon fontSize="inherit" key="users" />,
    <SchoolIcon fontSize="inherit" key="students" />,
    <SupervisorAccountIcon fontSize="inherit" key="teachers" />,
    <SupervisorAccountIcon fontSize="inherit" key="admins" />,
    <BarChartIcon fontSize="inherit" key="courses" />,
    <EventIcon fontSize="inherit" key="events" />,
    <EmojiEventsIcon fontSize="inherit" key="competitions" />,
    <ArticleIcon fontSize="inherit" key="news" />,
    <PhotoIcon fontSize="inherit" key="gallery" />,
    <MessageIcon fontSize="inherit" key="messages" />,
  ];
  
  const cardLabels = [
    'کل کاربران',
    'دانشجویان',
    'اساتید',
    'ادمین‌ها',
    'دوره‌ها',
    'رویدادها',
    'مسابقات',
    'اخبار',
    'گالری',
    'پیام‌ها',
  ];
  
  const cardValues = [
    stats.totalUsers,
    stats.students,
    stats.teachers,
    stats.admins,
    stats.courses,
    stats.events,
    stats.competitions,
    stats.news,
    stats.gallery,
    stats.messages,
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'row-reverse', minHeight: '100vh', bgcolor: '#181A20' }}>
      <CssBaseline />
      <AdminSidebar />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AdminPanelHeader />
        <Box sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, mt: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 4, color: accent, letterSpacing: 1 }}>
            داشبورد تحلیلی مدیریت
          </Typography>
          
          {/* آمار سریع */}
          <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
            {cardLabels.map((label, i) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={label}>
                <Card
                  sx={{
                    ...glassCardSx,
                    position: 'relative',
                    overflow: 'hidden',
                    minHeight: 170,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 6,
                    transition: 'box-shadow 0.3s, border-color 0.3s, transform 0.22s',
                    '&:hover': {
                      boxShadow: '0 0 80px 0 #22d3eecc',
                      borderColor: '#22d3ee',
                      transform: 'translateY(-6px) scale(1.045)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 18,
                      right: 18,
                      fontSize: 60,
                      color: accent,
                      filter: 'drop-shadow(0 0 20px #22d3ee88)',
                      opacity: 0.92,
                      zIndex: 1,
                      transition: 'filter 0.3s',
                      pointerEvents: 'none',
                    }}
                  >
                    {cardIcons[i]}
                  </Box>
                  <CardContent sx={{ zIndex: 2, width: '100%' }}>
                    <Typography variant="h6" sx={neonTextSx}>{label}</Typography>
                    <Typography variant="h3" sx={{ ...neonTextSx, fontSize: { xs: 32, md: 40, lg: 48 } }}>{cardValues[i]}</Typography>
                    <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ArrowUpwardIcon sx={{ color: '#10b981', fontSize: 22, filter: 'drop-shadow(0 0 6px #10b981)' }} />
                      <Typography sx={{ color: '#10b981', fontWeight: 700, fontSize: 16, textShadow: '0 0 4px #10b981' }}>+5%</Typography>
                      <Typography sx={{ color: '#aaa', fontSize: 14 }}>نسبت به ماه قبل</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* نمودارها و تحلیل‌ها */}
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {/* نمودار روند ثبت‌نام کاربران */}
            <Grid item xs={12} lg={8}>
              <Card sx={{ ...glassCardSx, p: 3, height: 400 }}>
                <Typography variant="h6" sx={{ ...neonTextSx, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUpIcon />
                  روند ثبت‌نام کاربران (6 ماه اخیر)
                </Typography>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={userRegistrationData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis 
                      dataKey="month" 
                      stroke="#22d3ee"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#22d3ee"
                      fontSize={12}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(24,26,32,0.95)',
                        border: '1px solid #22d3ee',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="users" 
                      stroke="#22d3ee" 
                      strokeWidth={3}
                      dot={{ fill: '#22d3ee', strokeWidth: 2, r: 6 }}
                      activeDot={{ r: 8, stroke: '#22d3ee', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Grid>

            {/* نمودار دایره‌ای فعالیت‌ها */}
            <Grid item xs={12} lg={4}>
              <Card sx={{ ...glassCardSx, p: 3, height: 400 }}>
                <Typography variant="h6" sx={{ ...neonTextSx, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BarChartIcon />
                  توزیع فعالیت‌ها
                </Typography>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={activityData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {activityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(24,26,32,0.95)',
                        border: '1px solid #22d3ee',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Grid>
          </Grid>

          {/* آخرین فعالیت‌ها */}
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} lg={8}>
              <Card sx={{ ...glassCardSx, p: 3 }}>
                <Typography variant="h6" sx={{ ...neonTextSx, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTimeIcon />
                  آخرین فعالیت‌ها
                </Typography>
                <List>
                  {recentActivities.map((activity, index) => (
                    <React.Fragment key={activity.id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon sx={{ color: accent, minWidth: 40 }}>
                          {activity.type === 'user' && <PeopleIcon sx={{ color: accent }} />}
                          {activity.type === 'news' && <ArticleIcon sx={{ color: accent }} />}
                          {activity.type === 'event' && <EventIcon sx={{ color: accent }} />}
                          {activity.type === 'course' && <SchoolIcon sx={{ color: accent }} />}
                          {activity.type === 'gallery' && <PhotoIcon sx={{ color: accent }} />}
                        </ListItemIcon>
                        <ListItemText
                          primary={activity.title}
                          secondary={activity.description}
                          primaryTypographyProps={{
                            sx: { color: '#fff', fontWeight: 600 }
                          }}
                          secondaryTypographyProps={{
                            sx: { color: '#aaa' }
                          }}
                        />
                        <Typography variant="caption" sx={{ color: '#666' }}>
                          {new Date(activity.timestamp).toLocaleDateString('fa-IR')}
                        </Typography>
                      </ListItem>
                      {index < recentActivities.length - 1 && <Divider sx={{ borderColor: '#333' }} />}
                    </React.Fragment>
                  ))}
                </List>
              </Card>
            </Grid>

            {/* خلاصه وضعیت سیستم */}
            <Grid item xs={12} lg={4}>
              <Card sx={{ ...glassCardSx, p: 3 }}>
                <Typography variant="h6" sx={{ ...neonTextSx, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <NotificationsIcon />
                  وضعیت سیستم
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ color: '#fff' }}>وضعیت سرور</Typography>
                    <Box sx={{ 
                      width: 12, 
                      height: 12, 
                      borderRadius: '50%', 
                      bgcolor: '#10b981',
                      boxShadow: '0 0 8px #10b981'
                    }} />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ color: '#fff' }}>دیتابیس</Typography>
                    <Box sx={{ 
                      width: 12, 
                      height: 12, 
                      borderRadius: '50%', 
                      bgcolor: '#10b981',
                      boxShadow: '0 0 8px #10b981'
                    }} />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ color: '#fff' }}>فضای ذخیره</Typography>
                    <Typography sx={{ color: '#10b981' }}>75%</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ color: '#fff' }}>آخرین بکاپ</Typography>
                    <Typography sx={{ color: '#aaa' }}>2 ساعت پیش</Typography>
                  </Box>
                </Box>
              </Card>
            </Grid>
          </Grid>

          {/* دکمه‌های میانبر */}
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Button
              component={Link}
              href="/dashboard/admin/users"
              sx={{
                px: 4,
                py: 1.5,
                fontWeight: 800,
                fontSize: '1.08rem',
                borderRadius: 4,
                color: accent,
                background: 'rgba(24,26,32,0.8)',
                border: '2px solid #22d3eecc',
                boxShadow: '0 0 24px 0 #22d3ee55',
                textShadow: '0 0 8px #22d3ee, 0 0 2px #fff',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.18s',
                '&:hover': {
                  background: '#22d3ee',
                  color: '#181A20',
                  boxShadow: '0 0 32px 0 #22d3ee',
                  borderColor: '#22d3ee',
                  transform: 'scale(1.04)',
                },
              }}
            >
              مدیریت کاربران
            </Button>
            <Button
              component={Link}
              href="/dashboard/admin/courses"
              sx={{
                px: 4,
                py: 1.5,
                fontWeight: 800,
                fontSize: '1.08rem',
                borderRadius: 4,
                color: accent,
                background: 'rgba(24,26,32,0.8)',
                border: '2px solid #22d3eecc',
                boxShadow: '0 0 24px 0 #22d3ee55',
                textShadow: '0 0 8px #22d3ee, 0 0 2px #fff',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.18s',
                '&:hover': {
                  background: '#22d3ee',
                  color: '#181A20',
                  boxShadow: '0 0 32px 0 #22d3ee',
                  borderColor: '#22d3ee',
                  transform: 'scale(1.04)',
                },
              }}
            >
              مدیریت دوره‌ها
            </Button>
            <Button
              component={Link}
              href="/dashboard/admin/events"
              sx={{
                px: 4,
                py: 1.5,
                fontWeight: 800,
                fontSize: '1.08rem',
                borderRadius: 4,
                color: accent,
                background: 'rgba(24,26,32,0.8)',
                border: '2px solid #22d3eecc',
                boxShadow: '0 0 24px 0 #22d3ee55',
                textShadow: '0 0 8px #22d3ee, 0 0 2px #fff',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.18s',
                '&:hover': {
                  background: '#22d3ee',
                  color: '#181A20',
                  boxShadow: '0 0 32px 0 #22d3ee',
                  borderColor: '#22d3ee',
                  transform: 'scale(1.04)',
                },
              }}
            >
              مدیریت رویدادها
            </Button>
          </Box>
        </Box>
        <AdminPanelFooter />
      </Box>
    </Box>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    // آمار کلی
    const [totalUsers, students, teachers, admins, courses, events, competitions, news, gallery, messages] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'student' } }),
    prisma.user.count({ where: { role: 'teacher' } }),
      prisma.user.count({ where: { role: 'ADMIN' } }),
    prisma.course.count(),
    prisma.event.count(),
    prisma.competition.count(),
      prisma.news.count(),
      prisma.galleryItem.count(),
      prisma.contact.count(),
    ]);

    // آخرین فعالیت‌ها
    const [recentUsers, recentNews, recentEvents, recentCourses, recentGallery] = await Promise.all([
      prisma.user.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, createdAt: true }
      }),
      prisma.news.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
        select: { id: true, title: true, createdAt: true }
      }),
      prisma.event.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
        select: { id: true, title: true, createdAt: true }
      }),
      prisma.course.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
        select: { id: true, title: true, createdAt: true }
      }),
      prisma.galleryItem.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
        select: { id: true, title: true, createdAt: true }
      }),
    ]);

    // ترکیب فعالیت‌ها
    const recentActivities: RecentActivity[] = [
      ...recentUsers.map(user => ({
        id: user.id,
        type: 'user' as const,
        title: `کاربر جدید: ${user.name}`,
        description: `ایمیل: ${user.email}`,
        timestamp: user.createdAt.toISOString(), // Convert to ISO string
      })),
      ...recentNews.map(news => ({
        id: news.id,
        type: 'news' as const,
        title: `خبر جدید: ${news.title}`,
        description: 'خبر جدید منتشر شد',
        timestamp: news.createdAt.toISOString(), // Convert to ISO string
      })),
      ...recentEvents.map(event => ({
        id: event.id,
        type: 'event' as const,
        title: `رویداد جدید: ${event.title}`,
        description: 'رویداد جدید ایجاد شد',
        timestamp: event.createdAt.toISOString(), // Convert to ISO string
      })),
      ...recentCourses.map(course => ({
        id: course.id,
        type: 'course' as const,
        title: `دوره جدید: ${course.title}`,
        description: 'دوره جدید ایجاد شد',
        timestamp: course.createdAt.toISOString(), // Convert to ISO string
      })),
      ...recentGallery.map(item => ({
        id: item.id,
        type: 'gallery' as const,
        title: `عکس جدید: ${item.title}`,
        description: 'عکس جدید به گالری اضافه شد',
        timestamp: item.createdAt.toISOString(), // Convert to ISO string
      })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 8);

  return {
    props: {
      stats: {
        totalUsers,
        students,
        teachers,
        admins,
        courses,
        events,
        competitions,
          news,
          gallery,
          messages,
        },
        recentActivities,
      },
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return {
      props: {
        stats: {
          totalUsers: 0,
          students: 0,
          teachers: 0,
          admins: 0,
          courses: 0,
          events: 0,
          competitions: 0,
          news: 0,
          gallery: 0,
          messages: 0,
        },
        recentActivities: [],
      },
    };
  }
};

export default AdminDashboard; 