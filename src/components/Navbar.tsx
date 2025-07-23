import { useState, useEffect } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Stack,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';
import SchoolIcon from '@mui/icons-material/School';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import EventIcon from '@mui/icons-material/Event';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import LanguageIcon from '@mui/icons-material/Language';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns-jalali';
import { useTheme as useAppTheme } from '@/hooks/useTheme';

const pages = [
  { title: 'خانه', path: '/', icon: <HomeIcon /> },
  { title: 'درباره ما', path: '/about', icon: <InfoIcon /> },
  { title: 'دوره‌ها', path: '/courses', icon: <SchoolIcon /> },
  { title: 'اخبار', path: '/news', icon: <NewspaperIcon /> },
  { title: 'رویدادها', path: '/events', icon: <EventIcon /> },
  { title: 'گالری', path: '/gallery', icon: <PhotoLibraryIcon /> },
  { title: 'تماس با ما', path: '/contact', icon: <ContactSupportIcon /> },
];

const settings = [
  { title: 'پروفایل', path: '/dashboard' },
  { title: 'تنظیمات', path: '/dashboard/settings' },
  { title: 'خروج', action: 'logout' },
];

export default function Navbar() {
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();
  const { t } = useTranslation('common');
  const [date, setDate] = useState<string>(format(new Date(), 'yyyy/MM/dd'));
  const { theme, setTheme } = useAppTheme();
  const [langMenuAnchor, setLangMenuAnchor] = useState<null | HTMLElement>(null);

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSettingClick = (setting: { title: string; path?: string; action?: string }) => {
    handleCloseUserMenu();
    if (setting.action === 'logout') {
      signOut();
    } else if (setting.path) {
      router.push(setting.path);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setDate(format(new Date(), 'yyyy/MM/dd'));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleThemeToggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleLangMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setLangMenuAnchor(event.currentTarget);
  };
  const handleLangMenuClose = () => setLangMenuAnchor(null);
  const handleLangChange = (lng: string) => {
    router.push(router.pathname, router.asPath, { locale: lng });
    handleLangMenuClose();
  };

  const disabledPages = ['/courses', '/events', '/competitions', '/dashboard'];

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Box sx={{ p: 2 }}>
        <Image
          src="/images/logo.png"
          alt="Logo"
          width={150}
          height={50}
          priority
        />
      </Box>
      <Divider />
      <List>
        {pages.map((page) => (
          <ListItem
            key={page.title}
            component={Link}
            href={page.path}
            selected={router.pathname === page.path}
            disabled={disabledPages.includes(page.path)}
            sx={{
              '&.Mui-selected': {
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
              },
              color: disabledPages.includes(page.path) ? '#aaa' : 'inherit',
              opacity: disabledPages.includes(page.path) ? 0.5 : 1,
              pointerEvents: disabledPages.includes(page.path) ? 'none' : 'auto',
            }}
          >
            <ListItemIcon sx={{ color: 'inherit' }}>{page.icon}</ListItemIcon>
            <ListItemText primary={page.title + (disabledPages.includes(page.path) ? ' (به زودی...)' : '')} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{
        bgcolor: theme === 'dark' 
          ? 'rgba(18, 18, 18, 0.95)' 
          : 'rgba(25, 118, 210, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid',
        borderColor: theme === 'dark' 
          ? 'rgba(255, 255, 255, 0.1)' 
          : 'rgba(255, 255, 255, 0.2)',
        color: 'white',
        borderRadius: 16,
        boxShadow: '0 4px 24px 0 rgba(0,0,0,0.10), 0 1.5px 6px 0 #00eaff',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Logo - Desktop */}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              mr: 3,
            }}
          >
            <Link href="/">
              <Image
                src="/images/logo.png"
                alt="Logo"
                width={150}
                height={50}
                priority
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </Link>
          </Box>

          {/* Mobile Menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="menu"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleDrawerToggle}
              color="inherit"
              sx={{
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <MenuIcon />
            </IconButton>
            <Drawer
              variant="temporary"
              anchor="right"
              open={mobileOpen}
              onClose={handleDrawerToggle}
              ModalProps={{
                keepMounted: true,
              }}
              sx={{
                display: { xs: 'block', md: 'none' },
                '& .MuiDrawer-paper': { 
                  boxSizing: 'border-box', 
                  width: 280,
                  bgcolor: theme === 'dark' 
                    ? 'rgba(18, 18, 18, 0.98)' 
                    : 'rgba(255, 255, 255, 0.98)',
                  backdropFilter: 'blur(10px)',
                },
              }}
            >
              {drawer}
            </Drawer>
          </Box>

          {/* Logo - Mobile */}
          <Box
            sx={{
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              justifyContent: 'center',
            }}
          >
            <Link href="/">
              <Image
                src="/images/logo.png"
                alt="Logo"
                width={120}
                height={40}
                priority
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </Link>
          </Box>

          {/* Desktop Menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            <Stack direction="row" spacing={1}>
            {pages.map((page) => (
              <Link key={page.title} href={page.path} style={{ textDecoration: 'none' }}>
                <Button
                  sx={{
                      color: 'inherit',
                      textTransform: 'none',
                      fontWeight: router.pathname === page.path ? 600 : 400,
                      position: 'relative',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: 0,
                        left: '50%',
                        width: router.pathname === page.path ? '100%' : '0%',
                        height: '2px',
                        bgcolor: 'secondary.light',
                        transform: 'translateX(-50%)',
                        transition: 'width 0.3s ease',
                      },
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                        '&::after': {
                          width: '100%',
                        },
                      },
                      transition: 'all 0.3s ease',
                  }}
                >
                  {page.title}
                </Button>
              </Link>
            ))}
            </Stack>
          </Box>

          {/* تاریخ شمسی */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', mx: 2 }}>
            <Typography variant="body2" color="inherit" sx={{ mx: 1 }}>
              {date}
            </Typography>
          </Box>

          {/* دکمه داشبورد */}
          {session && (
            <Button
              variant="contained"
              color="secondary"
              sx={{
                mx: 1,
                borderRadius: 8,
                boxShadow: '0 0 8px #00eaff',
                fontWeight: 'bold',
                background: 'linear-gradient(90deg, #00eaff 0%, #005bea 100%)',
                color: '#fff',
                '&:hover': { background: 'linear-gradient(90deg, #005bea 0%, #00eaff 100%)' },
              }}
              onClick={() => router.push('/dashboard')}
            >
              {t('dashboard.title')}
            </Button>
          )}

          {/* دکمه حالت تاریک/روشن */}
          <IconButton
            sx={{ mx: 1, borderRadius: 8, boxShadow: '0 0 8px #00eaff' }}
            onClick={handleThemeToggle}
            color="inherit"
          >
            {theme === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>

          {/* منوی زبان */}
          <IconButton
            sx={{ mx: 1, borderRadius: 8, boxShadow: '0 0 8px #00eaff' }}
            onClick={handleLangMenuOpen}
            color="inherit"
          >
            <LanguageIcon />
          </IconButton>
          <Menu
            anchorEl={langMenuAnchor}
            open={Boolean(langMenuAnchor)}
            onClose={handleLangMenuClose}
          >
            <MenuItem onClick={() => handleLangChange('fa')}>فارسی</MenuItem>
            <MenuItem onClick={() => handleLangChange('en')}>English</MenuItem>
          </Menu>

          {/* User Menu */}
          <Box sx={{ flexGrow: 0 }}>
            {session ? (
              <>
                <Tooltip title="تنظیمات">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar
                      alt={session.user?.name || 'User'}
                      src={session.user?.image || ''}
                      sx={{ 
                        bgcolor: 'secondary.main',
                        '&:hover': {
                          transform: 'scale(1.1)',
                        },
                        transition: 'transform 0.3s ease',
                      }}
                    />
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: '45px' }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  {settings.map((setting) => (
                    <MenuItem
                      key={setting.title}
                      onClick={() => handleSettingClick(setting)}
                      sx={{
                        '&:hover': {
                          bgcolor: 'primary.light',
                          color: 'white',
                        },
                      }}
                    >
                      <Typography textAlign="center">{setting.title}</Typography>
                    </MenuItem>
                  ))}
                </Menu>
              </>
            ) : (
              <Stack direction="row" spacing={1}>
              <Link href="/login" style={{ textDecoration: 'none' }}>
                <Button
                  variant="outlined"
                  sx={{
                    color: 'inherit',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  ورود
                </Button>
              </Link>
              <Link href="/register" style={{ textDecoration: 'none' }}>
                <Button
                  variant="contained"
                  sx={{
                    bgcolor: 'secondary.main',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'secondary.dark',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  ثبت‌نام
                </Button>
              </Link>
              </Stack>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
} 