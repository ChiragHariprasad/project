import express from 'express';
import {
  getInventoryItems,
  getInventoryItemById,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  updateInventoryStock
} from '../controllers/inventoryController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes - None

// Protected routes
router.route('/')
  .get(protect, getInventoryItems)
  .post(protect, admin, createInventoryItem);

router.put('/checkout', protect, updateInventoryStock);

router.route('/:id')
  .get(protect, getInventoryItemById)
  .put(protect, admin, updateInventoryItem)
  .delete(protect, admin, deleteInventoryItem);

export default router;