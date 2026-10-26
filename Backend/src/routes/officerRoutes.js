import express from 'express';
import { getPendingEntries, approveEntry, rejectEntry, getRejectedDrafts } from '../controllers/officerController.js';
import protect from '../middleware/auth.js';
import authorize from '../middleware/rbac.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.use(protect);
router.use(authorize('ward_officer', 'admin'));
router.use(apiLimiter);

router.get('/pending', getPendingEntries);

router.get('/drafts', getRejectedDrafts);

router.put('/:entryId/approve', approveEntry);

router.put('/:entryId/reject', rejectEntry);

export default router;
