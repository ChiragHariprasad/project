import mongoose from 'mongoose';
import PurchaseHistory from '../models/purchaseHistoryModel.js';
import InventoryItem from '../models/inventoryModel.js';
import User from '../models/userModel.js';

/**
 * Recommendation Service - Provides ML-based recommendations for users and inventory management
 */
class RecommendationService {
  /**
   * Get personalized recommendations for a user based on their purchase history
   * @param {String} userId - The user's ID
   * @param {Number} limit - Number of recommendations to return
   * @returns {Promise<Array>} - Array of recommended items
   */
  async getUserRecommendations(userId, limit = 10) {
    try {
      // Convert userId to ObjectId
      const userObjectId = mongoose.Types.ObjectId(userId);
      
      // Get user profile for personalization
      const user = await User.findById(userObjectId);
      if (!user) {
        throw new Error('User not found');
      }
      
      // 1. Get frequency-based recommendations (items the user buys regularly)
      const frequentItems = await this.getFrequentlyPurchasedItems(userObjectId, limit);
      
      // 2. Get collaborative filtering recommendations (items bought by similar users)
      const collaborativeRecs = await this.getCollaborativeRecommendations(userObjectId, user, limit);
      
      // 3. Get content-based recommendations (items similar to what they've bought)
      const contentRecs = await this.getContentBasedRecommendations(userObjectId, user, limit);
      
      // 4. Get seasonal recommendations
      const currentMonth = new Date().getMonth();
      const seasonalRecs = await this.getSeasonalRecommendations(currentMonth, user, Math.floor(limit / 3));
      
      // 5. Get recommendations for items running low in household
      const lowStockRecs = await this.getPredictedLowStockItems(userObjectId, Math.floor(limit / 3));
      
      // Combine all recommendation types, remove duplicates, and return top N
      const allRecommendations = [
        ...frequentItems.map(item => ({ ...item, recType: 'frequent' })),
        ...collaborativeRecs.map(item => ({ ...item, recType: 'collaborative' })),
        ...contentRecs.map(item => ({ ...item, recType: 'content' })),
        ...seasonalRecs.map(item => ({ ...item, recType: 'seasonal' })),
        ...lowStockRecs.map(item => ({ ...item, recType: 'low_stock' }))
      ];
      
      // Remove duplicates (prefer more frequent items)
      const uniqueRecs = this.removeDuplicateRecommendations(allRecommendations);
      
      // Apply personalization based on user segment and dietary preferences
      const personalizedRecs = this.personalizeRecommendations(uniqueRecs, user);
      
      return personalizedRecs.slice(0, limit);
    } catch (error) {
      console.error('Error getting user recommendations:', error);
      return [];
    }
  }
  
  /**
   * Get items that a user frequently purchases
   */
  async getFrequentlyPurchasedItems(userId, limit) {
    try {
      // Get items that user has purchased more than once in the last 3 months
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      
      const frequentItems = await PurchaseHistory.aggregate([
        { 
          $match: { 
            user: userId,
            purchaseDate: { $gte: threeMonthsAgo }
          } 
        },
        { $unwind: '$items' },
        { 
          $group: { 
            _id: '$items.item', 
            count: { $sum: 1 },
            lastPurchased: { $max: '$purchaseDate' },
            avgQuantity: { $avg: '$items.quantity' }
          } 
        },
        { $match: { count: { $gt: 1 } } },
        { $sort: { count: -1, lastPurchased: -1 } },
        { $limit: limit }
      ]);
      
      // Get full item details
      const itemIds = frequentItems.map(item => item._id);
      const items = await InventoryItem.find({ _id: { $in: itemIds } });
      
      // Merge frequency data with item details
      return frequentItems.map(freqItem => {
        const itemDetails = items.find(item => item._id.equals(freqItem._id));
        return {
          ...itemDetails.toObject(),
          purchaseFrequency: freqItem.count,
          daysSinceLastPurchase: Math.floor((new Date() - freqItem.lastPurchased) / (1000 * 60 * 60 * 24)),
          avgQuantity: freqItem.avgQuantity,
          score: freqItem.count * 10 // Base score on frequency
        };
      });
    } catch (error) {
      console.error('Error getting frequently purchased items:', error);
      return [];
    }
  }
  
  /**
   * Get collaborative filtering recommendations (items purchased by similar users)
   */
  async getCollaborativeRecommendations(userId, user, limit) {
    try {
      // Find similar users (same segment, similar household size)
      const similarUsers = await User.find({
        _id: { $ne: userId },
        userSegment: user.userSegment,
        householdSize: { $gte: user.householdSize - 1, $lte: user.householdSize + 1 }
      }).limit(10);
      
      const similarUserIds = similarUsers.map(u => u._id);
      
      // Get items frequently purchased by similar users but not by this user
      const userPurchases = await PurchaseHistory.find({
        user: userId
      }).distinct('items.item');
      
      const similarUsersPurchases = await PurchaseHistory.aggregate([
        { $match: { user: { $in: similarUserIds } } },
        { $unwind: '$items' },
        { 
          $group: { 
            _id: '$items.item', 
            count: { $sum: 1 },
            users: { $addToSet: '$user' }
          } 
        },
        { $match: { _id: { $nin: userPurchases } } },
        { $match: { users: { $size: { $gte: 2 } } } }, // At least 2 similar users bought it
        { $sort: { count: -1 } },
        { $limit: limit }
      ]);
      
      // Get full item details
      const itemIds = similarUsersPurchases.map(item => item._id);
      const items = await InventoryItem.find({ _id: { $in: itemIds } });
      
      // Merge data
      return similarUsersPurchases.map(simItem => {
        const itemDetails = items.find(item => item._id.equals(simItem._id));
        if (!itemDetails) return null;
        
        return {
          ...itemDetails.toObject(),
          similarUsersPurchased: simItem.count,
          score: simItem.count * 5 // Base score on number of similar users who bought it
        };
      }).filter(Boolean);
    } catch (error) {
      console.error('Error getting collaborative recommendations:', error);
      return [];
    }
  }
  
  /**
   * Get content-based recommendations (items similar to what user has purchased)
   */
  async getContentBasedRecommendations(userId, user, limit) {
    try {
      // Get categories and subcategories user has purchased from
      const userPurchaseCategories = await PurchaseHistory.aggregate([
        { $match: { user: userId } },
        { $unwind: '$items' },
        { 
          $group: { 
            _id: { 
              category: '$items.categoryAtPurchase', 
              subCategory: '$items.subCategoryAtPurchase' 
            }
          } 
        }
      ]);
      
      // Get items the user has purchased
      const purchasedItemIds = await PurchaseHistory.find({
        user: userId
      }).distinct('items.item');
      
      // Find similar items based on categories and tags
      let similarItems = [];
      
      // For each category the user has purchased from, find related items
      for (const catGroup of userPurchaseCategories) {
        if (!catGroup._id.category) continue;
        
        const categoryItems = await InventoryItem.find({
          _id: { $nin: purchasedItemIds },
          category: catGroup._id.category,
          ...(catGroup._id.subCategory ? { subCategory: catGroup._id.subCategory } : {}),
          ...(user.dietaryPreferences.isVegetarian ? { isVegetarian: true } : {})
        }).limit(Math.ceil(limit / userPurchaseCategories.length));
        
        similarItems = [...similarItems, ...categoryItems];
      }
      
      // Calculate relevance score based on popularity and tags
      return similarItems.map(item => ({
        ...item.toObject(),
        score: (item.popularity || 0) + (item.avgRating || 0) * 10,
        contentSimilarity: 'category_match'
      })).sort((a, b) => b.score - a.score).slice(0, limit);
    } catch (error) {
      console.error('Error getting content based recommendations:', error);
      return [];
    }
  }
  
  /**
   * Get seasonal recommendations based on current month and user preferences
   */
  async getSeasonalRecommendations(currentMonth, user, limit) {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const currentMonthName = monthNames[currentMonth];
    
    try {
      // Find seasonal items available in the current month
      const seasonalItems = await InventoryItem.find({
        seasonal: true,
        seasonalAvailability: currentMonthName,
        ...(user.dietaryPreferences.isVegetarian ? { isVegetarian: true } : {})
      }).sort({ popularity: -1 }).limit(limit);
      
      return seasonalItems.map(item => ({
        ...item.toObject(),
        score: 25, // Fixed score for seasonal items to boost them
        seasonalMatch: currentMonthName
      }));
    } catch (error) {
      console.error('Error getting seasonal recommendations:', error);
      return [];
    }
  }
  
  /**
   * Predict items that might be running low in user's household based on purchase frequency
   */
  async getPredictedLowStockItems(userId, limit) {
    try {
      // Calculate items that might be running low based on usual purchase frequency
      const userPurchasePatterns = await PurchaseHistory.aggregate([
        { $match: { user: userId } },
        { $unwind: '$items' },
        { 
          $group: { 
            _id: '$items.item', 
            purchases: { $push: '$purchaseDate' },
            avgQuantity: { $avg: '$items.quantity' },
            lastPurchased: { $max: '$purchaseDate' }
          } 
        },
        // Calculate average days between purchases
        { 
          $project: { 
            _id: 1, 
            avgQuantity: 1,
            lastPurchased: 1,
            purchases: 1,
            // Compute only if there are at least 2 purchases
            avgDaysBetweenPurchases: {
              $cond: [
                { $gte: [{ $size: '$purchases' }, 2] },
                {
                  $divide: [
                    {
                      $subtract: [
                        { $max: '$purchases' },
                        { $min: '$purchases' }
                      ]
                    },
                    // Convert ms to days and divide by number of intervals
                    {
                      $multiply: [
                        1000 * 60 * 60 * 24,
                        { $subtract: [{ $size: '$purchases' }, 1] }
                      ]
                    }
                  ]
                },
                30 // Default to 30 days if not enough data
              ]
            }
          } 
        },
        // Calculate days since last purchase
        {
          $project: {
            _id: 1,
            avgQuantity: 1,
            avgDaysBetweenPurchases: 1,
            daysSinceLastPurchase: {
              $divide: [
                { $subtract: [new Date(), '$lastPurchased'] },
                1000 * 60 * 60 * 24
              ]
            }
          }
        },
        // Calculate predicted depletion percentage
        {
          $project: {
            _id: 1,
            avgQuantity: 1,
            avgDaysBetweenPurchases: 1,
            daysSinceLastPurchase: 1,
            depletionPercentage: {
              $min: [
                100,
                {
                  $multiply: [
                    {
                      $divide: ['$daysSinceLastPurchase', '$avgDaysBetweenPurchases']
                    },
                    100
                  ]
                }
              ]
            }
          }
        },
        // Filter items that are likely running low (>70% depleted)
        { $match: { depletionPercentage: { $gt: 70 } } },
        { $sort: { depletionPercentage: -1 } },
        { $limit: limit }
      ]);
      
      // Get full item details
      const itemIds = userPurchasePatterns.map(pattern => pattern._id);
      const items = await InventoryItem.find({ _id: { $in: itemIds } });
      
      // Merge data
      return userPurchasePatterns.map(pattern => {
        const itemDetails = items.find(item => item._id.equals(pattern._id));
        if (!itemDetails) return null;
        
        return {
          ...itemDetails.toObject(),
          depletionPercentage: pattern.depletionPercentage,
          daysSinceLastPurchase: Math.floor(pattern.daysSinceLastPurchase),
          avgDaysBetweenPurchases: Math.floor(pattern.avgDaysBetweenPurchases),
          score: pattern.depletionPercentage // Score based on how depleted the item likely is
        };
      }).filter(Boolean);
    } catch (error) {
      console.error('Error predicting low stock items:', error);
      return [];
    }
  }
  
  /**
   * Remove duplicate recommendations, keeping the ones with higher scores
   */
  removeDuplicateRecommendations(recommendations) {
    const uniqueMap = new Map();
    
    for (const rec of recommendations) {
      const recId = rec._id.toString();
      if (!uniqueMap.has(recId) || uniqueMap.get(recId).score < rec.score) {
        uniqueMap.set(recId, rec);
      }
    }
    
    return Array.from(uniqueMap.values());
  }
  
  /**
   * Personalize recommendations based on user preferences
   */
  personalizeRecommendations(recommendations, user) {
    // Apply dietary preferences
    let personalized = recommendations;
    if (user.dietaryPreferences.isVegetarian) {
      personalized = personalized.filter(item => item.isVegetarian !== false);
    }
    
    // Apply user segment boosting
    return personalized.map(item => {
      let boostScore = 0;
      
      // Boost scores based on user segment
      if (user.userSegment === 'health_conscious' && 
          (item.tags.includes('healthy') || item.tags.includes('organic'))) {
        boostScore += 20;
      } else if (user.userSegment === 'price_sensitive' && item.tags.includes('value')) {
        boostScore += 20;
      } else if (user.userSegment === 'traditional' && 
                (item.tags.includes('traditional') || item.region === 'North Indian')) {
        boostScore += 15;
      }
      
      // Boost score for preferred categories
      if (user.preferredCategories.includes(item.category)) {
        boostScore += 10;
      }
      
      return {
        ...item,
        score: item.score + boostScore
      };
    }).sort((a, b) => b.score - a.score);
  }
  
  /**
   * Get stock replenishment recommendations for admin
   */
  async getRestockRecommendations() {
    try {
      // Get current month and year
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      // Find items below restocking threshold
      const lowStockItems = await InventoryItem.find({
        stock: { $lt: '$restockThreshold' }
      });
      
      // Find items with high purchase frequency that might need restocking soon
      const highDemandItems = await InventoryItem.aggregate([
        {
          $match: {
            stock: { $lt: { $multiply: ['$restockThreshold', 2] } }, // Below 2x threshold
            stock: { $gt: '$restockThreshold' } // But still above threshold
          }
        },
        { $sort: { purchaseFrequency: -1 } },
        { $limit: 20 }
      ]);
      
      // Get seasonal items that need restocking for upcoming season
      const nextMonth = (currentMonth + 1) % 12;
      const nextMonthName = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ][nextMonth];
      
      const upcomingSeasonalItems = await InventoryItem.find({
        seasonal: true,
        seasonalAvailability: nextMonthName,
        stock: { $lt: { $multiply: ['$restockThreshold', 3] } } // Less than 3x threshold
      });
      
      // Analyze historical demand to predict needed stock
      // Get previous year same month data if available
      const previousYearSameMonth = await PurchaseHistory.aggregate([
        {
          $match: {
            month: currentMonth,
            year: currentYear - 1
          }
        },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.item',
            totalQuantity: { $sum: '$items.quantity' },
            transactions: { $sum: 1 }
          }
        },
        { $sort: { totalQuantity: -1 } }
      ]);
      
      // Get previous month data
      const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const previousMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      
      const previousMonthData = await PurchaseHistory.aggregate([
        {
          $match: {
            month: previousMonth,
            year: previousMonthYear
          }
        },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.item',
            totalQuantity: { $sum: '$items.quantity' },
            transactions: { $sum: 1 }
          }
        },
        { $sort: { totalQuantity: -1 } }
      ]);
      
      // Combine all data and calculate restocking recommendations
      const allItemsData = new Map();
      
      // Process low stock items
      for (const item of lowStockItems) {
        allItemsData.set(item._id.toString(), {
          item,
          currentStock: item.stock,
          restockThreshold: item.restockThreshold,
          urgency: 'high',
          recommended: Math.max(item.restockThreshold * 2 - item.stock, 5)
        });
      }
      
      // Process high demand items
      for (const item of highDemandItems) {
        const itemId = item._id.toString();
        if (!allItemsData.has(itemId)) {
          allItemsData.set(itemId, {
            item,
            currentStock: item.stock,
            restockThreshold: item.restockThreshold,
            urgency: 'medium',
            recommended: Math.max(item.restockThreshold - item.stock, 0) + 10
          });
        }
      }
      
      // Process seasonal items
      for (const item of upcomingSeasonalItems) {
        const itemId = item._id.toString();
        const existingData = allItemsData.get(itemId);
        
        if (existingData) {
          existingData.urgency = existingData.urgency === 'high' ? 'high' : 'medium';
          existingData.isSeasonal = true;
          existingData.upcomingSeason = nextMonthName;
          existingData.recommended = Math.max(existingData.recommended, item.restockThreshold * 2);
        } else {
          allItemsData.set(itemId, {
            item,
            currentStock: item.stock,
            restockThreshold: item.restockThreshold,
            urgency: 'medium',
            isSeasonal: true,
            upcomingSeason: nextMonthName,
            recommended: item.restockThreshold * 2
          });
        }
      }
      
      // Process historical data
      const processHistoricalData = (data, factor, label) => {
        for (const record of data) {
          const itemId = record._id.toString();
          const existingData = allItemsData.get(itemId);
          
          if (existingData) {
            existingData.historicalData = existingData.historicalData || {};
            existingData.historicalData[label] = {
              totalQuantity: record.totalQuantity,
              transactions: record.transactions
            };
            
            // Adjust recommendation based on historical data
            const historicalAdjustment = Math.ceil(record.totalQuantity * factor);
            existingData.recommended = Math.max(existingData.recommended, historicalAdjustment);
          }
        }
      };
      
      // Apply historical data adjustments
      processHistoricalData(previousYearSameMonth, 1.1, 'lastYear'); // 10% growth
      processHistoricalData(previousMonthData, 0.9, 'lastMonth'); // Slight decrease from last month
      
      // Convert map to array and sort by urgency
      const sortedRecommendations = Array.from(allItemsData.values())
        .sort((a, b) => {
          // First by urgency
          const urgencyOrder = { high: 3, medium: 2, low: 1 };
          const urgencyDiff = urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
          if (urgencyDiff !== 0) return -urgencyDiff;
          
          // Then by seasonal status
          if (a.isSeasonal && !b.isSeasonal) return -1;
          if (!a.isSeasonal && b.isSeasonal) return 1;
          
          // Then by stock level relative to threshold
          const aRatio = a.currentStock / a.restockThreshold;
          const bRatio = b.currentStock / b.restockThreshold;
          return aRatio - bRatio;
        });
      
      return sortedRecommendations;
    } catch (error) {
      console.error('Error getting restock recommendations:', error);
      return [];
    }
  }
  
  /**
   * Generate insights for admin dashboard
   */
  async getInventoryInsights() {
    try {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      // Get total stock value
      const totalStockValue = await InventoryItem.aggregate([
        {
          $group: {
            _id: null,
            value: { $sum: { $multiply: ['$price', '$stock'] } },
            totalItems: { $sum: 1 },
            totalUnits: { $sum: '$stock' }
          }
        }
      ]);
      
      // Get category breakdown
      const categoryBreakdown = await InventoryItem.aggregate([
        {
          $group: {
            _id: '$category',
            itemCount: { $sum: 1 },
            totalValue: { $sum: { $multiply: ['$price', '$stock'] } },
            avgPrice: { $avg: '$price' }
          }
        },
        { $sort: { totalValue: -1 } }
      ]);
      
      // Get most popular items
      const mostPopular = await InventoryItem.find()
        .sort({ popularity: -1, purchaseFrequency: -1 })
        .limit(10);
      
      // Get items that haven't sold in 3 months
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      
      const recentlySoldItemIds = await PurchaseHistory.find({
        purchaseDate: { $gte: threeMonthsAgo }
      }).distinct('items.item');
      
      const nonMovingItems = await InventoryItem.find({
        _id: { $nin: recentlySoldItemIds },
        stock: { $gt: 0 }
      }).sort({ price: -1 }).limit(20);
      
      // Get monthly sales trends
      const monthlySalesTrend = await PurchaseHistory.aggregate([
        {
          $group: {
            _id: { month: '$month', year: '$year' },
            totalSales: { $sum: '$totalAmount' },
            totalTransactions: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 12 } // Last 12 months
      ]);
      
      return {
        stockSummary: totalStockValue[0] || { value: 0, totalItems: 0, totalUnits: 0 },
        categoryBreakdown,
        mostPopular,
        nonMovingItems,
        monthlySalesTrend,
        timestamp: now
      };
    } catch (error) {
      console.error('Error generating inventory insights:', error);
      return {
        error: 'Failed to generate insights',
        timestamp: new Date()
      };
    }
  }
}

export default new RecommendationService();