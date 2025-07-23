import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardMedia, Typography, Chip, Box, Avatar, Rating } from '@mui/material';
import { styled } from '@mui/material/styles';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';
import StarIcon from '@mui/icons-material/Star';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: '16px',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    transform: 'scaleX(0)',
    transition: 'transform 0.3s ease',
  },
  
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
    borderColor: '#6366f1',
  },
  
  '&:hover::before': {
    transform: 'scaleX(1)',
  },
}));

const StyledCardMedia = styled(CardMedia)(({ theme }) => ({
  height: 200,
  position: 'relative',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  
  '&:hover::before': {
    opacity: 1,
  },
}));

const PlayButton = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  background: 'rgba(255, 255, 255, 0.9)',
  borderRadius: '50%',
  width: 60,
  height: 60,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  opacity: 0,
  
  '&:hover': {
    background: '#6366f1',
    color: 'white',
    transform: 'translate(-50%, -50%) scale(1.1)',
  },
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  borderRadius: '20px',
  fontWeight: 600,
  fontSize: '0.75rem',
  height: 24,
  
  '&.beginner': {
    background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
    color: 'white',
  },
  
  '&.intermediate': {
    background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
    color: 'white',
  },
  
  '&.advanced': {
    background: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
    color: 'white',
  },
}));

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    description: string;
    image: string;
    instructor: {
      name: string;
      avatar: string;
    };
    duration: string;
    students: number;
    rating: number;
    price: number;
    level: 'beginner' | 'intermediate' | 'advanced';
    category: string;
    lessons: number;
  };
  onClick?: () => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onClick }) => {
  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    },
    hover: {
      y: -8,
      transition: { duration: 0.3, ease: "easeOut" }
    }
  };

  const formatPrice = (price: number) => {
    if (price === 0) return 'رایگان';
    return `${price.toLocaleString()} تومان`;
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case 'beginner': return 'مقدماتی';
      case 'intermediate': return 'متوسط';
      case 'advanced': return 'پیشرفته';
      default: return level;
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <StyledCard>
        <StyledCardMedia
          image={course.image}
          title={course.title}
        >
          <PlayButton>
            <PlayCircleIcon fontSize="large" />
          </PlayButton>
          
          <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
            <StyledChip
              label={getLevelText(course.level)}
              className={course.level}
              size="small"
            />
          </Box>
          
          <Box sx={{ position: 'absolute', top: 12, left: 12 }}>
            <StyledChip
              label={course.category}
              size="small"
              sx={{
                background: 'rgba(255, 255, 255, 0.9)',
                color: '#6366f1',
                fontWeight: 600,
              }}
            />
          </Box>
        </StyledCardMedia>

        <CardContent sx={{ p: 3 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              mb: 1,
              color: '#1f2937',
              lineHeight: 1.3,
              height: '2.6em',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {course.title}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: '#6b7280',
              mb: 2,
              lineHeight: 1.5,
              height: '3em',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {course.description}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar
              src={course.instructor.avatar}
              alt={course.instructor.name}
              sx={{ width: 32, height: 32, mr: 1 }}
            />
            <Typography variant="body2" sx={{ color: '#6366f1', fontWeight: 600 }}>
              {course.instructor.name}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AccessTimeIcon sx={{ fontSize: 16, color: '#6b7280' }} />
              <Typography variant="caption" sx={{ color: '#6b7280' }}>
                {course.duration}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <PeopleIcon sx={{ fontSize: 16, color: '#6b7280' }} />
              <Typography variant="caption" sx={{ color: '#6b7280' }}>
                {course.students.toLocaleString()} دانشجو
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <StarIcon sx={{ fontSize: 16, color: '#fbbf24' }} />
              <Typography variant="caption" sx={{ color: '#6b7280' }}>
                {course.rating}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: course.price === 0 ? '#10b981' : '#6366f1',
              }}
            >
              {formatPrice(course.price)}
            </Typography>
            
            <Typography variant="caption" sx={{ color: '#6b7280' }}>
              {course.lessons} درس
            </Typography>
          </Box>
        </CardContent>
      </StyledCard>
    </motion.div>
  );
};

export default CourseCard; 