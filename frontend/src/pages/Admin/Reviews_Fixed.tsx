// Page feature: drives the Reviews_Fixed screen and its user interactions.
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
  Rating,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Chip
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon } from '@mui/icons-material';
import api from '../../services/api';
import { Navbar } from '../../components/common/Navbar';
import { useToast } from '../../context/ToastContext';

interface Review {
  _id: string;
  booking: { _id: string };
  user: { _id: string; name: string };
  worker: { _id: string; userId: { name: string } };
  rating: number;
  reviewTitle: string;
  reviewComment: string;
  serviceQuality: number;
  punctuality: number;
  cleanliness: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

const Reviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchId, setSearchId] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: 'delete' | 'moderate' | 'submit' | null;
    reviewId: string | null;
    moderateStatus?: 'approved' | 'rejected';
  }>({ open: false, action: null, reviewId: null });
  
  const { showToast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    booking: '',
    rating: 5,
    reviewTitle: '',
    reviewComment: '',
    serviceQuality: 5,
    punctuality: 5,
    cleanliness: 5
  });

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    if (searchId.trim() === '') {
      setFilteredReviews(reviews);
    } else {
      const filtered = reviews.filter(review =>
        review._id.toLowerCase().includes(searchId.toLowerCase()) ||
        review.booking._id.toLowerCase().includes(searchId.toLowerCase())
      );
      setFilteredReviews(filtered);
    }
  }, [searchId, reviews]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reviews');
      const data = response.data.data || response.data || [];
      setReviews(data);
      setFilteredReviews(data);
    } catch (error: any) {
      console.error('Error fetching reviews:', error);
      showToast(error.response?.data?.message || 'Failed to fetch reviews', 'error');
      setReviews([]);
      setFilteredReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (mode: 'create' | 'edit', review?: Review) => {
    setDialogMode(mode);
    if (mode === 'edit' && review) {
      setSelectedReview(review);
      setFormData({
        booking: review.booking._id,
        rating: review.rating,
        reviewTitle: review.reviewTitle,
        reviewComment: review.reviewComment,
        serviceQuality: review.serviceQuality,
        punctuality: review.punctuality,
        cleanliness: review.cleanliness
      });
    } else {
      setSelectedReview(null);
      setFormData({
        booking: '',
        rating: 5,
        reviewTitle: '',
        reviewComment: '',
        serviceQuality: 5,
        punctuality: 5,
        cleanliness: 5
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedReview(null);
  };

  const handleSubmitClick = () => {
    // Show confirmation dialog before submitting
    setConfirmDialog({ open: true, action: 'submit', reviewId: selectedReview?._id || null });
  };

  const handleSubmit = async () => {
    try {
      if (dialogMode === 'create') {
        await api.post('/reviews/create', formData);
        showToast('Review created successfully', 'success');
      } else if (dialogMode === 'edit' && selectedReview) {
        await api.patch(`/reviews/${selectedReview._id}`, formData);
        showToast('Review updated successfully', 'success');
      }
      
      setConfirmDialog({ open: false, action: null, reviewId: null });
      handleCloseDialog();
      await fetchReviews(); // Refresh the list
    } catch (error: any) {
      console.error('Submit error:', error);
      showToast(error.response?.data?.message || 'Operation failed', 'error');
      setConfirmDialog({ open: false, action: null, reviewId: null });
    }
  };

  const handleDeleteClick = (reviewId: string) => {
    setConfirmDialog({ open: true, action: 'delete', reviewId });
  };

  const handleDelete = async () => {
    if (!confirmDialog.reviewId) return;
    try {
      await api.delete(`/reviews/${confirmDialog.reviewId}`);
      showToast('Review deleted successfully', 'success');
      setConfirmDialog({ open: false, action: null, reviewId: null });
      await fetchReviews(); // Refresh the list
    } catch (error: any) {
      console.error('Delete error:', error);
      showToast(error.response?.data?.message || 'Delete failed', 'error');
      setConfirmDialog({ open: false, action: null, reviewId: null });
    }
  };

  const handleModerateClick = (reviewId: string, newStatus: 'approved' | 'rejected') => {
    setConfirmDialog({ open: true, action: 'moderate', reviewId, moderateStatus: newStatus });
  };

  const handleModerate = async () => {
    if (!confirmDialog.reviewId || !confirmDialog.moderateStatus) return;
    try {
      await api.patch(`/reviews/${confirmDialog.reviewId}/moderate`, { status: confirmDialog.moderateStatus });
      showToast(`Review ${confirmDialog.moderateStatus} successfully`, 'success');
      setConfirmDialog({ open: false, action: null, reviewId: null });
      await fetchReviews(); // Refresh the list
    } catch (error: any) {
      console.error('Moderation error:', error);
      showToast(error.response?.data?.message || 'Moderation failed', 'error');
      setConfirmDialog({ open: false, action: null, reviewId: null });
    }
  };

  const columns: GridColDef[] = [
    { 
      field: '_id', 
      headerName: 'Review ID', 
      width: 100, 
      renderCell: (params: GridRenderCellParams) => params.value.slice(-8) 
    },
    { 
      field: 'bookingId', 
      headerName: 'Booking ID', 
      width: 100, 
      renderCell: (params: GridRenderCellParams) => params.row.booking._id.slice(-8) 
    },
    { 
      field: 'userName', 
      headerName: 'User', 
      width: 150, 
      renderCell: (params: GridRenderCellParams) => params.row.user.name 
    },
    { 
      field: 'workerName', 
      headerName: 'Worker', 
      width: 150, 
      renderCell: (params: GridRenderCellParams) => params.row.worker.userId.name 
    },
    { 
      field: 'rating', 
      headerName: 'Rating', 
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Rating value={params.row.rating} readOnly size="small" />
      )
    },
    { field: 'reviewTitle', headerName: 'Title', width: 200 },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Chip 
          label={params.row.status} 
          color={params.row.status === 'approved' ? 'success' : params.row.status === 'rejected' ? 'error' : 'warning'}
          size="small"
        />
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 280,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
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
          {params.row.status === 'pending' && (
            <>
              <Button 
                size="small" 
                onClick={() => handleModerateClick(params.row._id, 'approved')} 
                color="success"
                variant="outlined"
              >
                Approve
              </Button>
              <Button 
                size="small" 
                onClick={() => handleModerateClick(params.row._id, 'rejected')} 
                color="error"
                variant="outlined"
              >
                Reject
              </Button>
            </>
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
          <Typography variant="h4">Reviews Management</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog('create')}>
            Add Review
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            label="Search by Review ID or Booking ID"
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
          rows={filteredReviews}
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
          <DialogTitle>{dialogMode === 'create' ? 'Create Review' : 'Edit Review'}</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <TextField
                label="Booking ID"
                value={formData.booking}
                onChange={(e) => setFormData({ ...formData, booking: e.target.value })}
                fullWidth
                required
                disabled={dialogMode === 'edit'}
                helperText="Enter the booking ID for this review"
              />
              <TextField
                label="Review Title"
                value={formData.reviewTitle}
                onChange={(e) => setFormData({ ...formData, reviewTitle: e.target.value })}
                fullWidth
                required
              />
              <TextField
                label="Review Comment"
                value={formData.reviewComment}
                onChange={(e) => setFormData({ ...formData, reviewComment: e.target.value })}
                fullWidth
                multiline
                rows={4}
                required
              />
              <Box>
                <Typography component="legend">Overall Rating</Typography>
                <Rating
                  value={formData.rating}
                  onChange={(_, value) => setFormData({ ...formData, rating: value || 5 })}
                  size="large"
                />
              </Box>
              <Box>
                <Typography component="legend">Service Quality</Typography>
                <Rating
                  value={formData.serviceQuality}
                  onChange={(_, value) => setFormData({ ...formData, serviceQuality: value || 5 })}
                  size="large"
                />
              </Box>
              <Box>
                <Typography component="legend">Punctuality</Typography>
                <Rating
                  value={formData.punctuality}
                  onChange={(_, value) => setFormData({ ...formData, punctuality: value || 5 })}
                  size="large"
                />
              </Box>
              <Box>
                <Typography component="legend">Cleanliness</Typography>
                <Rating
                  value={formData.cleanliness}
                  onChange={(_, value) => setFormData({ ...formData, cleanliness: value || 5 })}
                  size="large"
                />
              </Box>
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
          onClose={() => setConfirmDialog({ open: false, action: null, reviewId: null })}
        >
          <DialogTitle>
            {confirmDialog.action === 'delete' && 'Confirm Delete'}
            {confirmDialog.action === 'moderate' && `Confirm ${confirmDialog.moderateStatus}`}
            {confirmDialog.action === 'submit' && 'Confirm Submit'}
          </DialogTitle>
          <DialogContent>
            <Typography>
              {confirmDialog.action === 'delete' && 'Are you sure you want to delete this review?'}
              {confirmDialog.action === 'moderate' && `Are you sure you want to ${confirmDialog.moderateStatus} this review?`}
              {confirmDialog.action === 'submit' && `Are you sure you want to ${dialogMode} this review?`}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDialog({ open: false, action: null, reviewId: null })}>
              Cancel
            </Button>
            <Button 
              onClick={
                confirmDialog.action === 'delete' ? handleDelete : 
                confirmDialog.action === 'moderate' ? handleModerate : 
                handleSubmit
              } 
              color={confirmDialog.action === 'delete' || confirmDialog.moderateStatus === 'rejected' ? 'error' : 'primary'} 
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

export default Reviews;
