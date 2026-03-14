// Backend comment: auth
import express from 'express';
import { register, login, logout, verifyToken, adminResetPassword, forgotPassword, resetPassword } from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/verify-token', protect, verifyToken);
router.post('/admin/reset-password', adminResetPassword);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

export default router;
