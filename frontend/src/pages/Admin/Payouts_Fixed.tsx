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

const Payouts: React.FC = () => {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [filteredPayouts, setFilteredPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchId, setSearchId] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
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
  }, []);

  useEffect(() => {
    if (searchId.trim() === '') {
      setFilteredPayouts(payouts);
    } else {
      const filtered = payouts.filter(payout =>
        payout._id.toLowerCase().includes(searchId.toLowerCase()) ||
        payout.worker._id.toLowerCase().includes(searchId.toLowerCase())
      );
      setFilteredPayouts(filtered);
    }
  }, [searchId, payouts]);

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/payouts');
      const data = response.data.data || response.data || [];
      setPayouts(data);
      setFilteredPayouts(data);
    } catch (error: any) {
      console.error('Error fetching payouts:', error);
      showToast(error.response?.data?.message || 'Failed to fetch payouts', 'error');
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

  const handleSubmitClick = () => {
    // Show confirmation dialog before submitting
    setConfirmDialog({ open: true, action: 'submit', payoutId: selectedPayout?._id || null });
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        worker: formData.worker,
        bookings: formData.bookings.split(',').map(id => id.trim()).filter(id => id),
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

      if (dialogMode === 'create') {
        await api.post('/payouts/create', payload);
        showToast('Payout created successfully', 'success');
      } else if (dialogMode === 'edit' && selectedPayout) {
        await api.patch(`/payouts/${selectedPayout._id}`, payload);
        showToast('Payout updated successfully', 'success');
      }
      
      setConfirmDialog({ open: false, action: null, payoutId: null });
      handleCloseDialog();
      await fetchPayouts(); // Refresh the list
    } catch (error: any) {
      console.error('Submit error:', error);
      showToast(error.response?.data?.message || 'Operation failed', 'error');
      setConfirmDialog({ open: false, action: null, payoutId: null });
    }
  };

  const handleDeleteClick = (payoutId: string) => {
    setConfirmDialog({ open: true, action: 'delete', payoutId });
  };

  const handleDelete = async () => {
    if (!confirmDialog.payoutId) return;
    try {
      await api.delete(`/payouts/${confirmDialog.payoutId}`);
      showToast('Payout deleted successfully', 'success');
      setConfirmDialog({ open: false, action: null, payoutId: null });
      await fetchPayouts(); // Refresh the list
    } catch (error: any) {
      console.error('Delete error:', error);
      showToast(error.response?.data?.message || 'Delete failed', 'error');
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
      showToast('Payout processed successfully', 'success');
      setConfirmDialog({ open: false, action: null, payoutId: null });
      await fetchPayouts(); // Refresh the list
    } catch (error: any) {
      console.error('Process error:', error);
      showToast(error.response?.data?.message || 'Process failed', 'error');
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
      renderCell: (params: GridRenderCellParams) => params.row.worker.userId.name 
    },
    { 
      field: 'profession', 
      headerName: 'Profession', 
      width: 120, 
      renderCell: (params: GridRenderCellParams) => params.row.worker.profession 
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4">Worker Payouts Management</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog('create')}>
            Create Payout
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            label="Search by Payout ID or Worker ID"
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
        />

        {/* Create/Edit Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>{dialogMode === 'create' ? 'Create Payout' : 'Edit Payout'}</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <TextField
                label="Worker ID"
                value={formData.worker}
                onChange={(e) => setFormData({ ...formData, worker: e.target.value })}
                fullWidth
                required
                disabled={dialogMode === 'edit'}
                helperText="Enter the MongoDB ObjectId of the worker"
              />
              <TextField
                label="Booking IDs (comma-separated)"
                value={formData.bookings}
                onChange={(e) => setFormData({ ...formData, bookings: e.target.value })}
                fullWidth
                required
                helperText="Enter booking IDs separated by commas"
              />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="Total Earnings (₹)"
                    type="number"
                    value={formData.totalEarnings}
                    onChange={(e) => setFormData({ ...formData, totalEarnings: parseFloat(e.target.value) || 0 })}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Commission %"
                    type="number"
                    value={formData.commissionPercent}
                    onChange={(e) => setFormData({ ...formData, commissionPercent: parseFloat(e.target.value) || 0 })}
                    fullWidth
                    required
                    inputProps={{ min: 0, max: 100 }}
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
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmitClick} variant="contained" color="primary">
              {dialogMode === 'create' ? 'Create' : 'Update'}
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
