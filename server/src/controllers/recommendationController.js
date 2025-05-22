import recommendationService from '../services/recommendationService.js';
import PurchaseHistory from '../models/purchaseHistoryModel.js';
import InventoryItem from '../models/inventoryModel.js';
import User from '../models/userModel.js';

// @desc    Get personalized recommendations for a user
// @route   GET /api/recommendations/user
// @access  Private
export const getUserRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 10;
    
    const recommendations = await recommendationService.getUserRecommendations(userId, limit);
    
    res.json({
      success: true,
      recommendations
    });
  } catch (error) {
    console.error('Error getting user recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting recommendations',
      error: error.message
    });
  }
};

// @desc    Get frequently purchased items for a user
// @route   GET /api/recommendations/frequent
// @access  Private
export const getFrequentItems = async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 10;
    
    const frequentItems = await recommendationService.getFrequentlyPurchasedItems(userId, limit);
    
    res.json({
      success: true,
      frequentItems
    });
  } catch (error) {
    console.error('Error getting frequent items:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting frequent items',
      error: error.message
    });
  }
};

// @desc    Get seasonal recommendations
// @route   GET /api/recommendations/seasonal
// @access  Private
export const getSeasonalRecommendations = async (req, res) => {
  try {
    const currentMonth = new Date().getMonth();
    const user = req.user;
    const limit = parseInt(req.query.limit) || 10;
    
    const seasonalItems = await recommendationService.getSeasonalRecommendations(currentMonth, user, limit);
    
    res.json({
      success: true,
      seasonalItems
    });
  } catch (error) {
    console.error('Error getting seasonal recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting seasonal recommendations',
      error: error.message
    });
  }
};

// @desc    Record purchase history after checkout
// @route   POST /api/recommendations/record-purchase
// @access  Private
export const recordPurchaseHistory = async (req, res) => {
  try {
    const { items, totalAmount } = req.body;
    const userId = req.user._id;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid purchase data'
      });
    }
    
    // Get item details to store category information
    const itemIds = items.map(item => item.id);
    const inventoryItems = await InventoryItem.find({ _id: { $in: itemIds } });
    
    // Create purchase history record
    const purchaseRecord = new PurchaseHistory({
      user: userId,
      items: items.map(item => {
        const inventoryItem = inventoryItems.find(invItem => 
          invItem._id.toString() === item.id.toString()
        );
        
        return {
          item: item.id,
          quantity: item.quantity,
          price: inventoryItem ? inventoryItem.price : 0,
          categoryAtPurchase: inventoryItem ? inventoryItem.category : '',
          subCategoryAtPurchase: inventoryItem ? inventoryItem.subCategory : ''
        };
      }),
      totalAmount: totalAmount || 0,
      purchaseDate: new Date()
    });
    
    await purchaseRecord.save();
    
    // Update item purchase frequency and popularity
    for (const item of items) {
      await InventoryItem.findByIdAndUpdate(
        item.id,
        { 
          $inc: { 
            purchaseFrequency: 1,
            popularity: item.quantity
          } 
        }
      );
    }
    
    res.status(201).json({
      success: true,
      message: 'Purchase history recorded successfully',
      purchaseId: purchaseRecord._id
    });
  } catch (error) {
    console.error('Error recording purchase history:', error);
    res.status(500).json({
      success: false,
      message: 'Error recording purchase history',
      error: error.message
    });
  }
};

// @desc    Get admin restock recommendations
// @route   GET /api/recommendations/restock
// @access  Private/Admin
export const getRestockRecommendations = async (req, res) => {
  try {
    const recommendations = await recommendationService.getRestockRecommendations();
    
    res.json({
      success: true,
      recommendations
    });
  } catch (error) {
    console.error('Error getting restock recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting restock recommendations',
      error: error.message
    });
  }
};

// @desc    Get inventory insights for admin dashboard
// @route   GET /api/recommendations/insights
// @access  Private/Admin
export const getInventoryInsights = async (req, res) => {
  try {
    const insights = await recommendationService.getInventoryInsights();
    
    res.json({
      success: true,
      insights
    });
  } catch (error) {
    console.error('Error getting inventory insights:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting inventory insights',
      error: error.message
    });
  }
};

// @desc    Get user purchase history
// @route   GET /api/recommendations/history
// @access  Private
export const getUserPurchaseHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    
    const history = await PurchaseHistory.find({ user: userId })
      .sort({ purchaseDate: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .populate('items.item');
    
    const total = await PurchaseHistory.countDocuments({ user: userId });
    
    res.json({
      success: true,
      history,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page
      }
    });
  } catch (error) {
    console.error('Error getting user purchase history:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting purchase history',
      error: error.message
    });
  }
};