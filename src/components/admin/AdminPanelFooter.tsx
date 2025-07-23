import React from 'react';
import { Box, Typography } from '@mui/material';

const accent = '#22d3ee';

const AdminPanelFooter: React.FC = () => (
  <Box
    sx={{
      width: '100%',
      py: 2,
      bgcolor: 'rgba(24,26,32,0.85)',
      borderTop: `1.5px solid ${accent}55`,
      textAlign: 'center',
      mt: 'auto',
      backdropFilter: 'blur(12px)',
      boxShadow: `0 0 32px 0 ${accent}33`,
      borderRadius: '24px 24px 0 0',
      transition: 'box-shadow 0.2s, border-radius 0.2s',
    }}
  >
    <Typography
      sx={{
        color: accent,
        fontSize: '1rem',
        fontWeight: 700,
        textShadow: `0 0 8px ${accent}, 0 0 2px #fff`,
        letterSpacing: 1,
      }}
    >
      © {new Date().getFullYear()} داشبورد مدیریت | انجمن علمی مهندسی کامپیوتر
    </Typography>
  </Box>
);

export default AdminPanelFooter;
