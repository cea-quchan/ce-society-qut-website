import React from 'react';
import { Box, Typography } from '@mui/material';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';

interface NewsCardProps {
  news: any;
  getNewsImages: (news: any) => { url: string }[];
  formatDate: (date: string) => string;
  truncateText: (text: string, maxLength: number) => string;
}

const NewsCard: React.FC<NewsCardProps> = ({ news, getNewsImages, formatDate, truncateText }) => (
  <Box sx={{ minHeight: 320, borderRadius: 4, overflow: 'hidden', background: 'rgba(24,26,32,0.95)', boxShadow: '0 4px 24px 0 rgba(34,211,238,0.10)', border: '2px solid rgba(255,255,255,0.1)', p: 2 }}>
    {/* Image(s) - Mini slider */}
    {getNewsImages(news).length > 0 && (
      <Box sx={{ position: 'relative', borderRadius: 16, overflow: 'hidden', mb: 2 }}>
        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={8}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          style={{ borderRadius: 16 }}
        >
          {getNewsImages(news).map((img, idx) => (
            <SwiperSlide key={idx}>
              <Image
                src={img.url}
                alt={news.title}
                width={400}
                height={200}
                style={{ width: '100%', height: 'auto', objectFit: 'cover', borderRadius: 16, boxShadow: '0 4px 24px 0 rgba(34,211,238,0.12)' }}
                loading="lazy"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </Box>
    )}
    <Typography
      variant="h6"
      fontWeight={800}
      color="#fff"
      mb={1}
      sx={{ letterSpacing: 0.5, fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.3rem' }, textAlign: { xs: 'center', md: 'right' } }}
    >
      {news.title}
    </Typography>
    <Typography variant="body2" color="rgba(255,255,255,0.7)" mb={2}>
      {truncateText(news.summary, 120)}
    </Typography>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
      <Typography variant="caption" color="#22d3ee" fontWeight={700}>
        {formatDate(news.date)}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {news.author}
      </Typography>
    </Box>
  </Box>
);

export default NewsCard; 