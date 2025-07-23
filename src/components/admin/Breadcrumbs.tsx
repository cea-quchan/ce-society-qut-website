import React, { useState, useEffect } from 'react';
import {
  Box,
  Breadcrumbs as MuiBreadcrumbs,
  Link,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  Tooltip,
  useTheme,
  useMediaQuery,
  Fade,
  Collapse,
} from '@mui/material';
import {
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
  MoreVert as MoreVertIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  History as HistoryIcon,
  Bookmark as BookmarkIcon,
  Settings as SettingsIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Article as ArticleIcon,
  PhotoLibrary as PhotoLibraryIcon,
  BarChart as BarChartIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/router';

const accent = '#22d3ee';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  children?: BreadcrumbItem[];
  metadata?: Record<string, any>;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
  maxItems?: number;
  showIcons?: boolean;
  showHistory?: boolean;
  showBookmarks?: boolean;
  onItemClick?: (item: BreadcrumbItem, index: number) => void;
  onHistoryClick?: (item: BreadcrumbItem) => void;
  onBookmarkClick?: (item: BreadcrumbItem) => void;
  variant?: 'default' | 'compact' | 'detailed';
  color?: 'primary' | 'secondary' | 'inherit';
}

const getIconForPath = (path: string) => {
  if (path.includes('/dashboard/admin')) return <DashboardIcon />;
  if (path.includes('/users')) return <PeopleIcon />;
  if (path.includes('/news')) return <ArticleIcon />;
  if (path.includes('/gallery')) return <PhotoLibraryIcon />;
  if (path.includes('/reports')) return <BarChartIcon />;
  if (path.includes('/settings')) return <SettingsIcon />;
  return null;
};

const getBreadcrumbsFromPath = (pathname: string): BreadcrumbItem[] => {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];
  
  let currentPath = '';
  
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    let label = segment;
    let icon = null;
    
    // Map segments to readable labels
    switch (segment) {
      case 'dashboard':
        label = 'داشبورد';
        icon = <DashboardIcon />;
        break;
      case 'admin':
        label = 'پنل مدیریت';
        icon = <SettingsIcon />;
        break;
      case 'users':
        label = 'مدیریت کاربران';
        icon = <PeopleIcon />;
        break;
      case 'news':
        label = 'مدیریت اخبار';
        icon = <ArticleIcon />;
        break;
      case 'gallery':
        label = 'مدیریت گالری';
        icon = <PhotoLibraryIcon />;
        break;
      case 'reports':
        label = 'گزارش‌ها';
        icon = <BarChartIcon />;
        break;
      case 'settings':
        label = 'تنظیمات';
        icon = <SettingsIcon />;
        break;
      default:
        // Convert camelCase or kebab-case to readable text
        label = segment
          .replace(/([A-Z])/g, ' $1')
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase())
          .trim();
        icon = getIconForPath(currentPath);
    }
    
    breadcrumbs.push({
      label,
      href: currentPath,
      icon,
      disabled: false,
    });
  });
  
  return breadcrumbs;
};

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items = [],
  showHome = true,
  maxItems = 5,
  showIcons = true,
  showHistory = true,
  showBookmarks = true,
  onItemClick,
  onHistoryClick,
  onBookmarkClick,
  variant = 'default',
  color = 'primary',
}) => {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [expanded, setExpanded] = useState(false);
  const [historyMenuAnchor, setHistoryMenuAnchor] = useState<null | HTMLElement>(null);
  const [bookmarksMenuAnchor, setBookmarksMenuAnchor] = useState<null | HTMLElement>(null);
  const [breadcrumbHistory, setBreadcrumbHistory] = useState<BreadcrumbItem[]>([]);
  const [bookmarks, setBookmarks] = useState<BreadcrumbItem[]>([]);

  // Generate breadcrumbs from current path if no items provided
  const currentBreadcrumbs = items.length > 0 ? items : getBreadcrumbsFromPath(router.pathname);
  
  // Add home breadcrumb if requested
  const allBreadcrumbs = showHome 
    ? [{ label: 'خانه', href: '/', icon: <HomeIcon />, disabled: false }, ...currentBreadcrumbs]
    : currentBreadcrumbs;

  // Limit breadcrumbs based on maxItems
  const visibleBreadcrumbs = allBreadcrumbs.slice(-maxItems);
  const hiddenBreadcrumbs = allBreadcrumbs.slice(0, -maxItems);

  useEffect(() => {
    // Load breadcrumb history from localStorage
    const savedHistory = localStorage.getItem('breadcrumbHistory');
    if (savedHistory) {
      try {
        setBreadcrumbHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Error parsing breadcrumb history:', error);
      }
    }

    // Load bookmarks from localStorage
    const savedBookmarks = localStorage.getItem('breadcrumbBookmarks');
    if (savedBookmarks) {
      try {
        setBookmarks(JSON.parse(savedBookmarks));
      } catch (error) {
        console.error('Error parsing breadcrumb bookmarks:', error);
      }
    }
  }, []);

  const saveToHistory = (item: BreadcrumbItem) => {
    // Create a serializable version of the item (without React/DOM references)
    const serializableItem = {
      label: item.label,
      href: item.href,
      disabled: item.disabled,
      metadata: item.metadata
    };
    
    const newHistory = [
      serializableItem,
      ...breadcrumbHistory.filter(h => h.href !== item.href)
    ].slice(0, 10); // Keep only last 10 items
    
    setBreadcrumbHistory(newHistory);
    localStorage.setItem('breadcrumbHistory', JSON.stringify(newHistory));
  };

  const toggleBookmark = (item: BreadcrumbItem) => {
    const isBookmarked = bookmarks.some(b => b.href === item.href);
    let newBookmarks;
    
    if (isBookmarked) {
      newBookmarks = bookmarks.filter(b => b.href !== item.href);
    } else {
      // Create a serializable version of the item (without React/DOM references)
      const serializableItem = {
        label: item.label,
        href: item.href,
        disabled: item.disabled,
        metadata: item.metadata
      };
      newBookmarks = [...bookmarks, serializableItem].slice(0, 20); // Max 20 bookmarks
    }
    
    setBookmarks(newBookmarks);
    localStorage.setItem('breadcrumbBookmarks', JSON.stringify(newBookmarks));
  };

  const handleItemClick = (item: BreadcrumbItem, index: number) => {
    if (item.disabled || !item.href) return;
    
    saveToHistory(item);
    onItemClick?.(item, index);
    
    if (item.href.startsWith('http')) {
      window.open(item.href, '_blank');
    } else {
      router.push(item.href);
    }
  };

  const handleHistoryClick = (item: BreadcrumbItem) => {
    handleItemClick(item, 0);
    setHistoryMenuAnchor(null);
    onHistoryClick?.(item);
  };

  const handleBookmarkClick = (item: BreadcrumbItem) => {
    handleItemClick(item, 0);
    setBookmarksMenuAnchor(null);
    onBookmarkClick?.(item);
  };

  const renderBreadcrumbItem = (item: BreadcrumbItem, index: number, isLast: boolean) => {
    const isBookmarked = bookmarks.some(b => b.href === item.href);
    
    return (
      <Box
        key={index}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
        }}
      >
        {showIcons && item.icon && (
          <Box sx={{ 
            color: item.disabled ? '#666' : accent,
            display: 'flex',
            alignItems: 'center',
            fontSize: '1.1rem'
          }}>
            {item.icon}
          </Box>
        )}
        
        {isLast ? (
          <Typography
            variant={variant === 'compact' ? 'body2' : 'body1'}
            sx={{
              color: accent,
              fontWeight: 700,
              fontSize: variant === 'compact' ? '0.875rem' : '1rem',
              textShadow: '0 0 8px #22d3ee',
            }}
          >
            {item.label}
          </Typography>
        ) : (
          <Link
            component="button"
            variant="body1"
            onClick={() => handleItemClick(item, index)}
            disabled={item.disabled}
            sx={{
              color: item.disabled ? '#666' : '#fff',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: variant === 'compact' ? '0.875rem' : '1rem',
              transition: 'all 0.2s',
              '&:hover': {
                color: item.disabled ? '#666' : accent,
                textShadow: item.disabled ? 'none' : '0 0 8px #22d3ee',
              },
              '&.Mui-disabled': {
                color: '#666',
                cursor: 'not-allowed',
              },
            }}
          >
            {item.label}
          </Link>
        )}
        
        {showBookmarks && item.href && !isLast && (
          <Tooltip title={isBookmarked ? 'حذف از نشان‌ها' : 'افزودن به نشان‌ها'}>
            <IconButton
              size="small"
              onClick={() => toggleBookmark(item)}
              sx={{
                color: isBookmarked ? accent : '#666',
                fontSize: '0.75rem',
                p: 0.5,
                '&:hover': {
                  color: isBookmarked ? '#ef4444' : accent,
                },
              }}
            >
              <BookmarkIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    );
  };

  const renderCompactBreadcrumbs = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {visibleBreadcrumbs.length > 0 && (
        <>
          {visibleBreadcrumbs[0] && renderBreadcrumbItem(visibleBreadcrumbs[0], 0, false)}
          {visibleBreadcrumbs.length > 1 && (
            <>
              <NavigateNextIcon sx={{ color: '#666', fontSize: '1rem' }} />
              <Typography variant="body2" sx={{ color: '#666' }}>
                ...
              </Typography>
              <NavigateNextIcon sx={{ color: '#666', fontSize: '1rem' }} />
              {renderBreadcrumbItem(visibleBreadcrumbs[visibleBreadcrumbs.length - 1], visibleBreadcrumbs.length - 1, true)}
            </>
          )}
        </>
      )}
    </Box>
  );

  const renderDetailedBreadcrumbs = () => (
    <MuiBreadcrumbs
      separator={<NavigateNextIcon sx={{ color: '#666', fontSize: '1rem' }} />}
      maxItems={maxItems}
      itemsBeforeCollapse={2}
      itemsAfterCollapse={1}
      sx={{
        '& .MuiBreadcrumbs-separator': {
          color: '#666',
        },
      }}
    >
      {visibleBreadcrumbs.map((item, index) => 
        renderBreadcrumbItem(item, index, index === visibleBreadcrumbs.length - 1)
      )}
    </MuiBreadcrumbs>
  );

  return (
    <Box sx={{ mb: 3 }}>
      {/* Main Breadcrumbs */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2,
        p: 2,
        bgcolor: 'rgba(24,26,32,0.7)',
        border: '1px solid #22d3ee33',
        borderRadius: 2,
        backdropFilter: 'blur(8px)',
      }}>
        {/* Breadcrumbs */}
        <Box sx={{ flex: 1 }}>
          {variant === 'compact' ? renderCompactBreadcrumbs() : renderDetailedBreadcrumbs()}
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          {/* History Button */}
          {showHistory && breadcrumbHistory.length > 0 && (
            <>
              <Tooltip title="تاریخچه">
                <IconButton
                  size="small"
                  onClick={(e) => setHistoryMenuAnchor(e.currentTarget)}
                  sx={{ color: accent }}
                >
                  <HistoryIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={historyMenuAnchor}
                open={Boolean(historyMenuAnchor)}
                onClose={() => setHistoryMenuAnchor(null)}
                PaperProps={{
                  sx: {
                    bgcolor: 'rgba(24,26,32,0.95)',
                    border: '1px solid #22d3ee55',
                    backdropFilter: 'blur(16px)',
                    minWidth: 200,
                  },
                }}
              >
                {breadcrumbHistory.slice(0, 5).map((item, index) => (
                  <MenuItem
                    key={index}
                    onClick={() => handleHistoryClick(item)}
                    sx={{
                      color: '#fff',
                      '&:hover': {
                        bgcolor: 'rgba(34,211,238,0.1)',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: accent }}>
                      {item.icon || <NavigateNextIcon />}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.label}
                      primaryTypographyProps={{ fontSize: '0.875rem' }}
                    />
                  </MenuItem>
                ))}
              </Menu>
            </>
          )}

          {/* Bookmarks Button */}
          {showBookmarks && bookmarks.length > 0 && (
            <>
              <Tooltip title="نشان‌ها">
                <IconButton
                  size="small"
                  onClick={(e) => setBookmarksMenuAnchor(e.currentTarget)}
                  sx={{ color: accent }}
                >
                  <BookmarkIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={bookmarksMenuAnchor}
                open={Boolean(bookmarksMenuAnchor)}
                onClose={() => setBookmarksMenuAnchor(null)}
                PaperProps={{
                  sx: {
                    bgcolor: 'rgba(24,26,32,0.95)',
                    border: '1px solid #22d3ee55',
                    backdropFilter: 'blur(16px)',
                    minWidth: 200,
                  },
                }}
              >
                {bookmarks.slice(0, 10).map((item, index) => (
                  <MenuItem
                    key={index}
                    onClick={() => handleBookmarkClick(item)}
                    sx={{
                      color: '#fff',
                      '&:hover': {
                        bgcolor: 'rgba(34,211,238,0.1)',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: accent }}>
                      {item.icon || <BookmarkIcon />}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.label}
                      primaryTypographyProps={{ fontSize: '0.875rem' }}
                    />
                  </MenuItem>
                ))}
              </Menu>
            </>
          )}

          {/* Expand/Collapse Button (Mobile) */}
          {isMobile && hiddenBreadcrumbs.length > 0 && (
            <Tooltip title={expanded ? 'کوچک کردن' : 'بزرگ کردن'}>
              <IconButton
                size="small"
                onClick={() => setExpanded(!expanded)}
                sx={{ color: accent }}
              >
                {expanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Hidden Breadcrumbs (Mobile) */}
      {isMobile && hiddenBreadcrumbs.length > 0 && (
        <Collapse in={expanded}>
          <Box sx={{ 
            mt: 1,
            p: 1,
            bgcolor: 'rgba(24,26,32,0.5)',
            border: '1px solid #22d3ee22',
            borderRadius: 1,
          }}>
            <MuiBreadcrumbs
              separator={<NavigateNextIcon sx={{ color: '#666', fontSize: '0.75rem' }} />}
              sx={{
                '& .MuiBreadcrumbs-separator': {
                  color: '#666',
                },
              }}
            >
              {hiddenBreadcrumbs.map((item, index) => 
                renderBreadcrumbItem(item, index, false)
              )}
            </MuiBreadcrumbs>
          </Box>
        </Collapse>
      )}

      {/* Breadcrumb Stats */}
      {variant === 'detailed' && (
        <Box sx={{ 
          display: 'flex', 
          gap: 1, 
          mt: 1,
          flexWrap: 'wrap'
        }}>
          <Chip
            label={`${allBreadcrumbs.length} سطح`}
            size="small"
            sx={{
              bgcolor: 'rgba(34,211,238,0.1)',
              color: accent,
              fontSize: '0.75rem',
            }}
          />
          {breadcrumbHistory.length > 0 && (
            <Chip
              label={`${breadcrumbHistory.length} در تاریخچه`}
              size="small"
              sx={{
                bgcolor: 'rgba(34,211,238,0.1)',
                color: accent,
                fontSize: '0.75rem',
              }}
            />
          )}
          {bookmarks.length > 0 && (
            <Chip
              label={`${bookmarks.length} نشان`}
              size="small"
              sx={{
                bgcolor: 'rgba(34,211,238,0.1)',
                color: accent,
                fontSize: '0.75rem',
              }}
            />
          )}
        </Box>
      )}
    </Box>
  );
};

export default Breadcrumbs; 