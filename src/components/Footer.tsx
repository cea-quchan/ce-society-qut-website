import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Box, Container, Grid, Typography, IconButton, Divider } from '@mui/material';
import { FaTelegramPlane, FaInstagram, FaLinkedinIn, FaGithub, FaDiscord } from 'react-icons/fa';

const socialLinks = [
  { icon: FaTelegramPlane, url: 'https://t.me/', color: '#29b6f6' },
  { icon: FaInstagram, url: 'https://instagram.com/', color: '#e1306c' },
  { icon: FaLinkedinIn, url: 'https://linkedin.com/', color: '#0e76a8' },
  { icon: FaGithub, url: 'https://github.com/', color: '#fff' },
  { icon: FaDiscord, url: 'https://discord.com/', color: '#7289da' },
];

const quickLinks = [
  { name: 'خانه', path: '/' },
  { name: 'درباره ما', path: '/about' },
  { name: 'دوره‌ها', path: '/courses' },
  { name: 'رویدادها', path: '/events' },
  { name: 'مسابقات', path: '/competitions' },
  { name: 'اخبار', path: '/news' },
  { name: 'گالری', path: '/gallery' },
  { name: 'تماس', path: '/contact' },
];

const disabledLinks = ['/courses', '/events', '/competitions'];

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        background: 'linear-gradient(135deg, #181A20 0%, #23262f 100%)',
        color: '#f1f1f1',
        py: 7,
        mt: 8,
        borderTop: '1.5px solid rgba(34,211,238,0.08)',
        boxShadow: '0 -8px 32px 0 rgba(0,0,0,0.37)',
        position: 'relative',
        zIndex: 100,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="flex-start">
          {/* Logo & Description */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Image src="/images/logo.png" alt="Logo" width={48} height={48} style={{ filter: 'drop-shadow(0 0 8px #22d3ee)' }} />
              <Box sx={{ ml: 2, fontWeight: 900, fontSize: '1.5rem', color: '#22d3ee', letterSpacing: 1, textShadow: '0 0 8px #22d3ee', fontFamily: 'monospace', textTransform: 'uppercase' }}>
                CEQUT
              </Box>
            </Box>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2, maxWidth: 320 }}>
              ارتقای سطح علمی و حرفه‌ای دانشجویان مهندسی کامپیوتر از طریق برگزاری کارگاه‌ها، مسابقات و همایش‌های علمی و تخصصی در دانشگاه صنعتی قوچان
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.5, mb: 1 }}>
              <Link href="/privacy" style={{ textDecoration: 'none' }}>
                <Typography sx={{ color: '#22d3ee', fontWeight: 700, fontSize: '1rem', letterSpacing: 0.5, transition: 'color 0.2s', '&:hover': { color: '#10b981', textShadow: '0 0 8px #10b981' } }}>
                  حریم خصوصی
                </Typography>
              </Link>
              <Link href="/terms" style={{ textDecoration: 'none' }}>
                <Typography sx={{ color: '#22d3ee', fontWeight: 700, fontSize: '1rem', letterSpacing: 0.5, transition: 'color 0.2s', '&:hover': { color: '#10b981', textShadow: '0 0 8px #10b981' } }}>
                  شرایط استفاده
                </Typography>
              </Link>
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5, mt: 1 }}>
              {socialLinks.map((item, idx) => (
                <IconButton
                  key={idx}
                  component="a"
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: item.color,
                    background: 'rgba(34,211,238,0.08)',
                    borderRadius: 2,
                    boxShadow: `0 0 8px ${item.color}55`,
                    transition: 'all 0.2s',
                    '&:hover': {
                      color: '#10b981',
                      background: 'rgba(16,185,129,0.12)',
                      boxShadow: `0 0 16px #10b98199`,
                      transform: 'scale(1.15)',
                    },
                  }}
                >
                  <item.icon size={22} />
                </IconButton>
              ))}
            </Box>
          </Grid>
          {/* Quick Links */}
          <Grid item xs={12} md={5}>
            <Grid container spacing={2}>
              {quickLinks.slice(0, 4).map((link, idx) => (
                <Grid item xs={6} key={idx}>
                  <Link href={link.path} style={{ textDecoration: 'none', pointerEvents: disabledLinks.includes(link.path) ? 'none' : 'auto' }}>
                    <Typography
                      sx={{
                        color: disabledLinks.includes(link.path) ? '#aaa' : '#22d3ee',
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        mb: 1,
                        letterSpacing: 0.5,
                        opacity: disabledLinks.includes(link.path) ? 0.5 : 1,
                        transition: 'color 0.2s, text-shadow 0.2s',
                        '&:hover': {
                          color: disabledLinks.includes(link.path) ? '#aaa' : '#10b981',
                          textShadow: disabledLinks.includes(link.path) ? 'none' : '0 0 8px #10b981',
                        },
                      }}
                    >
                      {link.name}
                      {disabledLinks.includes(link.path) && ' (به زودی...)'}
                    </Typography>
                  </Link>
                </Grid>
              ))}
              {quickLinks.slice(4).map((link, idx) => (
                <Grid item xs={6} key={idx}>
                  <Link href={link.path} style={{ textDecoration: 'none', pointerEvents: disabledLinks.includes(link.path) ? 'none' : 'auto' }}>
                    <Typography
                      sx={{
                        color: disabledLinks.includes(link.path) ? '#aaa' : '#22d3ee',
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        mb: 1,
                        letterSpacing: 0.5,
                        opacity: disabledLinks.includes(link.path) ? 0.5 : 1,
                        transition: 'color 0.2s, text-shadow 0.2s',
                        '&:hover': {
                          color: disabledLinks.includes(link.path) ? '#aaa' : '#10b981',
                          textShadow: disabledLinks.includes(link.path) ? 'none' : '0 0 8px #10b981',
                        },
                      }}
                    >
                      {link.name}
                      {disabledLinks.includes(link.path) && ' (به زودی...)'}
                    </Typography>
                  </Link>
                </Grid>
              ))}
            </Grid>
          </Grid>
          {/* Copyright */}
          <Grid item xs={12} md={3}>
            <Box sx={{ textAlign: { xs: 'center', md: 'left' }, mt: { xs: 4, md: 0 } }}>
              {/* Empty, copyright moved below */}
            </Box>
          </Grid>
        </Grid>
      </Container>
      {/* Copyright at the very bottom */}
      <Box sx={{ width: '100%', textAlign: 'center', mt: 4, pb: 2 }}>
        <Typography sx={{ color: 'rgba(255,255,255,0.35)', fontSize: '1.02rem', fontFamily: 'Vazirmatn, monospace', letterSpacing: 0.5, fontWeight: 500 }}>
          انجمن علمی مهندسی کامپیوتر
          <span style={{ margin: '0 0.25em' }}>|</span>
          <a href="https://qiet.ac.ir" target="_blank" rel="noopener noreferrer" style={{ color: '#22d3ee', textDecoration: 'none', fontWeight: 700 }}>
            دانشگاه صنعتی قوچان
          </a>
        </Typography>
      </Box>
    </Box>
  );
};

export default Footer; 