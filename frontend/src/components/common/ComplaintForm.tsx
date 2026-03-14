// UI component: renders and manages the ComplaintForm feature block.
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  CircularProgress,
  Alert,
  Box,
  Typography
} from '@mui/material';
import api from '../../services/api';

interface ComplaintFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  userId: string;
  jobId?: string;
}

const complaintTypes = [
  { value: 'payment_issue', label: 'Payment Issue' },
  { value: 'service_quality', label: 'Service Quality' },
  { value: 'no_show', label: 'No-Show' },
  { value: 'unprofessional_behavior', label: 'Unprofessional Behavior' },
  { value: 'other', label: 'Other' }
];

const ComplaintForm: React.FC<ComplaintFormProps> = ({
  open,
  onClose,
  onSuccess,
  userId,
  jobId: initialJobId
}) => {
  const [formData, setFormData] = useState({
    jobId: initialJobId || '',
    complaintType: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [bookings, setBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    if (open && !initialJobId) {
      fetchUserBookings();
    }
  }, [open]);

  const fetchUserBookings = async () => {
    setLoadingBookings(true);
    try {
      const response = await api.get(`/bookings/user/${userId}`);
      setBookings(response.data.bookings || []);
    } catch (err: any) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load bookings');
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmitClick = () => {
    // Validation
    if (!formData.jobId || !formData.complaintType || !formData.description.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.description.trim().length < 20) {
      setError('Please provide a detailed description (at least 20 characters)');
      return;
    }

    setShowConfirmation(true);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/complaints/create', formData);
      
      setSuccess('Complaint submitted successfully! Our team will review it soon.');
      
      // Reset form after 2 seconds
      setTimeout(() => {
        handleClose();
        if (onSuccess) onSuccess();
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setLoading(false);
      setShowConfirmation(false);
    }
  };

  const handleClose = () => {
    setFormData({
      jobId: initialJobId || '',
      complaintType: '',
      description: ''
    });
    setError('');
    setSuccess('');
    setShowConfirmation(false);
    onClose();
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6" component="div" fontWeight="bold">
            File a Complaint
          </Typography>
          <Typography variant="body2" color="text.secondary">
            We take your concerns seriously. Please provide details below.
          </Typography>
        </DialogTitle>
        
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {error && (
              <Alert severity="error" onClose={() => setError('')}>
                {error}
              </Alert>
            )}
            
            {success && (
              <Alert severity="success" onClose={() => setSuccess('')}>
                {success}
              </Alert>
            )}

            {/* Job/Booking ID */}
            {initialJobId ? (
              <TextField
                label="Job ID"
                value={formData.jobId}
                disabled
                fullWidth
              />
            ) : (
              <TextField
                select
                label="Select Job/Booking *"
                name="jobId"
                value={formData.jobId}
                onChange={handleChange}
                disabled={loadingBookings || loading}
                fullWidth
                helperText={loadingBookings ? 'Loading your bookings...' : 'Select the job related to this complaint'}
              >
                {loadingBookings ? (
                  <MenuItem disabled>
                    <CircularProgress size={20} />
                  </MenuItem>
                ) : bookings.length === 0 ? (
                  <MenuItem disabled>No bookings found</MenuItem>
                ) : (
                  bookings.map((booking) => (
                    <MenuItem key={booking._id} value={booking._id}>
                      {booking.profession} - {new Date(booking.createdAt).toLocaleDateString()} - {booking.status}
                    </MenuItem>
                  ))
                )}
              </TextField>
            )}

            {/* Complaint Type */}
            <TextField
              select
              label="Complaint Type *"
              name="complaintType"
              value={formData.complaintType}
              onChange={handleChange}
              disabled={loading}
              fullWidth
              helperText="Select the category that best describes your issue"
            >
              {complaintTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </TextField>

            {/* Description */}
            <TextField
              label="Description *"
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={loading}
              fullWidth
              multiline
              rows={6}
              placeholder="Please provide detailed information about your complaint. Include relevant dates, times, and any other pertinent details..."
              helperText={`${formData.description.length}/1000 characters (minimum 20)`}
              inputProps={{ maxLength: 1000 }}
            />

            <Typography variant="caption" color="text.secondary">
              * Required fields. Your complaint will be reviewed by our admin team.
            </Typography>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleClose} disabled={loading} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleSubmitClick}
            disabled={loading || !formData.jobId || !formData.complaintType || !formData.description}
            variant="contained"
            color="primary"
          >
            {loading ? <CircularProgress size={24} /> : 'Submit Complaint'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onClose={() => setShowConfirmation(false)}>
        <DialogTitle>Confirm Complaint Submission</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to submit this complaint? Once submitted, it will be reviewed by our admin team.
          </Typography>
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="body2" gutterBottom>
              <strong>Complaint Type:</strong> {complaintTypes.find(t => t.value === formData.complaintType)?.label}
            </Typography>
            <Typography variant="body2">
              <strong>Description:</strong> {formData.description.substring(0, 100)}...
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmation(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained" color="error" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Confirm & Submit'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ComplaintForm;
