// Page feature: drives the Reviews screen and its user interactions.
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
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
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

interface Booking {
  _id: string;
  user: { name: string };
  worker: { userId: { name: string }; profession: string };
  profession: string;
  status: string;
}

const Reviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [availableBookings, setAvailableBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchId, setSearchId] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [submitting, setSubmitting] = useState(false);
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
    fetchAvailableBookings();
  }, []);

  const fetchAvailableBookings = async () => {
    try {
      const response = await api.get('/admin/bookings', { params: { status: 'completed', limit: 100 } });
      setAvailableBookings(response.data.bookings || []);
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
    }
  };

  useEffect(() => {
    if (searchId.trim() === '') {
      setFilteredReviews(reviews);
    } else {
      const searchLower = searchId.toLowerCase();
      const filtered = reviews.filter(review =>
        review._id.toLowerCase().includes(searchLower) ||
        review.booking._id.toLowerCase().includes(searchLower) ||
        review.user?.name?.toLowerCase().includes(searchLower) ||
        review.worker?.userId?.name?.toLowerCase().includes(searchLower) ||
        review.reviewTitle.toLowerCase().includes(searchLower) ||
        review.reviewComment.toLowerCase().includes(searchLower) ||
        review.status.toLowerCase().includes(searchLower)
      );
      setFilteredReviews(filtered);
    }
  }, [searchId, reviews]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reviews');
      const data = response.data.reviews || response.data.data || response.data || [];
      setReviews(data);
      setFilteredReviews(data);
    } catch (error: any) {
      console.error('Error fetching reviews:', error);
      showToast({ message: error.response?.data?.message || 'Failed to fetch reviews', type: 'error' });
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

  const validateForm = (): boolean => {
    if (dialogMode === 'create' && !formData.booking) {
      showToast({ message: 'Please select a booking', type: 'error' });
      return false;
    }

    if (!formData.reviewTitle || formData.reviewTitle.trim().length < 5) {
      showToast({ message: 'Review title must be at least 5 characters', type: 'error' });
      return false;
    }

    if (!formData.reviewComment || formData.reviewComment.trim().length < 10) {
      showToast({ message: 'Review comment must be at least 10 characters', type: 'error' });
      return false;
    }

    if (!formData.rating || formData.rating < 1 || formData.rating > 5) {
      showToast({ message: 'Please provide a valid rating (1-5)', type: 'error' });
      return false;
    }

    if (!formData.serviceQuality || formData.serviceQuality < 1 || formData.serviceQuality > 5) {
      showToast({ message: 'Please provide a valid service quality rating (1-5)', type: 'error' });
      return false;
    }

    if (!formData.punctuality || formData.punctuality < 1 || formData.punctuality > 5) {
      showToast({ message: 'Please provide a valid punctuality rating (1-5)', type: 'error' });
      return false;
    }

    if (!formData.cleanliness || formData.cleanliness < 1 || formData.cleanliness > 5) {
      showToast({ message: 'Please provide a valid cleanliness rating (1-5)', type: 'error' });
      return false;
    }

    return true;
  };

  const handleSubmitClick = () => {
    if (!validateForm()) {
      return;
    }
    // Show confirmation dialog before submitting
    setConfirmDialog({ open: true, action: 'submit', reviewId: selectedReview?._id || null });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      if (dialogMode === 'create') {
        const payload = {
          bookingId: formData.booking,
          rating: formData.rating,
          reviewTitle: formData.reviewTitle,
          reviewComment: formData.reviewComment,
          serviceQuality: formData.serviceQuality,
          punctuality: formData.punctuality,
          cleanliness: formData.cleanliness
        };
        await api.post('/reviews/create', payload);
        showToast({ message: 'Review created successfully', type: 'success' });
      } else if (dialogMode === 'edit' && selectedReview) {
        const payload = {
          rating: formData.rating,
          reviewTitle: formData.reviewTitle,
          reviewComment: formData.reviewComment,
          serviceQuality: formData.serviceQuality,
          punctuality: formData.punctuality,
          cleanliness: formData.cleanliness
        };
        await api.patch(`/reviews/${selectedReview._id}`, payload);
        showToast({ message: 'Review updated successfully', type: 'success' });
      }
      
      setConfirmDialog({ open: false, action: null, reviewId: null });
      handleCloseDialog();
      await fetchReviews(); // Refresh the list
    } catch (error: any) {
      console.error('Submit error:', error);
      showToast({ message: error.response?.data?.message || 'Operation failed', type: 'error' });
      setConfirmDialog({ open: false, action: null, reviewId: null });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (reviewId: string) => {
    setConfirmDialog({ open: true, action: 'delete', reviewId });
  };

  const handleDelete = async () => {
    if (!confirmDialog.reviewId) return;
    try {
      await api.delete(`/reviews/${confirmDialog.reviewId}`);
      showToast({ message: 'Review deleted successfully', type: 'success' });
      setConfirmDialog({ open: false, action: null, reviewId: null });
      await fetchReviews(); // Refresh the list
    } catch (error: any) {
      console.error('Delete error:', error);
      showToast({ message: error.response?.data?.message || 'Delete failed', type: 'error' });
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
      showToast({ message: `Review ${confirmDialog.moderateStatus} successfully`, type: 'success' });
      setConfirmDialog({ open: false, action: null, reviewId: null });
      await fetchReviews(); // Refresh the list
    } catch (error: any) {
      console.error('Moderation error:', error);
      showToast({ message: error.response?.data?.message || 'Moderation failed', type: 'error' });
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
      renderCell: (params: GridRenderCellParams) => params.row.booking?._id?.slice(-8) || 'N/A' 
    },
    { 
      field: 'userName', 
      headerName: 'User', 
      width: 150, 
      renderCell: (params: GridRenderCellParams) => params.row.user?.name || 'N/A' 
    },
    { 
      field: 'workerName', 
      headerName: 'Worker', 
      width: 150, 
      renderCell: (params: GridRenderCellParams) => params.row.worker?.userId?.name || 'N/A' 
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
          <Box>
            <Typography variant="h4">Reviews Management</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Total: {reviews.length} reviews | Showing: {filteredReviews.length} | Pending: {reviews.filter(r => r.status === 'pending').length}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="outlined" 
              onClick={fetchReviews}
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
              Add Review
            </Button>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            label="Search Reviews"
            placeholder="Search by ID, user, worker, title, comment, or status..."
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
                  {searchId ? 'No reviews found matching your search' : 'No reviews available'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {searchId ? 'Try a different search term' : 'Reviews will appear here once customers leave feedback'}
                </Typography>
              </Box>
            ),
          }}
        />

        {/* Create/Edit Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>{dialogMode === 'create' ? 'Create Review' : 'Edit Review'}</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <FormControl fullWidth required disabled={dialogMode === 'edit'}>
                <InputLabel>Select Booking</InputLabel>
                <Select
                  value={formData.booking}
                  onChange={(e) => setFormData({ ...formData, booking: e.target.value })}
                  label="Select Booking"
                >
                  <MenuItem value="">
                    <em>Choose a completed booking...</em>
                  </MenuItem>
                  {availableBookings.map((booking) => (
                    <MenuItem key={booking._id} value={booking._id}>
                      {booking._id.slice(-8)} - {booking.profession} - {booking.user.name} / {booking.worker.userId.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
            <Button onClick={handleCloseDialog} disabled={submitting}>Cancel</Button>
            <Button onClick={handleSubmitClick} variant="contained" color="primary" disabled={submitting}>
              {submitting ? 'Submitting...' : (dialogMode === 'create' ? 'Create' : 'Update')}
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
