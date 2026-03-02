import express from 'express';
import { protect } from '../middleware/auth';
import { isAdmin } from '../middleware/roleCheck';
import {
  getAllAccounts,
  deleteUserAccount,
  getDeletionLogs,
  getAccountDetails
} from '../controllers/accountDeletionController';

const router = express.Router();

// All routes are admin-only
router.use(protect);
router.use(isAdmin);

router.get('/admin/accounts', getAllAccounts);
router.get('/admin/account/:id', getAccountDetails);
router.delete('/admin/delete/:id', deleteUserAccount);
router.get('/admin/logs', getDeletionLogs);

export default router;
