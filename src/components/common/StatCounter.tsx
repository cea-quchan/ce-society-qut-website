import { useEffect, useState, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import { motion, useAnimation, useInView } from 'framer-motion';
import { ReactNode } from 'react';

interface StatCounterProps {
  end: number;
  title: string;
  icon: ReactNode;
  duration?: number;
}

export default function StatCounter({ end, title, icon, duration = 2 }: StatCounterProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const controls = useAnimation();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
      let start = 0;
      const increment = end / (duration * 60); // 60fps
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 1000 / 60);
      return () => clearInterval(timer);
    }
  }, [isInView, end, duration, controls]);

  return (
    <Box
      ref={ref}
      component={motion.div}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      sx={{
        textAlign: 'center',
        p: 3,
        borderRadius: 2,
        bgcolor: 'background.paper',
        boxShadow: 1,
      }}
    >
      <Box sx={{ color: 'primary.main', mb: 1 }}>{icon}</Box>
      <Typography variant="h3" component={motion.div} sx={{ fontWeight: 'bold', mb: 1 }}>
        {count}
      </Typography>
      <Typography variant="body1" color="text.secondary">
        {title}
      </Typography>
    </Box>
  );
} 