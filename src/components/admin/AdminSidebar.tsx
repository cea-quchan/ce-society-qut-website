import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, Tooltip, IconButton, Box, Divider } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import EventIcon from '@mui/icons-material/Event';
import MessageIcon from '@mui/icons-material/Message';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import MenuIcon from '@mui/icons-material/Menu';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import ArticleIcon from '@mui/icons-material/Article';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import styles from './AdminSidebar.module.css';

const drawerWidth = 220;

const menuItems = [
  { text: 'داشبورد', icon: <DashboardIcon />, path: '/dashboard/admin', disabled: false },
  { text: 'مدیریت کاربران', icon: <PeopleIcon />, path: '/dashboard/admin/users', disabled: false },
  { text: 'مدیریت اخبار', icon: <ArticleIcon />, path: '/dashboard/admin/news', disabled: false },
  { text: 'مدیریت دوره‌ها', icon: <SchoolIcon />, path: '/dashboard/admin/courses', disabled: false },
  { text: 'مدیریت رویدادها', icon: <EventIcon />, path: '/dashboard/admin/events', disabled: false },
  { text: 'مدیریت گالری', icon: <PhotoLibraryIcon />, path: '/dashboard/admin/gallery', disabled: false },
  { text: 'مدیریت ویدیوی صفحه اصلی', icon: <VideoLibraryIcon />, path: '/dashboard/admin/hero-video', disabled: false },
  { text: 'مدیریت اعلان‌ها', icon: <MessageIcon />, path: '/dashboard/admin/notifications', disabled: false },
  { text: 'گزارش‌ها', icon: <BarChartIcon />, path: '/dashboard/admin/reports', disabled: false },
  { text: 'تنظیمات', icon: <SettingsIcon />, path: '/dashboard/admin/settings', disabled: false },
];

const accent = '#22d3ee';

const AdminSidebar: React.FC = () => {
  const [collapsed, setCollapsed] = React.useState(false);
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: collapsed ? 72 : drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: collapsed ? 72 : drawerWidth,
          boxSizing: 'border-box',
          bgcolor: 'rgba(24,26,32,0.85)',
          color: accent,
          borderRight: '1.5px solid #22d3ee55',
          borderRadius: collapsed ? '0 24px 24px 0' : '0 32px 32px 0',
          boxShadow: collapsed ? '0 0 24px 0 #22d3ee33' : '0 0 48px 0 #22d3ee55',
          backdropFilter: 'blur(16px)',
          transition: 'width 0.25s cubic-bezier(.4,2,.6,1), border-radius 0.25s',
        },
        display: { xs: 'none', md: 'block' },
      }}
      open
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-end', px: 1, py: 2 }}>
        <IconButton onClick={() => setCollapsed((c) => !c)} sx={{ color: accent, transition: 'color 0.2s' }}>
          {collapsed ? <MenuIcon /> : <MenuOpenIcon />}
        </IconButton>
      </Box>
      <Divider sx={{ mb: 1, borderColor: '#22d3ee33' }} />
      <List>
        {menuItems.map((item) => (
          <Tooltip key={item.text} title={collapsed ? (item.disabled ? `${item.text} (غیرفعال)` : item.text) : (item.disabled ? 'غیرفعال' : '')} placement="right">
            <ListItem
              button
              component={item.disabled ? 'div' : 'a'}
              href={item.disabled ? undefined : item.path}
              disabled={item.disabled}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                justifyContent: collapsed ? 'center' : 'flex-start',
                px: collapsed ? 0 : 2,
                transition: 'background 0.18s, box-shadow 0.18s',
                opacity: item.disabled ? 0.5 : 1,
                cursor: item.disabled ? 'not-allowed' : 'pointer',
                '&:hover': {
                  background: item.disabled ? 'transparent' : 'rgba(34,211,238,0.12)',
                  boxShadow: item.disabled ? 'none' : `0 0 16px 0 ${accent}33`,
                  color: item.disabled ? accent : '#fff',
                },
                boxShadow: 'none',
                '&.Mui-disabled': {
                  color: accent,
                  opacity: 0.5,
                },
              }}
            >
              <ListItemIcon className={styles.icon}>
                {item.icon}
              </ListItemIcon>
              {!collapsed && (
                <span className={styles.menuText}>
                  {item.text}
                  {item.disabled && <span className={styles.disabledText}>(غیرفعال)</span>}
                </span>
              )}
            </ListItem>
          </Tooltip>
        ))}
      </List>
    </Drawer>
  );
};
export default AdminSidebar;
