import React, { useState, useEffect, useCallback } from 'react';
import { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import nextI18NextConfig from '../../../next-i18next.config.cjs';
import {
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Chip,
  TextField,
  InputAdornment
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import SEO from '@/components/common/SEO';
import SchemaMarkup from '@/components/common/SchemaMarkup';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import Breadcrumbs from '@/components/common/Breadcrumbs';

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
}

export default function FAQPage() {
  const { t } = useTranslation('common');
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });

  const categories = ['همه', 'ثبت‌نام', 'پرداخت', 'دوره‌ها', 'فنی'];

  const fetchFaqs = useCallback(async (search = '', category = '', page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '10');
      if (search) params.append('search', search);
      if (category && category !== 'همه') params.append('category', category);
      const res = await fetch(`/api/faq?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setFaqs(json.data.faqs);
        setPagination(json.data.pagination);
      } else {
        setError(json.error?.message || 'خطا در دریافت سوالات');
      }
    } catch (err) {
      setError('خطا در دریافت سوالات');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFaqs(searchTerm, selectedCategory || '', 1);
  }, [searchTerm, selectedCategory, fetchFaqs]);

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category === selectedCategory ? null : category);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <ErrorBoundary>
      <SEO
        title="سوالات متداول"
        description="پاسخ به سوالات متداول کاربران انجمن علمی مهندسی کامپیوتر"
      />
      <SchemaMarkup
        type="FAQPage"
        data={{
          mainEntity: faqs.map(faq => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer,
            },
          })),
        }}
      />
      <Breadcrumbs
        items={[
          { label: 'خانه', href: '/' },
          { label: 'سوالات متداول', href: '/faq' },
        ]}
      />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box textAlign="center" mb={6}>
          <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
            سوالات متداول
          </Typography>
          <Typography variant="h6" color="text.secondary">
            پاسخ سوالات رایج شما در اینجا
          </Typography>
        </Box>

        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <Box textAlign="center" py={4}>
            <Typography variant="h6" color="error.main">{error}</Typography>
          </Box>
        ) : (
          <>
            <Box mb={4}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="جستجو در سوالات..."
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 3 }}
              />

              <Box display="flex" flexWrap="wrap" gap={1}>
                {categories.map((category) => (
                  <Chip
                    key={category}
                    label={category}
                    onClick={() => handleCategoryClick(category)}
                    color={selectedCategory === category ? 'primary' : 'default'}
                    variant={selectedCategory === category ? 'filled' : 'outlined'}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Box>
            </Box>

            <Box>
              {faqs.map((faq) => (
                <Accordion key={faq.id} sx={{ mb: 2, borderRadius: 2 }}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{ fontWeight: 600 }}
                  >
                    <Typography variant="h6">{faq.question}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body1" color="text.secondary" lineHeight={1.8}>
                      {faq.answer}
                    </Typography>
                    <Box mt={2}>
                      <Chip
                        label={faq.category}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>

            {faqs.length === 0 && (
              <Box textAlign="center" py={4}>
                <Typography variant="h6" color="text.secondary">
                  هیچ سوالی یافت نشد
                </Typography>
              </Box>
            )}
          </>
        )}
      </Container>
    </ErrorBoundary>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'fa', ['common'], nextI18NextConfig)),
    },
  };
}; 