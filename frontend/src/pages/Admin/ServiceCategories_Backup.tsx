import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Chip,
  Grid,
  Switch,
  FormControlLabel
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon, ToggleOn as ToggleIcon } from '@mui/icons-material';
import api from '../../services/api';
import { Navbar } from '../../components/common/Navbar';
import { useToast } from '../../context/ToastContext';

interface ServiceCategory {
  _id: string;
  serviceName: string;
  serviceCode: string;
  description: string;
  basePrice: number;
  pricePerKm: number;
  minimumCharge: number;
  estimatedDuration: number;
  serviceIcon?: string;
  category: 'urgent' | 'regular' | 'premium';
  surgePricing: number;
  isActive: boolean;
  requiredSkills: string[];
  createdAt: string;
}

const ServiceCategories: React.FC = () => {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchId, setSearchId] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: 'delete' | null;
    categoryId: string | null;
  }>({ open: false, action: null, categoryId: null });
  
  const { showToast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    serviceName: '',
    serviceCode: '',
    description: '',
    basePrice: 0,
    pricePerKm: 0,
    minimumCharge: 0,
    estimatedDuration: 0,
    serviceIcon: '',
    category: 'regular' as 'urgent' | 'regular' | 'premium',
    surgePricing: 1.0,
    isActive: true,
    requiredSkills: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (searchId.trim() === '') {
      setFilteredCategories(categories);
    } else {
      const filtered = categories.filter(cat =>
        cat._id.toLowerCase().includes(searchId.toLowerCase()) ||
        cat.serviceCode.toLowerCase().includes(searchId.toLowerCase()) ||
        cat.serviceName.toLowerCase().includes(searchId.toLowerCase())
      );
      setFilteredCategories(filtered);
    }
  }, [searchId, categories]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/service-categories');
      setCategories(response.data.data || []);
      setFilteredCategories(response.data.data || []);
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to fetch service categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (mode: 'create' | 'edit', category?: ServiceCategory) => {
    setDialogMode(mode);
    if (mode === 'edit' && category) {
      setSelectedCategory(category);
      setFormData({
        serviceName: category.serviceName,
        serviceCode: category.serviceCode,
        description: category.description,
        basePrice: category.basePrice,
        pricePerKm: category.pricePerKm,
        minimumCharge: category.minimumCharge,
        estimatedDuration: category.estimatedDuration,
        serviceIcon: category.serviceIcon || '',
        category: category.category,
        surgePricing: category.surgePricing,
        isActive: category.isActive,
        requiredSkills: category.requiredSkills.join(', ')
      });
    } else {
      setSelectedCategory(null);
      setFormData({
        serviceName: '',
        serviceCode: '',
        description: '',
        basePrice: 0,
        pricePerKm: 0,
        minimumCharge: 0,
        estimatedDuration: 0,
        serviceIcon: '',
        category: 'regular',
        surgePricing: 1.0,
        isActive: true,
        requiredSkills: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCategory(null);
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        serviceName: formData.serviceName,
        serviceCode: formData.serviceCode,
        description: formData.description,
        basePrice: formData.basePrice,
        pricePerKm: formData.pricePerKm,
        minimumCharge: formData.minimumCharge,
        estimatedDuration: formData.estimatedDuration,
        serviceIcon: formData.serviceIcon,
        category: formData.category,
        surgePricing: formData.surgePricing,
        isActive: formData.isActive,
        requiredSkills: formData.requiredSkills.split(',').map(s => s.trim()).filter(s => s)
      };

      if (dialogMode === 'create') {
        await api.post('/service-categories/create', payload);
        showToast('Service category created successfully', 'success');
      } else if (dialogMode === 'edit' && selectedCategory) {
        await api.patch(`/service-categories/${selectedCategory._id}`, payload);
        showToast('Service category updated successfully', 'success');
      }
      handleCloseDialog();
      fetchCategories();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Operation failed', 'error');
    }
  };

  const handleDelete = async () => {
    if (!confirmDialog.categoryId) return;
    try {
      await api.delete(`/service-categories/${confirmDialog.categoryId}`);
      showToast('Service category deleted successfully', 'success');
      setConfirmDialog({ open: false, action: null, categoryId: null });
      fetchCategories();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Delete failed', 'error');
    }
  };

  const handleToggleStatus = async (categoryId: string) => {
    try {
      await api.patch(`/service-categories/${categoryId}/toggle-status`);
      showToast('Status toggled successfully', 'success');
      fetchCategories();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Toggle failed', 'error');
    }
  };

  const columns: GridColDef[] = [
    { field: '_id', headerName: 'ID', width: 100, renderCell: (params) => params.value.slice(-8) },
    { field: 'serviceCode', headerName: 'Code', width: 120 },
    { field: 'serviceName', headerName: 'Service Name', width: 200 },
    { field: 'basePrice', headerName: 'Base Price', width: 120, valueFormatter: (params) => `₹${params.value}` },
    { field: 'pricePerKm', headerName: 'Per Km', width: 100, valueFormatter: (params) => `₹${params.value}` },
    { field: 'minimumCharge', headerName: 'Min Charge', width: 120, valueFormatter: (params) => `₹${params.value}` },
    { field: 'estimatedDuration', headerName: 'Duration (min)', width: 120 },
    { 
      field: 'category', 
      headerName: 'Category', 
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Chip 
          label={params.row.category} 
          color={
            params.row.category === 'urgent' ? 'error' : 
            params.row.category === 'premium' ? 'success' : 'default'
          }
          size="small"
        />
      )
    },
    { field: 'surgePricing', headerName: 'Surge', width: 80, valueFormatter: (params) => `${params.value}x` },
    { 
      field: 'isActive', 
      headerName: 'Active', 
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Chip 
          label={params.row.isActive ? 'Active' : 'Inactive'} 
          color={params.row.isActive ? 'success' : 'default'}
          size="small"
        />
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <IconButton size="small" onClick={() => handleOpenDialog('edit', params.row)}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton 
            size="small" 
            onClick={() => setConfirmDialog({ open: true, action: 'delete', categoryId: params.row._id })}
            color="error"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
          <IconButton 
            size="small" 
            onClick={() => handleToggleStatus(params.row._id)}
            color="primary"
          >
            <ToggleIcon fontSize="small" />
          </IconButton>
        </Box>
      )
    }
  ];

  return (
    <>
      <Navbar />
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4">Service Categories & Pricing</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog('create')}>
            Add Service
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            label="Search by ID, Code, or Name"
            variant="outlined"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            fullWidth
            InputProps={{
              endAdornment: <SearchIcon />
            }}
          />
        </Box>

        <DataGrid
          rows={filteredCategories}
          columns={columns}
          getRowId={(row) => row._id}
          loading={loading}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{
            pagination: { paginationModel: { pageSize: 25 } }
          }}
          autoHeight
          sx={{ backgroundColor: 'white' }}
        />

        {/* Create/Edit Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>{dialogMode === 'create' ? 'Create Service Category' : 'Edit Service Category'}</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <TextField
                    label="Service Name"
                    value={formData.serviceName}
                    onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    label="Service Code"
                    value={formData.serviceCode}
                    onChange={(e) => setFormData({ ...formData, serviceCode: e.target.value })}
                    fullWidth
                    required
                    disabled={dialogMode === 'edit'}
                  />
                </Grid>
              </Grid>

              <TextField
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                fullWidth
                multiline
                rows={3}
                required
              />

              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <TextField
                    label="Base Price (₹)"
                    type="number"
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) })}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    label="Price Per Km (₹)"
                    type="number"
                    value={formData.pricePerKm}
                    onChange={(e) => setFormData({ ...formData, pricePerKm: parseFloat(e.target.value) })}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    label="Minimum Charge (₹)"
                    type="number"
                    value={formData.minimumCharge}
                    onChange={(e) => setFormData({ ...formData, minimumCharge: parseFloat(e.target.value) })}
                    fullWidth
                    required
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <TextField
                    label="Duration (minutes)"
                    type="number"
                    value={formData.estimatedDuration}
                    onChange={(e) => setFormData({ ...formData, estimatedDuration: parseInt(e.target.value) })}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={4}>
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                      label="Category"
                    >
                      <MenuItem value="regular">Regular</MenuItem>
                      <MenuItem value="urgent">Urgent</MenuItem>
                      <MenuItem value="premium">Premium</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    label="Surge Pricing (1.0-3.0x)"
                    type="number"
                    value={formData.surgePricing}
                    onChange={(e) => setFormData({ ...formData, surgePricing: parseFloat(e.target.value) })}
                    fullWidth
                    inputProps={{ min: 1.0, max: 3.0, step: 0.1 }}
                    required
                  />
                </Grid>
              </Grid>

              <TextField
                label="Service Icon URL"
                value={formData.serviceIcon}
                onChange={(e) => setFormData({ ...formData, serviceIcon: e.target.value })}
                fullWidth
                placeholder="https://example.com/icon.png"
              />

              <TextField
                label="Required Skills (comma-separated)"
                value={formData.requiredSkills}
                onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })}
                fullWidth
                helperText="e.g., Plumbing, Pipe Fitting, Leak Repair"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                }
                label="Active Service"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              {dialogMode === 'create' ? 'Create' : 'Update'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Confirmation Dialog */}
        <Dialog 
          open={confirmDialog.open} 
          onClose={() => setConfirmDialog({ open: false, action: null, categoryId: null })}
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this service category?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDialog({ open: false, action: null, categoryId: null })}>
              Cancel
            </Button>
            <Button onClick={handleDelete} color="error" variant="contained">
              OK
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default ServiceCategories;
