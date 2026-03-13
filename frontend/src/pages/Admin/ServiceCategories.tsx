// Page feature: drives the ServiceCategories screen and its user interactions.
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
  const [submitting, setSubmitting] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: 'delete' | 'submit' | null;
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
      const searchLower = searchId.toLowerCase();
      const filtered = categories.filter(cat =>
        cat._id.toLowerCase().includes(searchLower) ||
        cat.serviceCode.toLowerCase().includes(searchLower) ||
        cat.serviceName.toLowerCase().includes(searchLower) ||
        cat.description.toLowerCase().includes(searchLower) ||
        cat.category.toLowerCase().includes(searchLower) ||
        cat.requiredSkills.some(skill => skill.toLowerCase().includes(searchLower))
      );
      setFilteredCategories(filtered);
    }
  }, [searchId, categories]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/service-categories');
      const data = response.data.categories || response.data.data || response.data || [];
      setCategories(data);
      setFilteredCategories(data);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      showToast({ message: error.response?.data?.message || 'Failed to fetch service categories', type: 'error' });
      setCategories([]);
      setFilteredCategories([]);
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

  const validateForm = (): boolean => {
    if (!formData.serviceName || formData.serviceName.trim().length < 3) {
      showToast({ message: 'Service name must be at least 3 characters', type: 'error' });
      return false;
    }

    if (dialogMode === 'create' && (!formData.serviceCode || formData.serviceCode.trim().length < 2)) {
      showToast({ message: 'Service code must be at least 2 characters', type: 'error' });
      return false;
    }

    if (!formData.description || formData.description.trim().length < 10) {
      showToast({ message: 'Description must be at least 10 characters', type: 'error' });
      return false;
    }

    if (!formData.basePrice || formData.basePrice < 0) {
      showToast({ message: 'Please enter a valid base price', type: 'error' });
      return false;
    }

    if (formData.pricePerKm < 0) {
      showToast({ message: 'Price per km cannot be negative', type: 'error' });
      return false;
    }

    if (!formData.minimumCharge || formData.minimumCharge < 0) {
      showToast({ message: 'Please enter a valid minimum charge', type: 'error' });
      return false;
    }

    if (!formData.estimatedDuration || formData.estimatedDuration <= 0) {
      showToast({ message: 'Please enter valid estimated duration', type: 'error' });
      return false;
    }

    if (formData.surgePricing < 1.0 || formData.surgePricing > 3.0) {
      showToast({ message: 'Surge pricing must be between 1.0 and 3.0', type: 'error' });
      return false;
    }

    return true;
  };

  const handleSubmitClick = () => {
    if (!validateForm()) {
      return;
    }
    // Show confirmation dialog before submitting
    setConfirmDialog({ open: true, action: 'submit', categoryId: selectedCategory?._id || null });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        serviceName: formData.serviceName,
        serviceCode: formData.serviceCode,
        description: formData.description,
        basePrice: Number(formData.basePrice),
        pricePerKm: Number(formData.pricePerKm),
        minimumCharge: Number(formData.minimumCharge),
        estimatedDuration: Number(formData.estimatedDuration),
        serviceIcon: formData.serviceIcon,
        category: formData.category,
        surgePricingMultiplier: Number(formData.surgePricing),
        isActive: formData.isActive,
        requiredSkills: formData.requiredSkills.split(',').map(s => s.trim()).filter(s => s)
      };

      if (dialogMode === 'create') {
        await api.post('/service-categories/create', payload);
        showToast({ message: 'Service category created successfully', type: 'success' });
      } else if (dialogMode === 'edit' && selectedCategory) {
        await api.patch(`/service-categories/${selectedCategory._id}`, payload);
        showToast({ message: 'Service category updated successfully', type: 'success' });
      }
      
      setConfirmDialog({ open: false, action: null, categoryId: null });
      handleCloseDialog();
      await fetchCategories(); // Refresh the list
    } catch (error: any) {
      console.error('Submit error:', error);
      showToast({ message: error.response?.data?.message || 'Operation failed', type: 'error' });
      setConfirmDialog({ open: false, action: null, categoryId: null });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (categoryId: string) => {
    setConfirmDialog({ open: true, action: 'delete', categoryId });
  };

  const handleDelete = async () => {
    if (!confirmDialog.categoryId) return;
    try {
      await api.delete(`/service-categories/${confirmDialog.categoryId}`);
      showToast({ message: 'Service category deleted successfully', type: 'success' });
      setConfirmDialog({ open: false, action: null, categoryId: null });
      await fetchCategories(); // Refresh the list
    } catch (error: any) {
      console.error('Delete error:', error);
      showToast({ message: error.response?.data?.message || 'Delete failed', type: 'error' });
      setConfirmDialog({ open: false, action: null, categoryId: null });
    }
  };

  const handleToggleStatus = async (categoryId: string) => {
    try {
      await api.patch(`/service-categories/${categoryId}/toggle-status`);
      showToast({ message: 'Status toggled successfully', type: 'success' });
      await fetchCategories(); // Refresh the list
    } catch (error: any) {
      console.error('Toggle error:', error);
      showToast({ message: error.response?.data?.message || 'Toggle failed', type: 'error' });
    }
  };

  const columns: GridColDef[] = [
    { 
      field: '_id', 
      headerName: 'ID', 
      width: 100, 
      renderCell: (params: GridRenderCellParams) => params.value.slice(-8) 
    },
    { field: 'serviceCode', headerName: 'Code', width: 120 },
    { field: 'serviceName', headerName: 'Service Name', width: 200 },
    { 
      field: 'basePrice', 
      headerName: 'Base Price', 
      width: 120, 
      renderCell: (params: GridRenderCellParams) => `₹${params.value}` 
    },
    { 
      field: 'pricePerKm', 
      headerName: 'Per Km', 
      width: 100, 
      renderCell: (params: GridRenderCellParams) => `₹${params.value}` 
    },
    { 
      field: 'minimumCharge', 
      headerName: 'Min Charge', 
      width: 120, 
      renderCell: (params: GridRenderCellParams) => `₹${params.value}` 
    },
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
    { 
      field: 'surgePricing', 
      headerName: 'Surge', 
      width: 80, 
      renderCell: (params: GridRenderCellParams) => `${params.value}x` 
    },
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
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <IconButton size="small" onClick={() => handleOpenDialog('edit', params.row)} color="primary">
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton 
            size="small" 
            onClick={() => handleDeleteClick(params.row._id)}
            color="error"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
          <IconButton 
            size="small" 
            onClick={() => handleToggleStatus(params.row._id)}
            color="info"
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
          <Box>
            <Typography variant="h4">Service Categories & Pricing</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Total: {categories.length} services | Showing: {filteredCategories.length} | Active: {categories.filter(c => c.isActive).length}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="outlined" 
              onClick={fetchCategories}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />} 
              onClick={() => handleOpenDialog('create')}
              disabled={loading}
            >
              Add Service
            </Button>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            label="Search Service Categories"
            placeholder="Search by ID, code, name, category, or skills..."
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
          slotProps={{
            noRowsOverlay: {
              sx: {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
              },
            },
          }}
          slots={{
            noRowsOverlay: () => (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', py: 4 }}>
                <Typography variant="h6" color="text.secondary">
                  {searchId ? 'No service categories found matching your search' : 'No service categories available'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {searchId ? 'Try a different search term' : 'Add your first service category to get started'}
                </Typography>
              </Box>
            ),
          }}
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
                    onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    label="Price Per Km (₹)"
                    type="number"
                    value={formData.pricePerKm}
                    onChange={(e) => setFormData({ ...formData, pricePerKm: parseFloat(e.target.value) || 0 })}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    label="Minimum Charge (₹)"
                    type="number"
                    value={formData.minimumCharge}
                    onChange={(e) => setFormData({ ...formData, minimumCharge: parseFloat(e.target.value) || 0 })}
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
                    onChange={(e) => setFormData({ ...formData, estimatedDuration: parseInt(e.target.value) || 0 })}
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
                    onChange={(e) => setFormData({ ...formData, surgePricing: parseFloat(e.target.value) || 1.0 })}
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
                helperText="Optional: URL to service icon image"
                placeholder="https://example.com/icon.png"
              />

              <TextField
                label="Required Skills (comma-separated)"
                value={formData.requiredSkills}
                onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })}
                fullWidth
                helperText="Enter skills separated by commas, e.g., Plumbing, Pipe Fitting, Leak Repair"
                placeholder="Skill 1, Skill 2, Skill 3"
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
            <Button onClick={handleCloseDialog} disabled={submitting}>Cancel</Button>
            <Button onClick={handleSubmitClick} variant="contained" color="primary" disabled={submitting}>
              {submitting ? 'Submitting...' : (dialogMode === 'create' ? 'Create' : 'Update')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Confirmation Dialog */}
        <Dialog 
          open={confirmDialog.open} 
          onClose={() => setConfirmDialog({ open: false, action: null, categoryId: null })}
        >
          <DialogTitle>
            {confirmDialog.action === 'delete' ? 'Confirm Delete' : 'Confirm Submit'}
          </DialogTitle>
          <DialogContent>
            <Typography>
              {confirmDialog.action === 'delete' 
                ? 'Are you sure you want to delete this service category?'
                : `Are you sure you want to ${dialogMode} this service category?`
              }
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDialog({ open: false, action: null, categoryId: null })}>
              Cancel
            </Button>
            <Button 
              onClick={confirmDialog.action === 'delete' ? handleDelete : handleSubmit} 
              color={confirmDialog.action === 'delete' ? 'error' : 'primary'} 
              variant="contained"
            >
              OK
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default ServiceCategories;
