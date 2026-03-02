import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  MenuItem,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import api from '../../services/api';

interface Complaint {
  _id: string;
  complainant: {
    name: string;
    email: string;
    phone: string;
  };
  complainantRole: string;
  jobId: {
    _id: string;
    profession: string;
    status: string;
  };
  complaintType: string;
  description: string;
  status: string;
  adminNotes?: string;
  resolvedBy?: {
    name: string;
  };
  createdAt: string;
}

const ComplaintsManagement: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // View/Update dialog state
  const [showDialog, setShowDialog] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [newStatus, setNewStatus] = useState('pending');
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter, roleFilter]);

  const fetchComplaints = async () => {
    setLoading(true);
    setError('');

    try {
      const params: any = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (roleFilter !== 'all') params.complainantRole = roleFilter;

      const response = await api.get('/complaints/admin/all', { params });
      setComplaints(response.data.complaints || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const handleViewClick = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setNewStatus(complaint.status);
    setAdminNotes(complaint.adminNotes || '');
    setShowDialog(true);
  };

  const handleUpdate = async () => {
    if (!selectedComplaint) return;

    setUpdating(true);
    setError('');
    setSuccess('');

    try {
      await api.patch(`/complaints/admin/${selectedComplaint._id}/update`, {
        status: newStatus,
        adminNotes
      });

      setSuccess('Complaint updated successfully');
      fetchComplaints();

      setTimeout(() => {
        setShowDialog(false);
        setSelectedComplaint(null);
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update complaint');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string): 'default' | 'warning' | 'info' | 'success' | 'error' => {
    switch (status) {
      case 'pending': return 'warning';
      case 'in_review': return 'info';
      case 'resolved': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const formatComplaintType = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const columns: GridColDef[] = [
    {
      field: 'complainant',
      headerName: 'Complainant',
      width: 180,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {params.row.complainant.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.complainant.email}
          </Typography>
        </Box>
      )
    },
    {
      field: 'complainantRole',
      headerName: 'Role',
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Chip label={params.value} size="small" color={params.value === 'worker' ? 'primary' : 'default'} />
      )
    },
    {
      field: 'jobId',
      headerName: 'Job',
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">
          {params.value.profession}
        </Typography>
      )
    },
    {
      field: 'complaintType',
      headerName: 'Type',
      width: 180,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">
          {formatComplaintType(params.value as string)}
        </Typography>
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Chip 
          label={params.value.replace('_', ' ')} 
          color={getStatusColor(params.value as string)}
          size="small"
        />
      )
    },
    {
      field: 'createdAt',
      headerName: 'Date',
      width: 120,
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
        <Button
          size="small"
          variant="outlined"
          onClick={() => handleViewClick(params.row as Complaint)}
        >
          View
        </Button>
      )
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        Complaints Management
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Review and manage complaints from users and workers
      </Typography>

      {error && !showDialog && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && !showDialog && (
        <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            select
            label="Filter by Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="in_review">In Review</MenuItem>
            <MenuItem value="resolved">Resolved</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </TextField>

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

          <Button variant="contained" onClick={fetchComplaints}>
            Refresh
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={complaints}
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

      {/* View/Update Dialog */}
      <Dialog open={showDialog} onClose={() => !updating && setShowDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Complaint Details
        </DialogTitle>
        <DialogContent dividers>
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

          {selectedComplaint && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Complainant Info */}
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Complainant Information
                </Typography>
                <Typography variant="body2">
                  <strong>Name:</strong> {selectedComplaint.complainant.name}
                </Typography>
                <Typography variant="body2">
                  <strong>Email:</strong> {selectedComplaint.complainant.email}
                </Typography>
                <Typography variant="body2">
                  <strong>Phone:</strong> {selectedComplaint.complainant.phone}
                </Typography>
                <Typography variant="body2">
                  <strong>Role:</strong> <Chip label={selectedComplaint.complainantRole} size="small" />
                </Typography>
              </Paper>

              {/* Complaint Details */}
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Complaint Details
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Job/Booking:</strong> {selectedComplaint.jobId.profession} (ID: {selectedComplaint.jobId._id.slice(-8)})
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Type:</strong> {formatComplaintType(selectedComplaint.complaintType)}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Date Filed:</strong> {new Date(selectedComplaint.createdAt).toLocaleString()}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Description:</strong>
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {selectedComplaint.description}
                  </Typography>
                </Paper>
              </Paper>

              {/* Update Status */}
              <TextField
                select
                label="Status"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                disabled={updating}
                fullWidth
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="in_review">In Review</MenuItem>
                <MenuItem value="resolved">Resolved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </TextField>

              {/* Admin Notes */}
              <TextField
                label="Admin Notes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                disabled={updating}
                fullWidth
                multiline
                rows={4}
                placeholder="Add notes about your decision or actions taken..."
                helperText={`${adminNotes.length}/500 characters`}
                inputProps={{ maxLength: 500 }}
              />

              {selectedComplaint.resolvedBy && (
                <Alert severity="info">
                  Previously resolved by: {selectedComplaint.resolvedBy.name}
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setShowDialog(false)} disabled={updating} variant="outlined">
            Close
          </Button>
          <Button
            onClick={handleUpdate}
            variant="contained"
            color="primary"
            disabled={updating}
          >
            {updating ? <CircularProgress size={24} /> : 'Update Complaint'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ComplaintsManagement;
