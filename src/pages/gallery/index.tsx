import { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';

interface GalleryItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  createdAt: string;
}

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const theme = useTheme();

  const { data, isLoading } = useQuery<any>({
    queryKey: ['gallery'],
    queryFn: async () => {
      const res = await fetch('/api/gallery');
      if (!res.ok) throw new Error('Failed to fetch gallery items');
      return res.json();
    },
  });

  // Extract items array safely from API response
  const galleryItems: GalleryItem[] = data?.data?.items || [];

  const handleImageClick = (item: GalleryItem) => {
    setSelectedImage(item);
  };

  const handleCloseDialog = () => {
    setSelectedImage(null);
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h5" align="center">
          در حال بارگذاری...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{
          textAlign: 'center',
          mb: 4,
          color: theme.palette.text.primary,
        }}
      >
        گالری تصاویر
      </Typography>

      <Grid container spacing={4}>
        {galleryItems?.map((item) => (
          <Grid item key={item.id} xs={12} sm={6} md={4}>
            <Card sx={{ ...(theme.glassCard || { background: 'rgba(255,255,255,0.08)', boxShadow: '0 4px 32px 0 rgba(0,0,0,0.12)', backdropFilter: 'blur(8px)' }), p: 1, position: 'relative', cursor: 'pointer' }} onClick={() => handleImageClick(item)}>
              <CardMedia
                component="img"
                image={item.imageUrl}
                alt={item.title}
                sx={{ width: '100%', borderRadius: 2, objectFit: 'cover', maxHeight: 220 }}
              />
              <CardContent>
                <Typography variant="subtitle1" sx={{ color: theme.palette.primary.main, fontWeight: 700, mt: 1 }}>{item.title}</Typography>
                {item.description && <Typography variant="body2" sx={{ color: '#fff', opacity: 0.8 }}>{item.description}</Typography>}
                {item.category && <Typography variant="caption" sx={{ color: theme.palette.secondary.main, fontWeight: 600, mt: 0.5, display: 'block' }}>دسته‌بندی: {item.category}</Typography>}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={Boolean(selectedImage)}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedImage && (
          <>
            <DialogContent sx={{ p: 0, position: 'relative' }}>
              <IconButton
                onClick={handleCloseDialog}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: 8,
                  color: 'white',
                  bgcolor: 'rgba(0, 0, 0, 0.5)',
                  '&:hover': {
                    bgcolor: 'rgba(0, 0, 0, 0.7)',
                  },
                }}
              >
                <CloseIcon />
              </IconButton>
              <Image
                src={selectedImage.imageUrl}
                alt={selectedImage.title}
                width={800}
                height={600}
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '80vh',
                  objectFit: 'contain',
                }}
              />
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {selectedImage.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedImage.description}
                </Typography>
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Container>
  );
} 