import { Card, CardContent, Typography, Box, Chip, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';

interface EventCardProps {
  title: string;
  description: string;
  date: string;
  location: string;
  capacity: string;
  tags: string[];
  type: 'workshop' | 'competition' | 'conference';
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

const getTypeColor = (type: string) => {
  switch (type) {
    case 'workshop':
      return 'success';
    case 'competition':
      return 'error';
    case 'conference':
      return 'info';
    default:
      return 'default';
  }
};

const EventCard = ({
  title,
  description,
  date,
  location,
  capacity,
  tags,
  type,
}: EventCardProps) => {
  return (
    <StyledCard>
      <CardContent>
        <Stack direction="row" spacing={1} mb={2}>
          <Chip label={type} color={getTypeColor(type)} size="small" />
        </Stack>
        
        <Typography variant="h5" component="h2" gutterBottom>
          {title}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          {description}
        </Typography>
        
        <Box mt={2}>
          <Typography variant="body2">
            <strong>تاریخ:</strong> {date}
          </Typography>
          <Typography variant="body2">
            <strong>مکان:</strong> {location}
          </Typography>
          <Typography variant="body2">
            <strong>ظرفیت:</strong> {capacity}
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={1} mt={2}>
          {tags.map((tag, index) => (
            <Chip key={index} label={tag} size="small" variant="outlined" />
          ))}
        </Stack>
      </CardContent>
    </StyledCard>
  );
};

export default EventCard; 