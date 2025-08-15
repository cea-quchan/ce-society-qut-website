import React from 'react';
import { Box, Typography } from '@mui/material';

interface VideoCardProps {
  video: any;
  getEmbedUrl: (video: any) => string | null;
  PLATFORM_ICONS: Record<string, JSX.Element>;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, getEmbedUrl, PLATFORM_ICONS }) => (
  <Box sx={{
    position: 'relative',
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
    boxShadow: '0 2px 12px 0 rgba(34, 211, 238, 0.10)',
    background: 'rgba(24,26,32,0.97)',
    border: '1.5px solid rgba(34,211,238,0.10)',
    transition: 'all 0.2s',
    minHeight: 200,
    mb: 1.5,
    p: 1.5,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 1,
    '&:hover': {
      boxShadow: '0 6px 24px 0 rgba(34, 211, 238, 0.18)',
      borderColor: '#22d3ee',
      transform: 'translateY(-2px) scale(1.02)',
    },
  }}>
    {/* Platform Icon */}
    <Box sx={{ 
      position: 'absolute', 
      top: 10, 
      right: 10, 
      zIndex: 2,
      background: 'rgba(24,26,32,0.9)',
      borderRadius: 2,
      p: 0.5,
      backdropFilter: 'blur(8px)'
    }}>
      {PLATFORM_ICONS[video.platform] || PLATFORM_ICONS['direct']}
    </Box>
    {/* Video Container */}
    <Box sx={{
      position: 'relative',
      width: '100%',
      aspectRatio: '16/9',
      background: '#000',
      borderRadius: '10px',
      overflow: 'hidden',
      mb: 1,
    }}>
      {video.platform === 'direct' ? (
        <video
          src={getEmbedUrl(video) || ''}
          controls
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            borderRadius: '10px'
          }}
          title="ویدیو"
        />
      ) : getEmbedUrl(video) ? (
        <iframe
          src={getEmbedUrl(video)!}
          allowFullScreen
          style={{ 
            width: '100%', 
            height: '100%', 
            border: 'none',
            borderRadius: '10px'
          }}
          title={video.platform}
        />
      ) : (
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
        }}>
          <Typography variant="body2" sx={{ 
            color: '#fff', 
            textAlign: 'center', 
            p: 2,
            opacity: 0.7
          }}>
            لینک ویدیوی وارد شده پشتیبانی نمی‌شود
          </Typography>
        </Box>
      )}
    </Box>
    {/* Video Title */}
    <Typography
      variant="subtitle1"
      sx={{
        color: '#fff',
        fontWeight: 800,
        fontSize: '1.05rem',
        textAlign: 'center',
        mb: 0.5,
        mt: 0.5,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        width: '100%',
        letterSpacing: 0.2,
      }}
    >
      {video.title || 'بدون عنوان'}
    </Typography>
    {/* Description */}
    {video.description && (
      <Typography variant="body2" sx={{ color: '#22d3ee', textAlign: 'center', fontWeight: 600, fontSize: '0.9rem', lineHeight: 1.4, mt: 0.5 }}>
        {video.description}
      </Typography>
    )}
  </Box>
);

export default VideoCard; 