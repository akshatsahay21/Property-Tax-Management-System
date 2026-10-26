import express from 'express';
import { getAllUsers, getAllEntries, getDashboardStats } from '../controllers/adminController.js';
import protect from '../middleware/auth.js';
import authorize from '../middleware/rbac.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));
router.use(apiLimiter);

router.get('/users', getAllUsers);

router.get('/entries', getAllEntries);

router.get('/stats', getDashboardStats);

export default router;
