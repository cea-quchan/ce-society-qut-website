import { useRouter } from 'next/router';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  IconButton,
  useTheme,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { faIR } from 'date-fns/locale';
import Image from 'next/image';

interface GalleryItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  createdAt: string;
  createdBy: {
    name: string;
  };
}

export default function GalleryItemDetail() {
  const router = useRouter();
  const { id } = router.query;
  const theme = useTheme();

  const { data: item, isLoading } = useQuery<GalleryItem>({
    queryKey: ['gallery', id],
    queryFn: async () => {
      const res = await fetch(`/api/gallery/${id}`);
      if (!res.ok) throw new Error('Failed to fetch gallery item');
      return res.json();
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h5" align="center">
          در حال بارگذاری...
        </Typography>
      </Container>
    );
  }

  if (!item) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h5" align="center">
          تصویر یافت نشد
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <IconButton
          onClick={() => router.back()}
          sx={{ mb: 2 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" gutterBottom>
          {item.title}
        </Typography>
        <Chip
          label={item.category}
          color="primary"
          sx={{ mb: 2 }}
        />
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {format(new Date(item.createdAt), 'd MMMM yyyy', { locale: faIR })}
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper
            sx={{
              overflow: 'hidden',
              borderRadius: 2,
              boxShadow: theme.shadows[2],
            }}
          >
            <Image
              src={item.imageUrl}
              alt={item.title}
              width={800}
              height={600}
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: '70vh',
                objectFit: 'contain',
              }}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 3,
              height: '100%',
              borderRadius: 2,
              boxShadow: theme.shadows[2],
            }}
          >
            <Typography variant="h6" gutterBottom>
              توضیحات
            </Typography>
            <Typography variant="body1" paragraph>
              {item.description}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              آپلود شده توسط: {item.createdBy.name}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
} 