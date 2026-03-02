import express from 'express';
import {
  findNearbyWorkers,
  geocodeAddress,
  reverseGeocode,
  calculateDistance,
  getAllOnlineWorkers,
  deleteAccount
} from '../controllers/userController';
import { protect } from '../middleware/auth';
import { isUser } from '../middleware/roleCheck';

const router = express.Router();

router.get('/workers/all-online', protect, isUser, getAllOnlineWorkers);
router.post('/workers/nearby', protect, isUser, findNearbyWorkers);
router.post('/geocode', protect, geocodeAddress);
router.post('/reverse-geocode', protect, reverseGeocode);
router.post('/calculate-distance', protect, calculateDistance);
router.delete('/account', protect, deleteAccount);

export default router;
