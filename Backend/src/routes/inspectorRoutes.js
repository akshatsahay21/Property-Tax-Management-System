import express from 'express';
import { createEntry, getMyEntries, updateRejectedEntry } from '../controllers/inspectorController.js';
import protect from '../middleware/auth.js';
import authorize from '../middleware/rbac.js';
import upload from '../middleware/upload.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.use(protect);
router.use(authorize('field_inspector', 'admin'));
router.use(apiLimiter); 

router.post('/', upload.single('image'), createEntry);

router.get('/', getMyEntries);

router.put('/:entryId/resubmit', upload.single('image'), updateRejectedEntry);

export default router;
