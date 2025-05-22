# Recommendation System for Indian Grocery Store

This document provides information about the intelligent recommendation system implemented in this application, which provides personalized product suggestions to users and inventory management insights for admins.

## Features

### User Recommendations
- **Personalized Product Suggestions**: Based on user's purchase history and preferences
- **Seasonal Recommendations**: Suggests seasonal items available at the current time
- **Low Stock Predictions**: Reminds users about products they might be running low on
- **Collaborative Filtering**: Recommends products popular among similar users
- **Dietary Preference Aware**: Takes vegetarian/non-vegetarian preferences into account

### Admin Analytics & Recommendations
- **Restock Recommendations**: Suggests when and what to restock based on sales trends
- **Seasonal Planning**: Highlights seasonal items that will be in demand soon
- **Inventory Insights**: Shows category breakdown, non-moving items, and total inventory value
- **Sales Prediction**: Uses historical data to predict future sales

## Setup Instructions

### Seeding the Database with Indian Grocery Data

To initialize the system with a comprehensive set of Indian grocery items, sample users, and purchase history:

```bash
# From the project root directory
npm run server:seed:indian
```

This will:
1. Create 25 sample users with Indian names and realistic preferences
2. Add 60+ Indian grocery items across categories (spices, dals, rice, vegetables, etc.)
3. Generate 10 months of realistic purchase history
4. Set up the admin account

### User Credentials

After seeding, you can log in with any of these credentials:

- **Admin Login**:
  - UID: `admin`
  - Password: `@123`

- **Regular User Login**:
  - UID: `user1` through `user25`
  - Password: `password123`

## How the Recommendation System Works

### User Recommendations Algorithm

The system uses multiple recommendation strategies:

1. **Frequency-Based**: Items the user buys regularly
2. **Collaborative Filtering**: Items bought by similar users
3. **Content-Based**: Items similar to what they've bought before
4. **Seasonal**: Items that are in season now
5. **Household Depletion**: Predicts when household items are running low

These recommendations are combined and personalized based on:
- User's dietary preferences
- Household size
- Price sensitivity
- Shopping frequency

### Admin Inventory Recommendations

The admin dashboard provides inventory intelligence:

1. **Stock Level Analysis**: Identifies items below threshold
2. **Seasonal Forecasting**: Predicts demand for upcoming seasonal products
3. **Historical Analysis**: Uses past 10 months of data to predict future demand
4. **Non-Moving Inventory**: Highlights items with no sales in 3+ months

## Categories of Indian Groceries

- **Spices**: Turmeric, Chilli Powder, Garam Masala, etc.
- **Rice & Flour**: Basmati Rice, Wheat Flour, Besan, etc.
- **Pulses & Lentils**: Toor Dal, Moong Dal, Urad Dal, etc.
- **Oils & Ghee**: Mustard Oil, Sunflower Oil, Ghee, etc.
- **Vegetables**: Seasonal and staple vegetables
- **Dairy Products**: Milk, Paneer, Curd, etc.
- **Snacks & Packaged Foods**: Traditional Indian snacks
- **Beverages**: Tea, Coffee, etc.
- **Fruits**: Seasonal and regular fruits
- **Dry Fruits & Nuts**: Almonds, Cashews, etc.
- **Meat & Poultry**: Chicken, Mutton, Fish, etc.

## Technical Implementation

The recommendation system consists of:

1. **Data Models**:
   - User model with preferences
   - Inventory items with attributes
   - Purchase history with temporal data

2. **Recommendation Service**:
   - ML-based recommendation algorithms
   - Time-series analysis for inventory prediction
   - Personalization based on user segments

3. **Frontend Components**:
   - Recommendation display cards
   - Indian-context UI elements (veg/non-veg indicators)
   - Admin analytics dashboard

## Development

To extend the recommendation system, you can modify:

- `server/src/services/recommendationService.js`: Core recommendation logic
- `server/src/controllers/recommendationController.js`: API endpoints
- `src/components/recommendations/`: Frontend components