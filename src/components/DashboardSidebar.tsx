import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Article as ArticleIcon,
  Event as EventIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  PhotoLibrary as GalleryIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import Link from 'next/link';

const menuItems = [
  { title: 'داشبورد', icon: <DashboardIcon />, path: '/dashboard' },
  { title: 'مقالات', icon: <ArticleIcon />, path: '/dashboard/articles' },
  { title: 'رویدادها', icon: <EventIcon />, path: '/dashboard/events' },
  { title: 'کاربران', icon: <PeopleIcon />, path: '/dashboard/users' },
  { title: 'گالری', icon: <GalleryIcon />, path: '/dashboard/gallery' },
  { title: 'تنظیمات', icon: <SettingsIcon />, path: '/dashboard/settings' },
];

interface DashboardSidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function DashboardSidebar({ open, onClose }: DashboardSidebarProps) {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Drawer
      variant="temporary"
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
          bgcolor: theme.palette.background.paper,
        },
      }}
    >
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.path}
              component={Link}
              href={item.path}
              selected={router.pathname === item.path}
              onClick={onClose}
              sx={{
                '&.Mui-selected': {
                  bgcolor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  '& .MuiListItemIcon-root': {
                    color: theme.palette.primary.contrastText,
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: router.pathname === item.path
                    ? theme.palette.primary.contrastText
                    : theme.palette.text.primary,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.title} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
} 