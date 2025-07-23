import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box, Avatar } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';

const accent = '#22d3ee';

const AdminHeader: React.FC = () => (
  <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: '#181A20', color: accent, height: 56, justifyContent: 'center', boxShadow: '0 2px 8px 0 #181A2022' }}>
    <Toolbar sx={{ minHeight: 56, display: 'flex', justifyContent: 'space-between' }}>
      <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 900, fontFamily: 'monospace', letterSpacing: 1 }}>
        داشبورد مدیریت
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton color="inherit" sx={{ color: accent }}>
          <SettingsIcon />
        </IconButton>
        <Avatar sx={{ bgcolor: accent, color: '#181A20', fontWeight: 700, width: 32, height: 32, fontSize: 18 }}>A</Avatar>
      </Box>
    </Toolbar>
  </AppBar>
);

export default AdminHeader; 