import { Router } from 'express';
import {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
} from '../controllers/property.controller';
import { authenticate, authorizeOwner } from '../middleware/auth.middleware';

const router = Router();

router.get('/', getProperties);
router.get('/:id', getPropertyById);
router.post('/', authenticate, authorizeOwner, createProperty);
router.put('/:id', authenticate, updateProperty);
router.delete('/:id', authenticate, deleteProperty);

export default router;