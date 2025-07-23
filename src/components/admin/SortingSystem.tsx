import React, { useState } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Chip,
  Typography,
  Paper,
  Divider,
  Grid,
  Button,
  Collapse,
} from '@mui/material';
import {
  Sort,
  SortByAlpha,
  DateRange,
  TrendingUp,
  TrendingDown,
  Clear,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';

const accent = '#22d3ee';

interface SortOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  description?: string;
}

interface SortingSystemProps {
  onSort: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  onClear: () => void;
  sortOptions: SortOption[];
  currentSort?: {
    field: string;
    order: 'asc' | 'desc';
  };
  showAdvanced?: boolean;
  disabled?: boolean;
}

const SortingSystem: React.FC<SortingSystemProps> = ({
  onSort,
  onClear,
  sortOptions,
  currentSort,
  showAdvanced = false,
  disabled = false,
}) => {
  const [expanded, setExpanded] = useState(showAdvanced);
  const [sortBy, setSortBy] = useState(currentSort?.field || sortOptions[0]?.value || '');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(currentSort?.order || 'desc');

  const handleSort = () => {
    if (sortBy) {
      onSort(sortBy, sortOrder);
    }
  };

  const handleClear = () => {
    setSortBy(sortOptions[0]?.value || '');
    setSortOrder('desc');
    onClear();
  };

  const handleQuickSort = (field: string, order: 'asc' | 'desc') => {
    setSortBy(field);
    setSortOrder(order);
    onSort(field, order);
  };

  const getSortIcon = (order: 'asc' | 'desc') => {
    return order === 'asc' ? <TrendingUp /> : <TrendingDown />;
  };

  const getFieldLabel = (value: string) => {
    return sortOptions.find(option => option.value === value)?.label || value;
  };

  return (
    <Paper
      sx={{
        p: 2,
        bgcolor: 'rgba(24,26,32,0.55)',
        border: '1.5px solid #22d3ee55',
        boxShadow: '0 0 32px 0 #22d3ee33',
        borderRadius: 4,
        backdropFilter: 'blur(10px)',
      }}
    >
      {/* Quick Sort Buttons */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        <Typography variant="subtitle2" sx={{ color: accent, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
          <SortByAlpha />
          مرتب‌سازی سریع:
        </Typography>
        
        {sortOptions.slice(0, 4).map((option) => (
          <Box key={option.value} sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title={`مرتب‌سازی صعودی بر اساس ${option.label}`}>
              <IconButton
                size="small"
                onClick={() => handleQuickSort(option.value, 'asc')}
                disabled={disabled}
                sx={{
                  color: currentSort?.field === option.value && currentSort?.order === 'asc' ? accent : '#aaa',
                  border: currentSort?.field === option.value && currentSort?.order === 'asc' ? `1px solid ${accent}` : '1px solid #22d3ee55',
                  '&:hover': { borderColor: accent, bgcolor: 'rgba(34,211,238,0.1)' },
                }}
              >
                <TrendingUp fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={`مرتب‌سازی نزولی بر اساس ${option.label}`}>
              <IconButton
                size="small"
                onClick={() => handleQuickSort(option.value, 'desc')}
                disabled={disabled}
                sx={{
                  color: currentSort?.field === option.value && currentSort?.order === 'desc' ? accent : '#aaa',
                  border: currentSort?.field === option.value && currentSort?.order === 'desc' ? `1px solid ${accent}` : '1px solid #22d3ee55',
                  '&:hover': { borderColor: accent, bgcolor: 'rgba(34,211,238,0.1)' },
                }}
              >
                <TrendingDown fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ))}
      </Box>

      {/* Current Sort Display */}
      {currentSort && (
        <Box sx={{ mb: 2 }}>
          <Chip
            label={`مرتب‌سازی: ${getFieldLabel(currentSort.field)} ${currentSort.order === 'asc' ? 'صعودی' : 'نزولی'}`}
            icon={getSortIcon(currentSort.order)}
            onDelete={handleClear}
            sx={{
              bgcolor: accent,
              color: '#181A20',
              '& .MuiChip-deleteIcon': { color: '#181A20' },
            }}
          />
        </Box>
      )}

      {/* Advanced Sorting */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
        <Tooltip title="مرتب‌سازی پیشرفته">
          <IconButton
            onClick={() => setExpanded(!expanded)}
            sx={{
              color: accent,
              border: '1px solid #22d3ee55',
              '&:hover': { borderColor: accent, bgcolor: 'rgba(34,211,238,0.1)' },
            }}
          >
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Tooltip>

        <Typography variant="subtitle2" sx={{ color: '#aaa' }}>
          مرتب‌سازی پیشرفته
        </Typography>
      </Box>

      <Collapse in={expanded}>
        <Divider sx={{ borderColor: '#22d3ee33', mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: accent }}>مرتب‌سازی بر اساس</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                disabled={disabled}
                sx={{ color: accent }}
              >
                {sortOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {option.icon}
                      {option.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: accent }}>ترتیب</InputLabel>
              <Select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                disabled={disabled}
                sx={{ color: accent }}
              >
                <MenuItem value="desc">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingDown />
                    نزولی
                  </Box>
                </MenuItem>
                <MenuItem value="asc">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingUp />
                    صعودی
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                onClick={handleSort}
                disabled={disabled || !sortBy}
                sx={{
                  bgcolor: accent,
                  color: '#181A20',
                  '&:hover': { bgcolor: '#22d3eecc' },
                  flex: 1,
                }}
              >
                اعمال
              </Button>
              <Tooltip title="پاک کردن">
                <IconButton
                  onClick={handleClear}
                  disabled={disabled}
                  sx={{
                    color: '#ef4444',
                    border: '1px solid #ef444455',
                    '&:hover': { borderColor: '#ef4444', bgcolor: 'rgba(239,68,68,0.1)' },
                  }}
                >
                  <Clear />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>

        {/* Sort Options Description */}
        <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(34,211,238,0.05)', borderRadius: 2 }}>
          <Typography variant="caption" sx={{ color: '#aaa', display: 'block', mb: 1 }}>
            راهنمای مرتب‌سازی:
          </Typography>
          <Grid container spacing={1}>
            {sortOptions.map((option) => (
              <Grid item xs={12} sm={6} md={4} key={option.value}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {option.icon}
                  <Typography variant="caption" sx={{ color: '#fff', fontWeight: 600 }}>
                    {option.label}:
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#aaa' }}>
                    {option.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default SortingSystem; 