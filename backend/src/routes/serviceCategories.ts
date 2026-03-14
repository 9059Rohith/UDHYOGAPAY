// Backend comment: serviceCategories
import express from 'express';
import { protect } from '../middleware/auth';
import { isAdmin } from '../middleware/roleCheck';
import {
  createServiceCategory,
  getAllServiceCategories,
  getServiceCategoryById,
  updateServiceCategory,
  deleteServiceCategory,
  toggleServiceStatus,
  calculatePricing,
  getActiveServiceCategories
} from '../controllers/serviceCategoryController';

const router = express.Router();

// Public routes
router.get('/active', getActiveServiceCategories);
router.post('/calculate-pricing', calculatePricing);

// Protected routes (admin only)
router.post('/create', protect, isAdmin, createServiceCategory);
router.get('/', protect, isAdmin, getAllServiceCategories);
router.get('/:id', protect, isAdmin, getServiceCategoryById);
router.patch('/:id', protect, isAdmin, updateServiceCategory);
router.delete('/:id', protect, isAdmin, deleteServiceCategory);
router.patch('/:id/toggle-status', protect, isAdmin, toggleServiceStatus);

export default router;
