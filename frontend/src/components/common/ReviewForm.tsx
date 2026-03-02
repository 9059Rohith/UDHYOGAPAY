import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Rating,
  CircularProgress,
  Alert
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import api from '../../services/api';

interface ReviewFormProps {
  open: boolean;
  onClose: () => void;
  bookingId: string;
  onSuccess?: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  open,
  onClose,
  bookingId,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    rating: 0,
    goodAttributes: '',
    whatToImprove: '',
    reviewComment: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleRatingChange = (event: React.SyntheticEvent, newValue: number | null) => {
    setFormData(prev => ({
      ...prev,
      rating: newValue || 0
    }));
    setError('');
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
    if (formData.rating === 0) {
      setError('Please provide a rating');
      return;
    }

    if (!formData.reviewComment.trim()) {
      setError('Please provide your comments');
      return;
    }

    if (formData.reviewComment.trim().length < 10) {
      setError('Please provide more detailed comments (at least 10 characters)');
      return;
    }

    setShowConfirmation(true);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/reviews/create', {
        bookingId,
        ...formData
      });
      
      setSuccess('Review submitted successfully! Thank you for your feedback.');
      
      // Close dialog after 2 seconds
      setTimeout(() => {
        handleClose();
        if (onSuccess) onSuccess();
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
      setShowConfirmation(false);
    }
  };

  const handleClose = () => {
    setFormData({
      rating: 0,
      goodAttributes: '',
      whatToImprove: '',
      reviewComment: ''
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
            Rate Your Experience
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your feedback helps us improve our service
          </Typography>
        </DialogTitle>
        
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
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

            {/* Rating */}
            <Box>
              <Typography component="legend" gutterBottom fontWeight="medium">
                Overall Rating *
              </Typography>
              <Rating
                name="rating"
                value={formData.rating}
                onChange={handleRatingChange}
                size="large"
                precision={1}
                emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
                disabled={loading}
              />
              <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                {formData.rating === 0 && 'Select a rating from 1 to 5 stars'}
                {formData.rating === 1 && 'Poor experience'}
                {formData.rating === 2 && 'Below expectations'}
                {formData.rating === 3 && 'Average'}
                {formData.rating === 4 && 'Good experience'}
                {formData.rating === 5 && 'Excellent!'}
              </Typography>
            </Box>

            {/* Good Attributes */}
            <TextField
              label="What did you like? (Good Attributes)"
              name="goodAttributes"
              value={formData.goodAttributes}
              onChange={handleChange}
              disabled={loading}
              fullWidth
              multiline
              rows={3}
              placeholder="e.g., Professional behavior, punctuality, quality of work..."
              helperText={`${formData.goodAttributes.length}/300 characters`}
              inputProps={{ maxLength: 300 }}
            />

            {/* What to Improve */}
            <TextField
              label="What could be better? (Areas to Improve)"
              name="whatToImprove"
              value={formData.whatToImprove}
              onChange={handleChange}
              disabled={loading}
              fullWidth
              multiline
              rows={3}
              placeholder="e.g., Communication, time management, cleanliness..."
              helperText={`${formData.whatToImprove.length}/300 characters`}
              inputProps={{ maxLength: 300 }}
            />

            {/* Comments */}
            <TextField
              label="Additional Comments *"
              name="reviewComment"
              value={formData.reviewComment}
              onChange={handleChange}
              disabled={loading}
              fullWidth
              multiline
              rows={4}
              placeholder="Share your overall experience with this service..."
              helperText={`${formData.reviewComment.length}/500 characters (minimum 10)`}
              inputProps={{ maxLength: 500 }}
            />

            <Typography variant="caption" color="text.secondary">
              * Required fields. Your review will help other users and improve our service quality.
            </Typography>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleClose} disabled={loading} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleSubmitClick}
            disabled={loading || formData.rating === 0 || !formData.reviewComment}
            variant="contained"
            color="primary"
          >
            {loading ? <CircularProgress size={24} /> : 'Submit Review'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onClose={() => setShowConfirmation(false)}>
        <DialogTitle>Confirm Review Submission</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Are you sure you want to submit this review?
          </Typography>
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" mr={1}>
                <strong>Rating:</strong>
              </Typography>
              <Rating value={formData.rating} readOnly size="small" />
              <Typography variant="body2" ml={1}>
                ({formData.rating}/5)
              </Typography>
            </Box>
            <Typography variant="body2" gutterBottom>
              <strong>Comments:</strong> {formData.reviewComment.substring(0, 100)}{formData.reviewComment.length > 100 && '...'}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmation(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained" color="primary" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Confirm & Submit'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ReviewForm;
