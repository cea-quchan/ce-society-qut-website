import React, { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';
import { AppBar, Toolbar, Box, Button, IconButton, Drawer, List, ListItem, ListItemText, Divider, useMediaQuery, useTheme } from '@mui/material';
import { FaTelegramPlane, FaInstagram, FaLinkedinIn, FaGithub, FaDiscord } from 'react-icons/fa';
import MenuIcon from '@mui/icons-material/Menu';

const navLinks = [
  { name: 'خانه', path: '/' },
  { name: 'درباره ما', path: '/about' },
  { name: 'دوره‌ها', path: '/courses' },
  { name: 'رویدادها', path: '/events' },
  { name: 'مسابقات', path: '/competitions' },
  { name: 'اخبار', path: '/news' },
  { name: 'گالری', path: '/gallery' },
  { name: 'تماس', path: '/contact' },
];

const disabledLinks = ['/courses', '/events', '/competitions', '/dashboard'];

const Header = () => {
  const { t } = useTranslation('common');
  const { data: session } = useSession();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <AppBar
      position="sticky"
      elevation={0}
              sx={{ 
        background: 'rgba(18,20,30,0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1.5px solid rgba(34,211,238,0.08)',
        boxShadow: '0 8px 32px 0 rgba(0,0,0,0.37)',
        zIndex: 1201,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: 72 }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <Image 
            src="/images/logo.png" 
            alt="Logo" 
            width={48} 
            height={48} 
            style={{ filter: 'drop-shadow(0 0 8px #22d3ee)' }}
            unoptimized={true}
          />
          <Box sx={{ ml: 2, fontWeight: 900, fontSize: '1.5rem', color: '#22d3ee', letterSpacing: 1, textShadow: '0 0 8px #22d3ee' }}>
            CEQUT
          </Box>
        </Link>
        {/* Desktop Nav */}
        {!isMobile && (
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {navLinks.map((link) => (
              <Button
                key={link.path}
                component={Link}
                href={link.path}
                disabled={disabledLinks.includes(link.path)}
                sx={{
                  color: disabledLinks.includes(link.path) ? '#aaa' : '#f1f1f1',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  px: 2,
                  borderRadius: 2,
                  position: 'relative',
                  transition: 'color 0.2s',
                  pointerEvents: disabledLinks.includes(link.path) ? 'none' : 'auto',
                  opacity: disabledLinks.includes(link.path) ? 0.5 : 1,
                  '&:hover': {
                    color: disabledLinks.includes(link.path) ? '#aaa' : '#22d3ee',
                    textShadow: disabledLinks.includes(link.path) ? 'none' : '0 0 8px #22d3ee',
                  },
                  '&::after': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: 2,
                    background: 'linear-gradient(90deg,#22d3ee 0%,#10b981 100%)',
                    opacity: 0,
                    transition: 'opacity 0.2s',
                  },
                  '&:hover::after': {
                    opacity: 1,
                },
              }}
            >
                {link.name}
                {disabledLinks.includes(link.path) && (
                  <span style={{ fontSize: '0.8em', marginRight: 4 }}>(به زودی...)</span>
                )}
              </Button>
            ))}
          </Box>
        )}
        {/* Auth Buttons */}
        {!isMobile && (
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', ml: 2 }}>
            {session ? (
              <Button
                variant="contained"
                href="/dashboard"
                disabled
                sx={{
                  background: 'linear-gradient(90deg,#22d3ee 0%,#10b981 100%)',
                  color: '#181A20',
                  fontWeight: 800,
                  borderRadius: 3,
                  px: 3,
                  boxShadow: '0 0 16px #22d3ee55',
                  opacity: 0.5,
                  pointerEvents: 'none',
                }}
              >
                داشبورد (به زودی...)
              </Button>
            ) : (
              <Button
                variant="outlined"
                href="/auth/signin"
                  sx={{ 
                  border: '2px solid #22d3ee',
                  color: '#22d3ee',
                  fontWeight: 800,
                  borderRadius: 3,
                  px: 3,
                  boxShadow: '0 0 8px #22d3ee55',
                    '&:hover': {
                    background: 'rgba(34,211,238,0.08)',
                    color: '#10b981',
                    borderColor: '#10b981',
                          },
                        }}
                      >
                ورود
              </Button>
            )}
          </Box>
        )}
        {/* Mobile Menu */}
        {isMobile && (
          <IconButton onClick={() => setDrawerOpen(true)} sx={{ color: '#22d3ee' }}>
            <MenuIcon fontSize="large" />
                        </IconButton>
        )}
      </Toolbar>
      {/* Drawer for mobile */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
                      PaperProps={{
                        sx: {
            background: 'rgba(18,20,30,0.95)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            color: '#f1f1f1',
            minWidth: 260,
          },
        }}
      >
        <Box sx={{ p: 3 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', marginBottom: 2 }}>
            <Image 
              src="/images/logo.png" 
              alt="Logo" 
              width={40} 
              height={40} 
              style={{ filter: 'drop-shadow(0 0 8px #22d3ee)' }}
              unoptimized={true}
            />
            <Box sx={{ ml: 2, fontWeight: 900, fontSize: '1.2rem', color: '#22d3ee', letterSpacing: 1 }}>
              CEQUT
            </Box>
          </Link>
          <Divider sx={{ my: 2, borderColor: 'rgba(34,211,238,0.15)' }} />
          <List>
            {navLinks.map((link) => (
              <ListItem
                button
                key={link.path}
                component={Link}
                href={link.path}
                onClick={disabledLinks.includes(link.path) ? undefined : () => setDrawerOpen(false)}
                disabled={disabledLinks.includes(link.path)}
                sx={{
                  color: disabledLinks.includes(link.path) ? '#aaa' : '#f1f1f1',
                  opacity: disabledLinks.includes(link.path) ? 0.5 : 1,
                  pointerEvents: disabledLinks.includes(link.path) ? 'none' : 'auto',
                }}
              >
                <ListItemText primary={link.name + (disabledLinks.includes(link.path) ? ' (به زودی...)' : '')} sx={{ textAlign: 'right', fontWeight: 700 }} />
              </ListItem>
            ))}
          </List>
          <Divider sx={{ my: 2, borderColor: 'rgba(34,211,238,0.15)' }} />
          {session ? (
            <Button fullWidth variant="contained" href="/dashboard" sx={{ mt: 1, background: 'linear-gradient(90deg,#22d3ee 0%,#10b981 100%)', color: '#181A20', fontWeight: 800, borderRadius: 3, boxShadow: '0 0 16px #22d3ee55' }}>داشبورد</Button>
          ) : (
            <Button fullWidth variant="outlined" href="/auth/signin" sx={{ mt: 1, border: '2px solid #22d3ee', color: '#22d3ee', fontWeight: 800, borderRadius: 3, boxShadow: '0 0 8px #22d3ee55' }}>ورود</Button>
          )}
            </Box>
      </Drawer>
    </AppBar>
  );
};

export default Header; 