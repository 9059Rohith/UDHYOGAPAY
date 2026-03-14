// Backend comment: matching
import { Router } from 'express';
import { findMatchingWorkers, getMatchingEngineStatus } from '../controllers/matchingController';
import { protect } from '../middleware/auth';

const router = Router();

// Find matching workers (protected - user must be logged in)
router.post('/find', protect, findMatchingWorkers);

// Get matching engine status (public)
router.get('/status', getMatchingEngineStatus);

export default router;
