import React, { useState, useEffect } from 'react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetServerSideProps } from 'next';
import SEO from '@/components/common/SEO';
import SchemaMarkup from '@/components/common/SchemaMarkup';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { Box, Container, Grid, TextField, InputAdornment, Typography, Tabs, Tab, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import { format } from 'date-fns-jalali';
import nextI18NextConfig from '../../next-i18next.config.cjs';
import Image from 'next/image';

const GlassCard = styled('div')(({ theme }) => ({
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

// Define an Event type
interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  capacity: number;
  registeredCount: number;
  image: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  type: 'workshop' | 'seminar' | 'competition';
}

const eventTypes = [
  'همه رویدادها',
  'workshop',
  'seminar',
  'competition',
];

const getTypeText = (type: Event['type'] | string) => {
  switch (type) {
    case 'workshop':
      return 'کارگاه';
    case 'seminar':
      return 'همایش';
    case 'competition':
      return 'مسابقه';
    default:
      return type;
  }
};

const getStatusColor = (status: Event['status'] | string) => {
  switch (status) {
    case 'upcoming':
      return 'primary';
    case 'ongoing':
      return 'success';
    case 'completed':
      return 'default';
    default:
      return 'default';
  }
};

const getStatusText = (status: Event['status'] | string) => {
  switch (status) {
    case 'upcoming':
      return 'به زودی';
    case 'ongoing':
      return 'در حال برگزاری';
    case 'completed':
      return 'برگزار شده';
    default:
      return status;
  }
};

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('همه رویدادها');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/events');
        const json = await res.json();
        if (json.success) {
          setEvents(json.data.events);
          setError(null);
        } else {
          setError(json.error?.message || 'خطا در دریافت رویدادها');
        }
      } catch (err) {
        setError('خطا در دریافت رویدادها');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const eventsArray = Array.isArray(events) ? events : [];
  const filteredEvents = eventsArray.filter(event => {
    const matchesType = selectedType === 'همه رویدادها' || event.type === selectedType;
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <Box sx={{ bgcolor: '#000', minHeight: '100vh', width: '100%' }}>
      <ErrorBoundary>
        <SEO
          title="رویدادها"
          description="رویدادهای علمی و آموزشی انجمن علمی مهندسی کامپیوتر"
        />
        <SchemaMarkup
          type="Organization"
          data={{
            name: 'رویدادهای انجمن علمی',
            url: process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com',
            logo: '/images/logo.png',
          }}
        />
        <Container maxWidth="lg" sx={{ pt: 3, pb: 1 }}>
          <Breadcrumbs showHome items={[{ label: 'رویدادها', href: '/events' }]} />
        </Container>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Typography variant="h3" fontWeight={900} color="#22d3ee" align="center" mb={2} sx={{ letterSpacing: 1, textShadow: '0 0 16px #22d3ee99' }}>
            رویدادها
          </Typography>
          <Typography variant="h6" color="text.secondary" align="center" mb={6}>
            رویدادهای علمی، آموزشی و مسابقات انجمن علمی مهندسی کامپیوتر
          </Typography>
          <Box sx={{ mb: 4 }}>
            <Tabs
              value={selectedType}
              onChange={(_, newValue) => setSelectedType(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{
                bgcolor: 'background.paper',
                borderRadius: 2,
                boxShadow: 1,
              }}
            >
              {eventTypes.map((type) => (
                <Tab
                  key={type}
                  label={type === 'همه رویدادها' ? type : getTypeText(type)}
                  value={type}
                  sx={{ fontWeight: 'bold' }}
                />
              ))}
            </Tabs>
          </Box>
          <Box sx={{ mb: 4 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="جستجو در رویدادها..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
            />
          </Box>
          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <Typography variant="body1" color="error" align="center">
              {error}
            </Typography>
          ) : (
            <Grid container spacing={4} justifyContent="center">
              {filteredEvents.length === 0 ? (
                <Grid item xs={12}>
                  <GlassCard>
                    <Typography align="center" color="text.secondary">
                      هیچ رویدادی یافت نشد.
                    </Typography>
                  </GlassCard>
                </Grid>
              ) : (
                filteredEvents.map((item) => (
                  <Grid item xs={12} sm={6} md={4} key={item.id}>
                    <GlassCard>
                      <Box sx={{ borderRadius: 3, overflow: 'hidden', mb: 2 }}>
                        <Image
                          src={item.image}
                          alt={item.title}
                          width={400}
                          height={200}
                          style={{ width: '100%', height: 'auto', objectFit: 'cover', borderRadius: 16, boxShadow: '0 4px 24px 0 rgba(34,211,238,0.12)' }}
                        />
                      </Box>
                      <Typography variant="h6" fontWeight={800} color="#fff" mb={1} sx={{ letterSpacing: 0.5 }}>
                        {item.title}
                      </Typography>
                      <Typography variant="body2" color="rgba(255,255,255,0.7)" mb={2}>
                        {item.description}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        <Chip label={getTypeText(item.type)} size="small" color="primary" />
                        <Chip label={getStatusText(item.status)} size="small" color={getStatusColor(item.status)} />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                        <Typography variant="caption" color="#22d3ee" fontWeight={700}>
                          {item.location}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {format(item.date, 'yyyy/MM/dd')}
                        </Typography>
                      </Box>
                    </GlassCard>
                  </Grid>
                ))
              )}
            </Grid>
          )}
        </Container>
      </ErrorBoundary>
    </Box>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'fa', ['common'], nextI18NextConfig)),
    },
  };
}; 