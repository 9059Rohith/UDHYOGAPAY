import express from 'express';
import { protect } from '../middleware/auth';
import { isAdmin } from '../middleware/roleCheck';
import {
  createPromotion,
  deletePromotion,
  getPromotionById,
  getPromotions,
  updatePromotion,
  validateAndApplyPromotion
} from '../controllers/promotionController';

const router = express.Router();

router.post('/validate-apply', protect, validateAndApplyPromotion);

router.post('/', protect, isAdmin, createPromotion);
router.get('/', protect, isAdmin, getPromotions);
router.get('/:id', protect, isAdmin, getPromotionById);
router.patch('/:id', protect, isAdmin, updatePromotion);
router.delete('/:id', protect, isAdmin, deletePromotion);

export default router;
