import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Button, ButtonProps, styled } from '@mui/material';

// Styled Button with modern design
const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  padding: '12px 24px',
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '1rem',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  color: 'white',
  border: 'none',
  boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.4)',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    opacity: 0,
    transition: 'opacity 0.3s ease',
    zIndex: -1,
  },
  
  '&:hover': {
    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    boxShadow: '0 8px 25px 0 rgba(99, 102, 241, 0.6)',
    transform: 'translateY(-2px)',
  },
  
  '&:active': {
    transform: 'translateY(0)',
  },
  
  '&.outlined': {
    background: 'transparent',
    color: '#6366f1',
    border: '2px solid #6366f1',
    boxShadow: 'none',
    
    '&:hover': {
      background: '#6366f1',
      color: 'white',
      boxShadow: '0 8px 25px 0 rgba(99, 102, 241, 0.4)',
    },
  },
  
  '&.secondary': {
    background: 'linear-gradient(135deg, #06b6d4 0%, #6366f1 100%)',
    boxShadow: '0 4px 14px 0 rgba(6, 182, 212, 0.4)',
    
    '&:hover': {
      background: 'linear-gradient(135deg, #0891b2 0%, #4f46e5 100%)',
      boxShadow: '0 8px 25px 0 rgba(6, 182, 212, 0.6)',
    },
  },
  
  '&.ghost': {
    background: 'transparent',
    color: '#6366f1',
    boxShadow: 'none',
    
    '&:hover': {
      background: 'rgba(99, 102, 241, 0.1)',
      boxShadow: 'none',
    },
  },
  
  '&.large': {
    padding: '16px 32px',
    fontSize: '1.125rem',
  },
  
  '&.small': {
    padding: '8px 16px',
    fontSize: '0.875rem',
  },
  
  '&:disabled': {
    background: '#9ca3af',
    color: '#6b7280',
    boxShadow: 'none',
    transform: 'none',
    
    '&:hover': {
      background: '#9ca3af',
      transform: 'none',
      boxShadow: 'none',
    },
  },
}));

interface AnimatedButtonProps extends Omit<ButtonProps, 'variant'> {
  variant?: 'outlined' | 'contained' | 'text';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
}

const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ variant = 'contained', size = 'medium', loading = false, children, disabled, ...props }, ref) => {
    const buttonVariants = {
      initial: { scale: 1, y: 0 },
      hover: { 
        scale: 1.05, 
        y: -2,
        transition: { 
          type: "spring", 
          stiffness: 300, 
          damping: 20 
        }
      },
      tap: { 
        scale: 0.95,
        transition: { 
          type: "spring", 
          stiffness: 400, 
          damping: 25 
        }
      },
      loading: {
        scale: [1, 1.1, 1],
        transition: {
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }
    };

    const getButtonClass = () => {
      const classes = [];
      if (variant === 'outlined') classes.push('outlined');
      // حذف شرط‌های اشتباه:
      // if (variant === 'secondary') classes.push('secondary');
      // if (variant === 'ghost') classes.push('ghost');
      if (size === 'large') classes.push('large');
      if (size === 'small') classes.push('small');
      return classes.join(' ');
    };

    return (
      <motion.div
        variants={buttonVariants}
        initial="initial"
        whileHover={loading ? "loading" : "hover"}
        whileTap="tap"
        style={{ display: 'inline-block' }}
      >
        <StyledButton
          ref={ref}
          className={getButtonClass()}
          disabled={disabled || loading}
          {...props}
        >
          {loading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              style={{ display: 'inline-block', marginRight: '8px' }}
            >
              ⏳
            </motion.div>
          ) : null}
          {children}
        </StyledButton>
      </motion.div>
    );
  }
);

AnimatedButton.displayName = 'AnimatedButton';

export default AnimatedButton; 