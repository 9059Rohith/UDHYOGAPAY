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
  Grid
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon, CheckCircle as ProcessIcon } from '@mui/icons-material';
import api from '../../services/api';
import { Navbar } from '../../components/common/Navbar';
import { useToast } from '../../context/ToastContext';

interface Payout {
  _id: string;
  worker: { _id: string; userId: { name: string }; profession: string };
  bookings: string[];
  totalEarnings: number;
  commissionPercent: number;
  commissionAmount: number;
  netPayout: number;
  paymentMethod: 'bank_transfer' | 'upi' | 'cash';
  accountDetails: {
    accountHolderName?: string;
    accountNumber?: string;
    ifscCode?: string;
    upiId?: string;
  };
  payoutStatus: 'pending' | 'processing' | 'completed' | 'failed';
  processedAt?: string;
  createdAt: string;
}

interface Worker {
  _id: string;
  userId: { _id: string; name: string };
  profession: string;
}

const Payouts: React.FC = () => {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [filteredPayouts, setFilteredPayouts] = useState<Payout[]>([]);
  const [availableWorkers, setAvailableWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchId, setSearchId] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: 'delete' | 'process' | 'submit' | null;
    payoutId: string | null;
  }>({ open: false, action: null, payoutId: null });
  
  const { showToast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    worker: '',
    bookings: '',
    totalEarnings: 0,
    commissionPercent: 15,
    paymentMethod: 'bank_transfer' as 'bank_transfer' | 'upi' | 'cash',
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    upiId: '',
    notes: ''
  });

  useEffect(() => {
    fetchPayouts();
    fetchAvailableWorkers();
  }, []);

  const fetchAvailableWorkers = async () => {
    try {
      const response = await api.get('/admin/workers/active');
      setAvailableWorkers(response.data.workers || []);
    } catch (error: any) {
      console.error('Error fetching workers:', error);
    }
  };

  useEffect(() => {
    if (searchId.trim() === '') {
      setFilteredPayouts(payouts);
    } else {
      const searchLower = searchId.toLowerCase();
      const filtered = payouts.filter(payout =>
        payout._id.toLowerCase().includes(searchLower) ||
        payout.worker._id.toLowerCase().includes(searchLower) ||
        payout.worker?.userId?.name?.toLowerCase().includes(searchLower) ||
        payout.worker?.profession?.toLowerCase().includes(searchLower) ||
        payout.paymentMethod.toLowerCase().includes(searchLower) ||
        payout.payoutStatus.toLowerCase().includes(searchLower)
      );
      setFilteredPayouts(filtered);
    }
  }, [searchId, payouts]);

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/payouts');
      const data = response.data.payouts || response.data.data || response.data || [];
      setPayouts(data);
      setFilteredPayouts(data);
    } catch (error: any) {
      console.error('Error fetching payouts:', error);
      showToast({ message: error.response?.data?.message || 'Failed to fetch payouts', type: 'error' });
      setPayouts([]);
      setFilteredPayouts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (mode: 'create' | 'edit', payout?: Payout) => {
    setDialogMode(mode);
    if (mode === 'edit' && payout) {
      setSelectedPayout(payout);
      setFormData({
        worker: payout.worker._id,
        bookings: payout.bookings.join(','),
        totalEarnings: payout.totalEarnings,
        commissionPercent: payout.commissionPercent,
        paymentMethod: payout.paymentMethod,
        accountHolderName: payout.accountDetails.accountHolderName || '',
        accountNumber: payout.accountDetails.accountNumber || '',
        ifscCode: payout.accountDetails.ifscCode || '',
        upiId: payout.accountDetails.upiId || '',
        notes: ''
      });
    } else {
      setSelectedPayout(null);
      setFormData({
        worker: '',
        bookings: '',
        totalEarnings: 0,
        commissionPercent: 15,
        paymentMethod: 'bank_transfer',
        accountHolderName: '',
        accountNumber: '',
        ifscCode: '',
        upiId: '',
        notes: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPayout(null);
  };

  const validateForm = (): boolean => {
    if (dialogMode === 'create') {
      if (!formData.worker) {
        showToast({ message: 'Please select a worker', type: 'error' });
        return false;
      }
      if (!formData.totalEarnings || formData.totalEarnings <= 0) {
        showToast({ message: 'Please enter valid total earnings', type: 'error' });
        return false;
      }
      if (!formData.commissionPercent || formData.commissionPercent < 0 || formData.commissionPercent > 100) {
        showToast({ message: 'Commission percent must be between 0 and 100', type: 'error' });
        return false;
      }
    }

    // Validate payment method details
    if (formData.paymentMethod === 'bank_transfer') {
      if (!formData.accountHolderName || !formData.accountNumber || !formData.ifscCode) {
        showToast({ message: 'Please fill all bank account details', type: 'error' });
        return false;
      }
      if (formData.accountNumber.length < 9 || formData.accountNumber.length > 18) {
        showToast({ message: 'Invalid account number length', type: 'error' });
        return false;
      }
      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode)) {
        showToast({ message: 'Invalid IFSC code format', type: 'error' });
        return false;
      }
    } else if (formData.paymentMethod === 'upi') {
      if (!formData.upiId) {
        showToast({ message: 'Please enter UPI ID', type: 'error' });
        return false;
      }
      if (!/^[\w.-]+@[\w.-]+$/.test(formData.upiId)) {
        showToast({ message: 'Invalid UPI ID format', type: 'error' });
        return false;
      }
    }

    return true;
  };

  const handleSubmitClick = () => {
    if (!validateForm()) {
      return;
    }
    // Show confirmation dialog before submitting
    setConfirmDialog({ open: true, action: 'submit', payoutId: selectedPayout?._id || null });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      if (dialogMode === 'create') {
        const payload = {
          workerId: formData.worker,
          bookingIds: formData.bookings.split(',').map(id => id.trim()).filter(id => id),
          periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Last 30 days
          periodEnd: new Date().toISOString(),
          totalEarnings: Number(formData.totalEarnings),
          commissionPercent: Number(formData.commissionPercent),
          paymentMethod: formData.paymentMethod,
          accountDetails: {
            accountHolderName: formData.accountHolderName,
            accountNumber: formData.accountNumber,
            ifscCode: formData.ifscCode,
            upiId: formData.upiId
          },
          notes: formData.notes
        };
        await api.post('/payouts/create', payload);
        showToast({ message: 'Payout created successfully', type: 'success' });
      } else if (dialogMode === 'edit' && selectedPayout) {
        // Update only accepts these fields
        const payload = {
          paymentMethod: formData.paymentMethod,
          accountDetails: {
            accountHolderName: formData.accountHolderName,
            accountNumber: formData.accountNumber,
            ifscCode: formData.ifscCode,
            upiId: formData.upiId
          },
          remarks: formData.notes
        };
        await api.patch(`/payouts/${selectedPayout._id}`, payload);
        showToast({ message: 'Payout updated successfully', type: 'success' });
      }
      
      setConfirmDialog({ open: false, action: null, payoutId: null });
      handleCloseDialog();
      await fetchPayouts(); // Refresh the list
    } catch (error: any) {
      console.error('Submit error:', error);
      showToast({ message: error.response?.data?.message || 'Operation failed', type: 'error' });
      setConfirmDialog({ open: false, action: null, payoutId: null });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (payoutId: string) => {
    setConfirmDialog({ open: true, action: 'delete', payoutId });
  };

  const handleDelete = async () => {
    if (!confirmDialog.payoutId) return;
    try {
      await api.delete(`/payouts/${confirmDialog.payoutId}`);
      showToast({ message: 'Payout deleted successfully', type: 'success' });
      setConfirmDialog({ open: false, action: null, payoutId: null });
      await fetchPayouts(); // Refresh the list
    } catch (error: any) {
      console.error('Delete error:', error);
      showToast({ message: error.response?.data?.message || 'Delete failed', type: 'error' });
      setConfirmDialog({ open: false, action: null, payoutId: null });
    }
  };

  const handleProcessClick = (payoutId: string) => {
    setConfirmDialog({ open: true, action: 'process', payoutId });
  };

  const handleProcess = async () => {
    if (!confirmDialog.payoutId) return;
    try {
      await api.patch(`/payouts/${confirmDialog.payoutId}/process`);
      showToast({ message: 'Payout processed successfully', type: 'success' });
      setConfirmDialog({ open: false, action: null, payoutId: null });
      await fetchPayouts(); // Refresh the list
    } catch (error: any) {
      console.error('Process error:', error);
      showToast({ message: error.response?.data?.message || 'Process failed', type: 'error' });
      setConfirmDialog({ open: false, action: null, payoutId: null });
    }
  };

  const columns: GridColDef[] = [
    { 
      field: '_id', 
      headerName: 'Payout ID', 
      width: 100, 
      renderCell: (params: GridRenderCellParams) => params.value.slice(-8) 
    },
    { 
      field: 'workerName', 
      headerName: 'Worker', 
      width: 150, 
      renderCell: (params: GridRenderCellParams) => params.row.worker?.userId?.name || 'N/A' 
    },
    { 
      field: 'profession', 
      headerName: 'Profession', 
      width: 120, 
      renderCell: (params: GridRenderCellParams) => params.row.worker?.profession || 'N/A' 
    },
    { 
      field: 'totalEarnings', 
      headerName: 'Earnings', 
      width: 120, 
      renderCell: (params: GridRenderCellParams) => `₹${params.value}` 
    },
    { 
      field: 'commissionPercent', 
      headerName: 'Commission %', 
      width: 120, 
      renderCell: (params: GridRenderCellParams) => `${params.value}%` 
    },
    { 
      field: 'commissionAmount', 
      headerName: 'Commission', 
      width: 120, 
      renderCell: (params: GridRenderCellParams) => `₹${params.value}` 
    },
    { 
      field: 'netPayout', 
      headerName: 'Net Payout', 
      width: 120, 
      renderCell: (params: GridRenderCellParams) => `₹${params.value}` 
    },
    { field: 'paymentMethod', headerName: 'Method', width: 120 },
    { 
      field: 'payoutStatus', 
      headerName: 'Status', 
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Chip 
          label={params.row.payoutStatus} 
          color={
            params.row.payoutStatus === 'completed' ? 'success' : 
            params.row.payoutStatus === 'failed' ? 'error' : 
            params.row.payoutStatus === 'processing' ? 'info' : 'warning'
          }
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
          {params.row.payoutStatus === 'pending' && (
            <IconButton 
              size="small" 
              onClick={() => handleProcessClick(params.row._id)}
              color="success"
            >
              <ProcessIcon fontSize="small" />
            </IconButton>
          )}
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
            <Typography variant="h4">Worker Payouts Management</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Total: {payouts.length} payouts | Showing: {filteredPayouts.length}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="outlined" 
              onClick={fetchPayouts}
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
              Create Payout
            </Button>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            label="Search Payouts"
            placeholder="Search by ID, worker name, profession, status..."
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
          rows={filteredPayouts}
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
                  {searchId ? 'No payouts found matching your search' : 'No payouts available'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {searchId ? 'Try a different search term' : 'Create your first payout to get started'}
                </Typography>
              </Box>
            ),
          }}
        />

        {/* Create/Edit Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>{dialogMode === 'create' ? 'Create Payout' : 'Edit Payout'}</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <FormControl fullWidth required disabled={dialogMode === 'edit'}>
                <InputLabel>Select Worker</InputLabel>
                <Select
                  value={formData.worker}
                  onChange={(e) => setFormData({ ...formData, worker: e.target.value })}
                  label="Select Worker"
                >
                  <MenuItem value="">
                    <em>Choose a worker...</em>
                  </MenuItem>
                  {availableWorkers.map((worker) => (
                    <MenuItem key={worker._id} value={worker._id}>
                      {worker.userId.name} - {worker.profession} (ID: {worker._id.slice(-8)})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Booking IDs (comma-separated)"
                value={formData.bookings}
                onChange={(e) => setFormData({ ...formData, bookings: e.target.value })}
                fullWidth
                disabled={dialogMode === 'edit'}
                helperText="Enter booking IDs separated by commas, or leave empty to auto-calculate from worker's completed bookings"
                placeholder="e.g., 507f1f77bcf86cd799439011, 507f191e810c19729de860ea"
              />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="Total Earnings (₹)"
                    type="number"
                    value={formData.totalEarnings}
                    onChange={(e) => setFormData({ ...formData, totalEarnings: parseFloat(e.target.value) || 0 })}
                    fullWidth
                    required={dialogMode === 'create'}
                    disabled={dialogMode === 'edit'}
                    helperText="Total earnings before commission"
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Commission %"
                    type="number"
                    value={formData.commissionPercent}
                    onChange={(e) => setFormData({ ...formData, commissionPercent: parseFloat(e.target.value) || 0 })}
                    fullWidth
                    required={dialogMode === 'create'}
                    disabled={dialogMode === 'edit'}
                    helperText="Platform commission percentage"
                    inputProps={{ min: 0, max: 100, step: 0.1 }}
                  />
                </Grid>
              </Grid>
              <FormControl fullWidth>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                  label="Payment Method"
                >
                  <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                  <MenuItem value="upi">UPI</MenuItem>
                  <MenuItem value="cash">Cash</MenuItem>
                </Select>
              </FormControl>
              
              {formData.paymentMethod === 'bank_transfer' && (
                <>
                  <TextField
                    label="Account Holder Name"
                    value={formData.accountHolderName}
                    onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
                    fullWidth
                  />
                  <TextField
                    label="Account Number"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    fullWidth
                  />
                  <TextField
                    label="IFSC Code"
                    value={formData.ifscCode}
                    onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
                    fullWidth
                  />
                </>
              )}
              
              {formData.paymentMethod === 'upi' && (
                <TextField
                  label="UPI ID"
                  value={formData.upiId}
                  onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                  fullWidth
                  placeholder="example@upi"
                />
              )}
              
              <TextField
                label="Notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                fullWidth
                multiline
                rows={3}
                placeholder="Additional notes about the payout"
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
          onClose={() => setConfirmDialog({ open: false, action: null, payoutId: null })}
        >
          <DialogTitle>
            {confirmDialog.action === 'delete' && 'Confirm Delete'}
            {confirmDialog.action === 'process' && 'Confirm Process'}
            {confirmDialog.action === 'submit' && 'Confirm Submit'}
          </DialogTitle>
          <DialogContent>
            <Typography>
              {confirmDialog.action === 'delete' && 'Are you sure you want to delete this payout?'}
              {confirmDialog.action === 'process' && 'Are you sure you want to process this payout? This action will mark it as processing.'}
              {confirmDialog.action === 'submit' && `Are you sure you want to ${dialogMode} this payout?`}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDialog({ open: false, action: null, payoutId: null })}>
              Cancel
            </Button>
            <Button 
              onClick={
                confirmDialog.action === 'delete' ? handleDelete : 
                confirmDialog.action === 'process' ? handleProcess : 
                handleSubmit
              } 
              color={confirmDialog.action === 'delete' ? 'error' : confirmDialog.action === 'process' ? 'success' : 'primary'} 
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

export default Payouts;
