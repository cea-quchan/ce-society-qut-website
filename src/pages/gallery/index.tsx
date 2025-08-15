import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  useTheme,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Image from 'next/image';

interface GalleryItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  createdAt: string;
}

const PAGE_SIZE = 9;

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);
  const theme = useTheme();

  // Fetch paginated gallery items
  const fetchGallery = useCallback(async (pageNum: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/gallery?page=${pageNum}&limit=${PAGE_SIZE}`);
      if (!res.ok) throw new Error('خطا در دریافت تصاویر گالری');
      const data = await res.json();
      const items: GalleryItem[] = data?.data?.items || [];
      setGalleryItems(prev => pageNum === 1 ? items : [...prev, ...items]);
      setHasMore(items.length === PAGE_SIZE);
    } catch (e: any) {
      setError(e.message || 'خطا در دریافت تصاویر');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load and on page change
  useEffect(() => {
    fetchGallery(page);
  }, [page, fetchGallery]);

  // Infinite scroll observer
  const lastItemRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new window.IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => prev + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore]);

  const handleImageClick = (item: GalleryItem) => {
    setSelectedImage(item);
  };

  const handleCloseDialog = () => {
    setSelectedImage(null);
  };

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

      <Grid container spacing={2}>
        {galleryItems.map((item, idx) => (
          <Grid
            item
            key={item.id}
            xs={12}
            sm={6}
            md={4}
            ref={idx === galleryItems.length - 1 ? lastItemRef : undefined}
          >
            <Card
              sx={{
                ...(theme.glassCard || {
                  background: 'rgba(255,255,255,0.08)',
                  boxShadow: '0 4px 32px 0 rgba(0,0,0,0.12)',
                  backdropFilter: 'blur(8px)'
                }),
                p: 1,
                position: 'relative',
                cursor: 'pointer',
                height: { xs: 240, sm: 260, md: 280 },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
              }}
              onClick={() => handleImageClick(item)}
            >
              <Box sx={{ position: 'relative', width: '100%', height: { xs: 140, sm: 180, md: 200 }, borderRadius: 2, overflow: 'hidden' }}>
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
                  loading="lazy"
                  placeholder="blur"
                  blurDataURL="/images/placeholder.png"
                />
              </Box>
              <CardContent sx={{ flex: 1, minHeight: 60 }}>
                <Typography variant="subtitle1" sx={{ color: theme.palette.primary.main, fontWeight: 700, mt: 1, fontSize: { xs: '1rem', sm: '1.1rem' } }}>{item.title}</Typography>
                {item.description && <Typography variant="body2" sx={{ color: '#fff', opacity: 0.8, fontSize: { xs: '0.85rem', sm: '0.95rem' } }}>{item.description}</Typography>}
                {item.category && <Typography variant="caption" sx={{ color: theme.palette.secondary.main, fontWeight: 600, mt: 0.5, display: 'block' }}>دسته‌بندی: {item.category}</Typography>}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <CircularProgress color="primary" />
        </Box>
      )}
      {error && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <Typography color="error" fontWeight={700}>{error}</Typography>
        </Box>
      )}
      {!hasMore && !isLoading && galleryItems.length > 0 && (
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Typography color="text.secondary">همه تصاویر بارگذاری شد.</Typography>
        </Box>
      )}
      {galleryItems.length === 0 && !isLoading && !error && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">تصویری برای نمایش وجود ندارد.</Typography>
        </Box>
      )}

      <Dialog
        open={Boolean(selectedImage)}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedImage && (
          <>
            <DialogContent sx={{ p: 0, position: 'relative', bgcolor: '#111' }}>
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
                  zIndex: 2,
                }}
              >
                <CloseIcon />
              </IconButton>
              <Box sx={{ width: '100%', position: 'relative', minHeight: { xs: 200, sm: 350 }, bgcolor: '#111' }}>
                <Image
                  src={selectedImage.imageUrl}
                  alt={selectedImage.title}
                  width={900}
                  height={600}
                  style={{ width: '100%', height: 'auto', maxHeight: '80vh', objectFit: 'contain', borderRadius: 8 }}
                  loading="eager"
                  sizes="100vw"
                />
              </Box>
              <Box sx={{ p: { xs: 2, sm: 3 } }}>
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