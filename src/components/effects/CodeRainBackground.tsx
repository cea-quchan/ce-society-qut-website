import React, { useRef, useEffect } from 'react';

const letters = '01ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const fontSize = 18;

const CodeRainBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const drops = useRef<number[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    drops.current = Array(Math.floor(width / fontSize)).fill(1);

    const draw = () => {
      ctx.fillStyle = 'rgba(10, 10, 30, 0.6)';
      ctx.fillRect(0, 0, width, height);
      ctx.font = `${fontSize}px monospace`;
      ctx.fillStyle = '#00ff99';
      for (let i = 0; i < drops.current.length; i++) {
        const text = letters[Math.floor(Math.random() * letters.length)];
        ctx.fillText(text, i * fontSize, drops.current[i] * fontSize);
        if (drops.current[i] * fontSize > height && Math.random() > 0.975) {
          drops.current[i] = 0;
        }
        drops.current[i]++;
      }
      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      drops.current = Array(Math.floor(width / fontSize)).fill(1);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 0.7,
      }}
    />
  );
};

export default CodeRainBackground; 