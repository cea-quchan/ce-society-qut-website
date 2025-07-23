import { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from '@mui/material';
import { motion } from 'framer-motion';
import LanguageIcon from '@mui/icons-material/Language';
import TranslateIcon from '@mui/icons-material/Translate';
import styles from './LanguageToggle.module.css';

interface LanguageToggleProps {
  currentLanguage: 'fa' | 'en';
  onLanguageChange: (language: 'fa' | 'en') => void;
}

const LanguageToggle = ({
  currentLanguage,
  onLanguageChange,
}: LanguageToggleProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (language: 'fa' | 'en') => {
    onLanguageChange(language);
    handleClose();
  };

  const languages = [
    {
      code: 'fa',
      name: 'فارسی',
      flag: '🇮🇷',
    },
    {
      code: 'en',
      name: 'English',
      flag: '🇬🇧',
    },
  ];

  return (
    <>
      <Tooltip title="تغییر زبان">
        <IconButton
          component={motion.button}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleClick}
          sx={{
            color: 'primary.main',
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              backgroundColor: 'rgba(37, 99, 235, 0.1)',
            },
          }}
        >
          <LanguageIcon />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 200,
            mt: 1.5,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {languages.map((language) => (
          <MenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code as 'fa' | 'en')}
            selected={currentLanguage === language.code}
            sx={{
              py: 1.5,
              px: 2,
              '&:hover': {
                backgroundColor: 'action.hover',
              },
              '&.Mui-selected': {
                backgroundColor: 'primary.light',
                '&:hover': {
                  backgroundColor: 'primary.light',
                },
              },
            }}
          >
            <ListItemIcon className={styles.flagIcon}>
              <span>{language.flag}</span>
            </ListItemIcon>
            <ListItemText
              primary={language.name}
              primaryTypographyProps={{
                variant: 'body2',
                fontWeight: currentLanguage === language.code ? 'medium' : 'normal',
                className: styles.languageText
              }}
            />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default LanguageToggle; 