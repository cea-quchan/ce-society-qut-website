import React from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetServerSideProps } from 'next';
import SEO from '@/components/common/SEO';
import SchemaMarkup from '@/components/common/SchemaMarkup';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { Box, Container, Typography, Grid, Card, CardContent, Avatar, List, ListItem, ListItemAvatar, ListItemText } from '@mui/material';
import { styled } from '@mui/material/styles';
import SchoolIcon from '@mui/icons-material/School';
import GroupIcon from '@mui/icons-material/Group';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const GlassCard = styled(Card)(({ theme }) => ({
  background: 'rgba(24,26,32,0.7)',
  border: '1px solid rgba(255,255,255,0.06)',
  boxShadow: '0 8px 32px 0 rgba(0,0,0,0.37)',
  borderRadius: 20,
  color: '#f1f1f1',
  transition: 'all 0.2s',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    boxShadow: '0 12px 40px 0 rgba(16,185,129,0.18)',
    transform: 'translateY(-4px) scale(1.03)',
  },
}));

const teamMembers = [
  {
    name: 'دکتر محمدی',
    role: 'رئیس انجمن',
    image: '/images/team/member1.jpg',
    description: 'استادیار گروه مهندسی کامپیوتر',
  },
  {
    name: 'دکتر احمدی',
    role: 'نایب رئیس',
    image: '/images/team/member2.jpg',
    description: 'استادیار گروه مهندسی کامپیوتر',
  },
  {
    name: 'مهندس رضایی',
    role: 'دبیر انجمن',
    image: '/images/team/member3.jpg',
    description: 'دانشجوی دکتری مهندسی کامپیوتر',
  },
];

const achievements = [
  {
    title: 'برگزاری کارگاه‌های آموزشی',
    description: 'برگزاری بیش از ۵۰ کارگاه آموزشی در حوزه‌های مختلف مهندسی کامپیوتر',
    icon: <SchoolIcon fontSize="large" color="primary" />,
  },
  {
    title: 'تعداد اعضا',
    description: 'بیش از ۲۰۰ عضو فعال در انجمن علمی',
    icon: <GroupIcon fontSize="large" color="primary" />,
  },
  {
    title: 'دستاوردها',
    description: 'کسب رتبه‌های برتر در مسابقات کشوری و بین‌المللی',
    icon: <EmojiEventsIcon fontSize="large" color="primary" />,
  },
];

export default function About() {
  const { t } = useTranslation('common');

  const achievements = [
    {
      title: t('achievement_1_title'),
      description: t('achievement_1_description'),
    },
    {
      title: t('achievement_2_title'),
      description: t('achievement_2_description'),
    },
    {
      title: t('achievement_3_title'),
      description: t('achievement_3_description'),
    },
  ];

  const boardMembers = [
    {
      name: t('board_member_1_name'),
      role: t('board_member_1_role'),
      image: '/images/team/member1.jpg',
    },
    {
      name: t('board_member_2_name'),
      role: t('board_member_2_role'),
      image: '/images/team/member2.jpg',
    },
    {
      name: t('board_member_3_name'),
      role: t('board_member_3_role'),
      image: '/images/team/member3.jpg',
    },
  ];

  return (
    <Box sx={{ bgcolor: '#000', minHeight: '100vh', width: '100%' }}>
      <SEO
        title="درباره ما"
        description="معرفی انجمن علمی مهندسی کامپیوتر دانشگاه صنعتی قوچان"
      />
      <SchemaMarkup
        type="Organization"
        data={{
          name: 'انجمن علمی مهندسی کامپیوتر',
          url: process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com',
          logo: '/images/logo.png',
        }}
      />
      <Container maxWidth="lg" sx={{ pt: 3, pb: 1 }}>
        <Breadcrumbs showHome items={[{ label: 'درباره ما', href: '/about' }]} />
      </Container>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ my: 4 }}>
          <Typography variant="h3" fontWeight={900} color="#22d3ee" align="center" mb={2} sx={{ letterSpacing: 1, textShadow: '0 0 16px #22d3ee99' }}>
            درباره انجمن علمی مهندسی کامپیوتر
          </Typography>
          <Typography variant="h6" color="text.secondary" align="center" mb={6}>
            {t('about_subtitle')}
          </Typography>
        </Box>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <GlassCard>
              <Typography variant="h5" fontWeight={800} color="#fff" mb={2}>
                {t('about_us')}
              </Typography>
              <Typography variant="body1" color="rgba(255,255,255,0.8)">
                {t('about_description')}
              </Typography>
            </GlassCard>
          </Grid>
          <Grid item xs={12} md={6}>
            <GlassCard>
              <Typography variant="h5" fontWeight={800} color="#fff" mb={2}>
                {t('our_achievements')}
              </Typography>
              <Grid container spacing={2}>
                {achievements.map((achievement, index) => (
                  <Grid item xs={12} key={index}>
                    <Typography variant="subtitle1" fontWeight={700} color="#22d3ee">
                      {achievement.title}
                    </Typography>
                    <Typography variant="body2" color="rgba(255,255,255,0.7)" mb={2}>
                      {achievement.description}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            </GlassCard>
          </Grid>
        </Grid>
        <Box sx={{ my: 8 }}>
          <Typography variant="h4" fontWeight={900} color="#22d3ee" align="center" mb={4}>
            اعضای هیئت مدیره
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            {boardMembers.map((member, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <GlassCard sx={{ alignItems: 'center', textAlign: 'center', py: 4 }}>
                  <Avatar src={member.image} alt={member.name} sx={{ width: 96, height: 96, mx: 'auto', mb: 2, border: '3px solid #22d3ee', boxShadow: '0 0 16px #22d3ee55' }} />
                  <Typography variant="h6" fontWeight={800} color="#fff" mb={1}>{member.name}</Typography>
                  <Typography variant="subtitle2" color="#22d3ee" fontWeight={700} mb={1}>{member.role}</Typography>
                </GlassCard>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'fa', ['common'])),
    },
  };
}; 