import { Card, CardContent, Typography, Box, Chip, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';

interface CourseCardProps {
  title: string;
  description: string;
  instructor: string;
  duration: string;
  capacity: string;
  price: string;
  level: string;
}

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
  },
}));

const CourseCard = ({
  title,
  description,
  instructor,
  duration,
  capacity,
  price,
  level,
}: CourseCardProps) => {
  return (
    <StyledCard>
      <CardContent>
        <Stack direction="row" spacing={1} mb={2}>
          <Chip label={level} color="primary" size="small" />
        </Stack>
        
        <Typography variant="h5" component="h2" gutterBottom>
          {title}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          {description}
        </Typography>
        
        <Box mt={2}>
          <Typography variant="body2">
            <strong>مدرس:</strong> {instructor}
          </Typography>
          <Typography variant="body2">
            <strong>مدت زمان:</strong> {duration}
          </Typography>
          <Typography variant="body2">
            <strong>ظرفیت:</strong> {capacity}
          </Typography>
          <Typography variant="body2" color="primary.main" sx={{ mt: 1 }}>
            <strong>هزینه:</strong> {price}
          </Typography>
        </Box>
      </CardContent>
    </StyledCard>
  );
};

export default CourseCard; 