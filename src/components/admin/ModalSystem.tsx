import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box,
  Paper,
  Divider,
  CircularProgress,
  Alert,
  Chip,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Radio,
  RadioGroup,
  Switch,
  Slider,
  Rating,
  Autocomplete,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Close as CloseIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  ExpandMore as ExpandMoreIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  Category as CategoryIcon,
  DateRange as DateRangeIcon,
} from '@mui/icons-material';

const accent = '#22d3ee';

export interface ModalConfig {
  type: 'confirmation' | 'form' | 'preview' | 'bulk' | 'custom';
  title: string;
  content?: React.ReactNode;
  fields?: FormField[];
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullScreen?: boolean;
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  actions?: ModalAction[];
  onConfirm?: () => void | Promise<void>;
  onSubmit?: (data: Record<string, any>) => void | Promise<void>;
  onCancel?: () => void;
  onClose?: () => void;
  loading?: boolean;
  error?: string;
  success?: string;
  icon?: React.ReactNode;
  severity?: 'info' | 'warning' | 'error' | 'success';
}

export interface ModalAction {
  label: string;
  variant?: 'text' | 'outlined' | 'contained';
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  onClick: () => void | Promise<void>;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  autoFocus?: boolean;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'multiselect' | 'checkbox' | 'radio' | 'switch' | 'slider' | 'rating' | 'date' | 'textarea' | 'autocomplete';
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  validation?: (value: any) => string | null;
  defaultValue?: any;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  min?: number;
  max?: number;
  step?: number;
  marks?: Array<{ value: number; label: string }>;
  autocompleteOptions?: string[];
}

export interface BulkOperationConfig {
  title: string;
  description: string;
  items: Array<{ id: string; label: string; description?: string }>;
  operations: Array<{ label: string; action: string; icon: React.ReactNode }>;
  onExecute: (operation: string, selectedItems: string[]) => void | Promise<void>;
}

interface ModalSystemProps {
  open: boolean;
  config: ModalConfig;
  onClose: () => void;
}

const ModalSystem: React.FC<ModalSystemProps> = ({ open, config, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [activeStep, setActiveStep] = useState(0);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (open && config.type === 'form') {
      // Initialize form data with default values
      const initialData: Record<string, any> = {};
      if (Array.isArray(config.fields)) {
        config.fields.forEach((field) => {
          if (field.defaultValue !== undefined) {
            initialData[field.name] = field.defaultValue;
          }
        });
      }
      setFormData(initialData);
      setFormErrors({});
    }
  }, [open, config]);

  const handleClose = () => {
    if (config.closeOnBackdropClick !== false) {
      onClose();
      config.onClose?.();
    }
  };

  const handleConfirm = async () => {
    if (config.onConfirm) {
      try {
        await config.onConfirm();
      } catch (error) {
        console.error('Modal confirm error:', error);
      }
    }
  };

  const handleCancel = () => {
    config.onCancel?.();
    onClose();
  };

  const handleFormChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    if (config.type !== 'form' || !config.fields) return true;

    const errors: Record<string, string> = {};

    if (Array.isArray(config.fields)) {
      config.fields.forEach((field) => {
        const value = formData[field.name];
        
        if (field.required && (!value || (Array.isArray(value) && value.length === 0))) {
          errors[field.name] = `${field.label} الزامی است`;
        } else if (field.validation) {
          const validationError = field.validation(value);
          if (validationError) {
            errors[field.name] = validationError;
          }
        }
      });
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async () => {
    if (!validateForm()) return;

    if (config.type === 'form' && config.onSubmit) {
      try {
        await config.onSubmit(formData);
      } catch (error) {
        console.error('Form submit error:', error);
      }
    } else if (config.onConfirm) {
      try {
        await config.onConfirm();
      } catch (error) {
        console.error('Modal confirm error:', error);
      }
    }
  };

  const handleBulkOperation = async (operation: string) => {
    if (selectedItems.length === 0) return;

    if (config.type === 'bulk' && config.content) {
      const bulkConfig = (config.content as any).props?.config as BulkOperationConfig;
      if (bulkConfig.onExecute) {
        try {
          await bulkConfig.onExecute(operation, selectedItems);
        } catch (error) {
          console.error('Bulk operation error:', error);
        }
      }
    }
  };

  const getSeverityIcon = () => {
    switch (config.severity) {
      case 'warning':
        return <WarningIcon sx={{ color: '#f59e0b' }} />;
      case 'error':
        return <ErrorIcon sx={{ color: '#ef4444' }} />;
      case 'success':
        return <CheckCircleIcon sx={{ color: '#10b981' }} />;
      default:
        return <InfoIcon sx={{ color: accent }} />;
    }
  };

  const renderFormField = (field: FormField) => {
    const value = formData[field.name] || '';
    const error = formErrors[field.name];

    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
      case 'number':
        return (
          <TextField
            key={field.name}
            name={field.name}
            label={field.label}
            type={field.type}
            value={value}
            onChange={(e) => handleFormChange(field.name, e.target.value)}
            required={field.required}
            error={!!error}
            helperText={error}
            placeholder={field.placeholder}
            multiline={field.multiline}
            rows={field.rows}
            fullWidth
            sx={{ mb: 2, input: { color: accent } }}
          />
        );

      case 'textarea':
        return (
          <TextField
            key={field.name}
            name={field.name}
            label={field.label}
            value={value}
            onChange={(e) => handleFormChange(field.name, e.target.value)}
            required={field.required}
            error={!!error}
            helperText={error || field.placeholder}
            multiline
            rows={field.rows || 4}
            fullWidth
            sx={{ 
              mb: 2, 
              '& .MuiInputBase-input': { color: accent },
              '& .MuiInputLabel-root': { color: accent },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: accent + '40' },
                '&:hover fieldset': { borderColor: accent + '60' },
                '&.Mui-focused fieldset': { borderColor: accent }
              }
            }}
          />
        );

      case 'date':
        return (
          <TextField
            key={field.name}
            name={field.name}
            label={field.label}
            type="date"
            value={value}
            onChange={(e) => handleFormChange(field.name, e.target.value)}
            required={field.required}
            error={!!error}
            helperText={error || field.placeholder}
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
            sx={{ 
              mb: 2, 
              '& .MuiInputBase-input': { color: accent },
              '& .MuiInputLabel-root': { color: accent },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: accent + '40' },
                '&:hover fieldset': { borderColor: accent + '60' },
                '&.Mui-focused fieldset': { borderColor: accent }
              }
            }}
          />
        );

      case 'select':
        return (
          <FormControl key={field.name} fullWidth sx={{ mb: 2 }}>
            <InputLabel sx={{ color: accent }}>{field.label}</InputLabel>
            <Select
              value={value}
              onChange={(e) => handleFormChange(field.name, e.target.value)}
              error={!!error}
              sx={{ 
                color: accent,
                '& .MuiOutlinedInput-notchedOutline': { borderColor: accent + '40' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: accent + '60' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: accent }
              }}
            >
              {field.options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {error && (
              <Typography variant="caption" sx={{ color: '#ef4444', mt: 0.5 }}>
                {error}
              </Typography>
            )}
          </FormControl>
        );

      case 'checkbox':
        return (
          <FormControlLabel
            key={field.name}
            control={
              <Checkbox
                checked={value || false}
                onChange={(e) => handleFormChange(field.name, e.target.checked)}
                sx={{ color: accent }}
              />
            }
            label={field.label}
            sx={{ mb: 2, color: accent }}
          />
        );

      case 'switch':
        return (
          <FormControlLabel
            key={field.name}
            control={
              <Switch
                checked={value || false}
                onChange={(e) => handleFormChange(field.name, e.target.checked)}
                sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: accent } }}
              />
            }
            label={field.label}
            sx={{ mb: 2, color: accent }}
          />
        );

      case 'slider':
        return (
          <Box key={field.name} sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ color: accent, mb: 1 }}>
              {field.label}: {value}
            </Typography>
            <Slider
              value={value || field.min || 0}
              onChange={(_, newValue) => handleFormChange(field.name, newValue)}
              min={field.min}
              max={field.max}
              step={field.step}
              marks={field.marks}
              sx={{ color: accent }}
            />
          </Box>
        );

      case 'autocomplete':
        return (
          <Autocomplete
            key={field.name}
            options={field.autocompleteOptions || []}
            value={value}
            onChange={(_, newValue) => handleFormChange(field.name, newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label={field.label}
                error={!!error}
                helperText={error}
                sx={{ input: { color: accent } }}
              />
            )}
            sx={{ mb: 2 }}
          />
        );

      default:
        return null;
    }
  };

  const renderContent = () => {
    switch (config.type) {
      case 'confirmation':
        return (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            {config.icon || getSeverityIcon()}
            <Typography variant="body1" sx={{ mt: 2, color: '#fff' }}>
              {config.content}
            </Typography>
          </Box>
        );

      case 'form':
        if (config.fields && config.fields.length > 0) {
          return (
            <Box sx={{ py: 2 }}>
              <Grid container spacing={2}>
                {config.fields.map((field: FormField) => (
                  <Grid item xs={12} key={field.name}>
                    {renderFormField(field)}
                  </Grid>
                ))}
              </Grid>
              {/* نمایش محتوای اضافه (مثلاً آپلود عکس) بعد از فیلدها */}
              {config.content}
            </Box>
          );
        }
        return config.content;

      case 'bulk':
        if (config.content && typeof config.content === 'object' && 'props' in config.content) {
          const bulkConfig = (config.content as any).props?.config as BulkOperationConfig;
          return (
            <Box sx={{ py: 2 }}>
              <Typography variant="body2" sx={{ color: '#aaa', mb: 2 }}>
                {bulkConfig.description}
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ color: accent, mb: 1 }}>
                  انتخاب آیتم‌ها:
                </Typography>
                <List sx={{ maxHeight: 200, overflow: 'auto', bgcolor: 'rgba(24,26,32,0.3)', borderRadius: 1 }}>
                  {bulkConfig.items.map((item) => (
                    <ListItem key={item.id} dense>
                      <Checkbox
                        checked={selectedItems.includes(item.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedItems(prev => [...prev, item.id]);
                          } else {
                            setSelectedItems(prev => prev.filter(id => id !== item.id));
                          }
                        }}
                        sx={{ color: accent }}
                      />
                      <ListItemText
                        primary={item.label}
                        secondary={item.description}
                        sx={{ color: '#fff' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ color: accent, mb: 1 }}>
                  عملیات:
                </Typography>
                <Grid container spacing={1}>
                  {bulkConfig.operations.map((operation) => (
                    <Grid item key={operation.action}>
                      <Button
                        variant="outlined"
                        startIcon={operation.icon}
                        onClick={() => handleBulkOperation(operation.action)}
                        disabled={selectedItems.length === 0}
                        sx={{
                          color: accent,
                          borderColor: '#22d3ee55',
                          '&:hover': { borderColor: accent, bgcolor: 'rgba(34,211,238,0.1)' },
                        }}
                      >
                        {operation.label}
                      </Button>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Box>
          );
        }
        return config.content;

      default:
        return config.content;
    }
  };

  const renderActions = () => {
    if (config.actions) {
      return config.actions.map((action, index) => (
        <Button
          key={index}
          variant={action.variant || 'outlined'}
          color={action.color || 'primary'}
          onClick={action.onClick}
          disabled={action.disabled || config.loading}
          startIcon={action.loading ? <CircularProgress size={16} /> : action.icon}
          autoFocus={action.autoFocus}
          sx={{
            color: action.color === 'error' ? '#ef4444' : accent,
            borderColor: action.color === 'error' ? '#ef444455' : '#22d3ee55',
            '&:hover': {
              borderColor: action.color === 'error' ? '#ef4444' : accent,
              bgcolor: action.color === 'error' ? 'rgba(239,68,68,0.1)' : 'rgba(34,211,238,0.1)',
            },
          }}
        >
          {action.label}
        </Button>
      ));
    }

    switch (config.type) {
      case 'confirmation':
        return (
          <>
            <Button onClick={handleCancel} sx={{ color: '#fff' }}>
              انصراف
            </Button>
            <Button
              onClick={handleConfirm}
              variant="contained"
              disabled={config.loading}
              startIcon={config.loading ? <CircularProgress size={16} /> : undefined}
              sx={{
                bgcolor: accent,
                color: '#181A20',
                '&:hover': { bgcolor: '#22d3eecc' },
              }}
            >
              تایید
            </Button>
          </>
        );

      case 'form':
        return (
          <>
            <Button onClick={handleCancel} sx={{ color: '#fff' }}>
              انصراف
            </Button>
            <Button
              onClick={handleFormSubmit}
              variant="contained"
              disabled={config.loading}
              startIcon={config.loading ? <CircularProgress size={16} /> : undefined}
              sx={{
                bgcolor: accent,
                color: '#181A20',
                '&:hover': { bgcolor: '#22d3eecc' },
              }}
            >
              ثبت
            </Button>
          </>
        );

      default:
        return (
          <Button onClick={handleClose} sx={{ color: '#fff' }}>
            بستن
          </Button>
        );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={config.maxWidth || config.size || 'sm'}
      fullWidth
      fullScreen={config.fullScreen || isMobile}
      disableEscapeKeyDown={config.closeOnEscape === false}
      PaperProps={{
        sx: {
          bgcolor: 'rgba(24,26,32,0.95)',
          backdropFilter: 'blur(16px)',
          border: '1.5px solid #22d3ee55',
          borderRadius: config.fullScreen ? 0 : 4,
          boxShadow: '0 0 48px 0 #22d3ee55',
          color: '#fff',
        },
      }}
    >
      <DialogTitle sx={{ 
        color: accent, 
        fontWeight: 700, 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        borderBottom: '1px solid #22d3ee33',
        pb: 2
      }}>
        {config.icon || getSeverityIcon()}
        {config.title}
        {config.showCloseButton !== false && (
          <IconButton
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: accent,
            }}
          >
            <CloseIcon />
          </IconButton>
        )}
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {config.error && (
          <Alert severity="error" sx={{ mb: 2, bgcolor: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
            {config.error}
          </Alert>
        )}

        {config.success && (
          <Alert severity="success" sx={{ mb: 2, bgcolor: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
            {config.success}
          </Alert>
        )}

        {renderContent()}
      </DialogContent>

      <DialogActions sx={{ 
        p: 3, 
        pt: 2, 
        borderTop: '1px solid #22d3ee33',
        gap: 1
      }}>
        {renderActions()}
      </DialogActions>
    </Dialog>
  );
};

export default ModalSystem; 