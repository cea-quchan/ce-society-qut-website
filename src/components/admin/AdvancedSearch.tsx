import React, { useState } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Collapse,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
  Paper,
  Divider,
  Autocomplete,
  Slider,
  FormControlLabel,
  Switch,
  Grid,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  Search,
  FilterList,
  Clear,
  DateRange,
} from '@mui/icons-material';

const accent = '#22d3ee';

interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface AdvancedSearchProps {
  onSearch: (searchParams: SearchParams) => void;
  onClear: () => void;
  filters?: {
    categories?: FilterOption[];
    statuses?: FilterOption[];
    types?: FilterOption[];
    roles?: FilterOption[];
  };
  searchSuggestions?: string[];
  placeholder?: string;
  showAdvanced?: boolean;
  loading?: boolean;
}

export interface SearchParams {
  query: string;
  category?: string;
  status?: string;
  type?: string;
  role?: string;
  dateRange?: DateRange;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  minValue?: number;
  maxValue?: number;
  includeInactive?: boolean;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  onSearch,
  onClear,
  filters = {},
  searchSuggestions = [],
  placeholder = 'جستجو...',
  showAdvanced = false,
  loading = false,
}) => {
  const [expanded, setExpanded] = useState(showAdvanced);
  const [searchParams, setSearchParams] = useState<SearchParams>({
    query: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    includeInactive: false,
  });

  const [dateRange, setDateRange] = useState<DateRange>({
    start: null,
    end: null,
  });

  const [valueRange, setValueRange] = useState<[number, number]>([0, 100]);

  const handleSearch = () => {
    const params = {
      ...searchParams,
      dateRange: dateRange.start || dateRange.end ? dateRange : undefined,
      minValue: valueRange[0],
      maxValue: valueRange[1],
    };
    onSearch(params);
  };

  const handleClear = () => {
    setSearchParams({
      query: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      includeInactive: false,
    });
    setDateRange({ start: null, end: null });
    setValueRange([0, 100]);
    onClear();
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchParams.query) count++;
    if (searchParams.category) count++;
    if (searchParams.status) count++;
    if (searchParams.type) count++;
    if (searchParams.role) count++;
    if (dateRange.start || dateRange.end) count++;
    if (valueRange[0] > 0 || valueRange[1] < 100) count++;
    if (searchParams.includeInactive) count++;
    return count;
  };

  const removeFilter = (filterType: keyof SearchParams) => {
    setSearchParams(prev => ({ ...prev, [filterType]: undefined }));
  };

  const removeDateFilter = () => {
    setDateRange({ start: null, end: null });
  };

  const removeValueFilter = () => {
    setValueRange([0, 100]);
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
      {/* جستجوی اصلی */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
        <Autocomplete
          freeSolo
          options={searchSuggestions}
          value={searchParams.query}
          onChange={(_, newValue) => {
            setSearchParams(prev => ({ ...prev, query: newValue || '' }));
          }}
          onInputChange={(_, newInputValue) => {
            setSearchParams(prev => ({ ...prev, query: newInputValue }));
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder={placeholder}
              fullWidth
              onKeyPress={handleKeyPress}
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: accent }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    {loading && <div className="spinner" />}
                  </InputAdornment>
                ),
              }}
              sx={{
                input: { color: '#fff' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#22d3ee55' },
                  '&:hover fieldset': { borderColor: accent },
                  '&.Mui-focused fieldset': { borderColor: accent },
                },
              }}
            />
          )}
        />

        <Tooltip title="فیلترهای پیشرفته">
          <IconButton
            onClick={() => setExpanded(!expanded)}
            sx={{
              color: accent,
              border: '1px solid #22d3ee55',
              '&:hover': { borderColor: accent, bgcolor: 'rgba(34,211,238,0.1)' },
            }}
          >
            <Badge badgeContent={getActiveFiltersCount()} color="primary">
              <FilterList />
            </Badge>
          </IconButton>
        </Tooltip>

        <Button
          variant="contained"
          onClick={handleSearch}
          disabled={loading}
          sx={{
            bgcolor: accent,
            color: '#181A20',
            '&:hover': { bgcolor: '#22d3eecc' },
            minWidth: 100,
          }}
        >
          جستجو
        </Button>

        <Tooltip title="پاک کردن فیلترها">
          <IconButton
            onClick={handleClear}
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

      {/* فیلترهای فعال */}
      {getActiveFiltersCount() > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" sx={{ color: '#aaa', mb: 1, display: 'block' }}>
            فیلترهای فعال:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {searchParams.query && (
              <Chip
                label={`جستجو: ${searchParams.query}`}
                onDelete={() => removeFilter('query')}
                size="small"
                sx={{ bgcolor: accent, color: '#181A20' }}
              />
            )}
            {searchParams.category && (
              <Chip
                label={`دسته: ${filters.categories?.find(f => f.value === searchParams.category)?.label}`}
                onDelete={() => removeFilter('category')}
                size="small"
                sx={{ bgcolor: '#10b981', color: 'white' }}
              />
            )}
            {searchParams.status && (
              <Chip
                label={`وضعیت: ${filters.statuses?.find(f => f.value === searchParams.status)?.label}`}
                onDelete={() => removeFilter('status')}
                size="small"
                sx={{ bgcolor: '#f59e0b', color: 'white' }}
              />
            )}
            {searchParams.type && (
              <Chip
                label={`نوع: ${filters.types?.find(f => f.value === searchParams.type)?.label}`}
                onDelete={() => removeFilter('type')}
                size="small"
                sx={{ bgcolor: '#8b5cf6', color: 'white' }}
              />
            )}
            {searchParams.role && (
              <Chip
                label={`نقش: ${filters.roles?.find(f => f.value === searchParams.role)?.label}`}
                onDelete={() => removeFilter('role')}
                size="small"
                sx={{ bgcolor: '#06b6d4', color: 'white' }}
              />
            )}
            {(dateRange.start || dateRange.end) && (
              <Chip
                label={`تاریخ: ${dateRange.start?.toLocaleDateString('fa-IR') || 'از ابتدا'} تا ${dateRange.end?.toLocaleDateString('fa-IR') || 'تا انتها'}`}
                onDelete={removeDateFilter}
                size="small"
                sx={{ bgcolor: '#ec4899', color: 'white' }}
              />
            )}
            {(valueRange[0] > 0 || valueRange[1] < 100) && (
              <Chip
                label={`محدوده: ${valueRange[0]} - ${valueRange[1]}`}
                onDelete={removeValueFilter}
                size="small"
                sx={{ bgcolor: '#84cc16', color: 'white' }}
              />
            )}
            {searchParams.includeInactive && (
              <Chip
                label="شامل غیرفعال"
                onDelete={() => removeFilter('includeInactive')}
                size="small"
                sx={{ bgcolor: '#6b7280', color: 'white' }}
              />
            )}
          </Box>
        </Box>
      )}

      {/* فیلترهای پیشرفته */}
      <Collapse in={expanded}>
        <Divider sx={{ borderColor: '#22d3ee33', mb: 2 }} />
        <Grid container spacing={2}>
          {/* فیلترهای اصلی */}
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: accent }}>دسته‌بندی</InputLabel>
              <Select
                value={searchParams.category || ''}
                onChange={(e) => setSearchParams(prev => ({ ...prev, category: e.target.value }))}
                sx={{ color: accent }}
              >
                <MenuItem value="">همه</MenuItem>
                {filters.categories?.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label} {option.count && `(${option.count})`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: accent }}>وضعیت</InputLabel>
              <Select
                value={searchParams.status || ''}
                onChange={(e) => setSearchParams(prev => ({ ...prev, status: e.target.value }))}
                sx={{ color: accent }}
              >
                <MenuItem value="">همه</MenuItem>
                {filters.statuses?.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label} {option.count && `(${option.count})`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: accent }}>نوع</InputLabel>
              <Select
                value={searchParams.type || ''}
                onChange={(e) => setSearchParams(prev => ({ ...prev, type: e.target.value }))}
                sx={{ color: accent }}
              >
                <MenuItem value="">همه</MenuItem>
                {filters.types?.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label} {option.count && `(${option.count})`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: accent }}>نقش</InputLabel>
              <Select
                value={searchParams.role || ''}
                onChange={(e) => setSearchParams(prev => ({ ...prev, role: e.target.value }))}
                sx={{ color: accent }}
              >
                <MenuItem value="">همه</MenuItem>
                {filters.roles?.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label} {option.count && `(${option.count})`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* فیلتر تاریخ */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                label="از تاریخ"
                type="date"
                value={dateRange.start ? dateRange.start.toISOString().split('T')[0] : ''}
                onChange={(e) => {
                  const date = e.target.value ? new Date(e.target.value) : null;
                  setDateRange(prev => ({ ...prev, start: date }));
                }}
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
                sx={{ input: { color: accent } }}
              />
              <TextField
                label="تا تاریخ"
                type="date"
                value={dateRange.end ? dateRange.end.toISOString().split('T')[0] : ''}
                onChange={(e) => {
                  const date = e.target.value ? new Date(e.target.value) : null;
                  setDateRange(prev => ({ ...prev, end: date }));
                }}
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
                sx={{ input: { color: accent } }}
              />
            </Box>
          </Grid>

          {/* فیلتر محدوده */}
          <Grid item xs={12} md={6}>
            <Box sx={{ px: 2 }}>
              <Typography variant="caption" sx={{ color: '#aaa', mb: 1, display: 'block' }}>
                محدوده: {valueRange[0]} - {valueRange[1]}
              </Typography>
              <Slider
                value={valueRange}
                onChange={(_, newValue) => setValueRange(newValue as [number, number])}
                valueLabelDisplay="auto"
                min={0}
                max={100}
                sx={{
                  color: accent,
                  '& .MuiSlider-thumb': {
                    boxShadow: '0 0 8px #22d3ee',
                  },
                }}
              />
            </Box>
          </Grid>

          {/* مرتب‌سازی */}
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: accent }}>مرتب‌سازی بر اساس</InputLabel>
              <Select
                value={searchParams.sortBy || 'createdAt'}
                onChange={(e) => setSearchParams(prev => ({ ...prev, sortBy: e.target.value }))}
                sx={{ color: accent }}
              >
                <MenuItem value="createdAt">تاریخ ایجاد</MenuItem>
                <MenuItem value="updatedAt">تاریخ بروزرسانی</MenuItem>
                <MenuItem value="name">نام</MenuItem>
                <MenuItem value="title">عنوان</MenuItem>
                <MenuItem value="status">وضعیت</MenuItem>
                <MenuItem value="type">نوع</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: accent }}>ترتیب</InputLabel>
              <Select
                value={searchParams.sortOrder || 'desc'}
                onChange={(e) => setSearchParams(prev => ({ ...prev, sortOrder: e.target.value as 'asc' | 'desc' }))}
                sx={{ color: accent }}
              >
                <MenuItem value="desc">نزولی</MenuItem>
                <MenuItem value="asc">صعودی</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControlLabel
              control={
                <Switch
                  checked={searchParams.includeInactive || false}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, includeInactive: e.target.checked }))}
                  sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: accent } }}
                />
              }
              label="شامل موارد غیرفعال"
              sx={{ color: '#fff' }}
            />
          </Grid>
        </Grid>
      </Collapse>
    </Paper>
  );
};

export default AdvancedSearch; 