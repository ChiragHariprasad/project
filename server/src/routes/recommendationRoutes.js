import express from 'express';
import {
  getUserRecommendations,
  getFrequentItems,
  getSeasonalRecommendations,
  recordPurchaseHistory,
  getRestockRecommendations,
  getInventoryInsights,
  getUserPurchaseHistory
} from '../controllers/recommendationController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// User recommendation routes
router.get('/user', protect, getUserRecommendations);
router.get('/frequent', protect, getFrequentItems);
router.get('/seasonal', protect, getSeasonalRecommendations);
router.get('/history', protect, getUserPurchaseHistory);
router.post('/record-purchase', protect, recordPurchaseHistory);

// Admin routes
router.get('/restock', protect, admin, getRestockRecommendations);
router.get('/insights', protect, admin, getInventoryInsights);

export default router;