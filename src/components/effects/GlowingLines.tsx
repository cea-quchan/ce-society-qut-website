import React, { useEffect, useRef } from 'react';

interface Point {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const GlowingLines: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointsRef = useRef<Point[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const numPoints = 5;
    const colors = ['#00ff99', '#00ffff', '#0066ff', '#9900ff'];

    const initPoints = () => {
      pointsRef.current = Array.from({ length: numPoints }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
      }));
    };

    const drawLines = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      pointsRef.current.forEach((point, i) => {
        point.x += point.vx;
        point.y += point.vy;

        if (point.x < 0 || point.x > canvas.width) point.vx *= -1;
        if (point.y < 0 || point.y > canvas.height) point.vy *= -1;

        pointsRef.current.forEach((otherPoint, j) => {
          if (i !== j) {
            const dx = point.x - otherPoint.x;
            const dy = point.y - otherPoint.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 200) {
              const gradient = ctx.createLinearGradient(
                point.x, point.y, otherPoint.x, otherPoint.y
              );
              gradient.addColorStop(0, colors[i % colors.length]);
              gradient.addColorStop(1, colors[j % colors.length]);

              ctx.beginPath();
              ctx.strokeStyle = gradient;
              ctx.lineWidth = 2;
              ctx.moveTo(point.x, point.y);
              ctx.lineTo(otherPoint.x, otherPoint.y);
              ctx.stroke();

              ctx.shadowBlur = 15;
              ctx.shadowColor = colors[i % colors.length];
              ctx.stroke();
              ctx.shadowBlur = 0;
            }
          }
        });
      });

      animationRef.current = requestAnimationFrame(drawLines);
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initPoints();
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    drawLines();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="canvas-background"
    />
  );
};

export default GlowingLines; 