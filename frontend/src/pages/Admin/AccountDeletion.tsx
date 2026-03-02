import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  MenuItem,
  InputAdornment
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import api from '../../services/api';

interface Account {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string;
}

const AccountDeletion: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Deletion dialog state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [deletionReason, setDeletionReason] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, [roleFilter]);

  const fetchAccounts = async () => {
    setLoading(true);
    setError('');
    
    try {
      const params: any = { role: roleFilter };
      if (searchTerm) params.searchTerm = searchTerm;
      
      const response = await api.get('/account-deletion/admin/accounts', { params });
      setAccounts(response.data.accounts || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchAccounts();
  };

  const handleDeleteClick = (account: Account) => {
    setSelectedAccount(account);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (!deletionReason.trim()) {
      setError('Please provide a reason for deletion');
      return;
    }

    if (deletionReason.trim().length < 10) {
      setError('Please provide a more detailed reason (at least 10 characters)');
      return;
    }

    setShowConfirmDialog(true);
  };

  const handleDelete = async () => {
    if (!selectedAccount) return;

    setDeleting(true);
    setError('');
    setSuccess('');

    try {
      await api.delete(`/account-deletion/admin/delete/${selectedAccount._id}`, {
        data: {
          reason: deletionReason,
          additionalInfo
        }
      });

      setSuccess(`Account for ${selectedAccount.name} has been deleted successfully`);
      
      // Refresh accounts list
      fetchAccounts();
      
      // Close dialogs
      setTimeout(() => {
        handleCloseDialogs();
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete account');
    } finally {
      setDeleting(false);
      setShowConfirmDialog(false);
    }
  };

  const handleCloseDialogs = () => {
    setShowDeleteDialog(false);
    setShowConfirmDialog(false);
    setSelectedAccount(null);
    setDeletionReason('');
    setAdditionalInfo('');
    setError('');
  };

  const columns: GridColDef[] = [
    { 
      field: 'name', 
      headerName: 'Name', 
      width: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" fontWeight="medium">
          {params.value}
        </Typography>
      )
    },
    { 
      field: 'email', 
      headerName: 'Email', 
      width: 250 
    },
    { 
      field: 'phone', 
      headerName: 'Phone', 
      width: 150 
    },
    { 
      field: 'role', 
      headerName: 'Role', 
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Chip 
          label={params.value} 
          color={params.value === 'worker' ? 'primary' : 'default'}
          size="small"
        />
      )
    },
    { 
      field: 'createdAt', 
      headerName: 'Joined', 
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        new Date(params.value as string).toLocaleDateString()
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <IconButton
          onClick={() => handleDeleteClick(params.row as Account)}
          color="error"
          size="small"
        >
          <DeleteIcon />
        </IconButton>
      )
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        Account Management & Deletion
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        View and manage user and worker accounts. Deleted accounts are logged for audit purposes.
      </Typography>

      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            sx={{ flexGrow: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
          <TextField
            select
            label="Filter by Role"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="all">All Roles</MenuItem>
            <MenuItem value="user">Users</MenuItem>
            <MenuItem value="worker">Workers</MenuItem>
          </TextField>
          <Button variant="contained" onClick={handleSearch}>
            Search
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={accounts}
            columns={columns}
            getRowId={(row) => row._id}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 10 }
              }
            }}
            pageSizeOptions={[10, 25, 50]}
            disableRowSelectionOnClick
            autoHeight
          />
        )}
      </Paper>

      {/* Delete Reason Dialog */}
      <Dialog open={showDeleteDialog} onClose={handleCloseDialogs} maxWidth="sm" fullWidth>
        <DialogTitle>
          Delete Account - Confirmation Required
        </DialogTitle>
        <DialogContent dividers>
          {selectedAccount && (
            <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="body2" gutterBottom>
                <strong>Account Holder:</strong> {selectedAccount.name}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Email:</strong> {selectedAccount.email}
              </Typography>
              <Typography variant="body2">
                <strong>Role:</strong> <Chip label={selectedAccount.role} size="small" />
              </Typography>
            </Box>
          )}

          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone. Please provide a detailed reason for this deletion.
          </Alert>

          <TextField
            label="Reason for Deletion *"
            value={deletionReason}
            onChange={(e) => setDeletionReason(e.target.value)}
            fullWidth
            multiline
            rows={4}
            placeholder="e.g., Violation of terms, user request, fraudulent activity..."
            helperText={`${deletionReason.length}/500 characters (minimum 10)`}
            inputProps={{ maxLength: 500 }}
            sx={{ mb: 2 }}
          />

          <TextField
            label="Additional Information (Optional)"
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
            fullWidth
            multiline
            rows={3}
            placeholder="Any other relevant details..."
            helperText={`${additionalInfo.length}/1000 characters`}
            inputProps={{ maxLength: 1000 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseDialogs} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            disabled={!deletionReason.trim() || deletionReason.length < 10}
          >
            Proceed to Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Final Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onClose={() => !deleting && setShowConfirmDialog(false)}>
        <DialogTitle>Final Confirmation</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            <strong>Warning:</strong> This will permanently delete the account and all associated data!
          </Alert>
          <Typography>
            Are you absolutely sure you want to delete this account?
          </Typography>
          {selectedAccount && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>{selectedAccount.name}</strong> ({selectedAccount.email})
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmDialog(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
            disabled={deleting}
          >
            {deleting ? <CircularProgress size={24} /> : 'Yes, Delete Account'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AccountDeletion;
