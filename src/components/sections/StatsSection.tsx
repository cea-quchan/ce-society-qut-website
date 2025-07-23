import React from 'react';
import { Box, Grid, Typography, Paper } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import MenuBookIcon from '@mui/icons-material/MenuBook';

const StatsSection = () => {
  const stats = [
    {
      icon: <PeopleIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      value: '1000+',
      label: 'دانشجویان',
    },
    {
      icon: <SchoolIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      value: '50+',
      label: 'اساتید',
    },
    {
      icon: <EmojiEventsIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      value: '100+',
      label: 'رویدادها',
    },
    {
      icon: <MenuBookIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      value: '200+',
      label: 'دوره‌ها',
    },
  ];

  return (
    <Box component="section" className="section" sx={{ py: 8, bgcolor: 'background.paper' }}>
      <Grid container spacing={4} justifyContent="center">
        {stats.map((stat, index) => (
          <Grid item xs={6} md={3} key={index}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-8px)',
                },
              }}
            >
              <Box sx={{ mb: 2 }}>{stat.icon}</Box>
              <Typography variant="h4" component="div" gutterBottom color="primary.main" fontWeight="bold">
                {stat.value}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {stat.label}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default StatsSection; 