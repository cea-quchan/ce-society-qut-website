import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box, Avatar } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuIcon from '@mui/icons-material/Menu';
import { useSession, signOut } from 'next-auth/react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

const accent = '#22d3ee';

interface AdminPanelHeaderProps {
  onMenuClick?: () => void;
}

const AdminPanelHeader: React.FC<AdminPanelHeaderProps> = ({ onMenuClick }) => {
  const { data: session } = useSession();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar
      position="static"
      sx={{
        bgcolor: 'rgba(24,26,32,0.85)',
        color: accent,
        height: 64,
        justifyContent: 'center',
        boxShadow: '0 4px 24px 0 #22d3ee33',
        borderRadius: '0 0 24px 24px',
        direction: 'rtl',
        backdropFilter: 'blur(12px)',
        transition: 'box-shadow 0.2s, border-radius 0.2s',
      }}
    >
      <Toolbar sx={{ minHeight: 64, display: 'flex', justifyContent: 'space-between', flexDirection: 'row-reverse', px: { xs: 1, md: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton color="inherit" sx={{ color: accent, transition: 'color 0.2s' }} onClick={onMenuClick}>
            <MenuIcon />
          </IconButton>
          {session && (
            <>
              <IconButton onClick={handleMenu} color="inherit" sx={{ p: 0 }}>
                <Avatar sx={{ bgcolor: accent, color: '#181A20', fontWeight: 700, width: 40, height: 40, fontSize: 20, boxShadow: '0 0 12px #22d3ee99' }}>
                  {session.user?.name?.[0]?.toUpperCase() || 'A'}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <MenuItem onClick={() => { handleClose(); window.location.href = '/dashboard'; }}>پروفایل</MenuItem>
                <MenuItem onClick={() => { handleClose(); window.location.href = '/dashboard/admin/settings'; }}>تنظیمات</MenuItem>
                <MenuItem onClick={() => { handleClose(); signOut(); }}>خروج</MenuItem>
              </Menu>
            </>
          )}
          <IconButton color="inherit" sx={{ color: accent, transition: 'color 0.2s' }}>
            <SettingsIcon />
          </IconButton>
        </Box>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 900, fontFamily: 'monospace', letterSpacing: 1, flex: 1, textAlign: 'center', textShadow: '0 0 8px #22d3ee, 0 0 2px #fff' }}>
          داشبورد مدیریت
        </Typography>
        <Box sx={{ width: 120 }} /> {/* Spacer for symmetry */}
      </Toolbar>
    </AppBar>
  );
};

export default AdminPanelHeader; 