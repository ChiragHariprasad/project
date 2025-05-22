import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/userModel.js';
import InventoryItem from './models/inventoryModel.js';
import PurchaseHistory from './models/purchaseHistoryModel.js';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config();

// Set mongoose options
mongoose.set('strictQuery', false);

// Generate purchase history for each user based on their preferences
const generatePurchaseHistory = (users, items) => {
  const history = [];
  
  users.forEach(user => {
    // Determine number of purchases based on frequency
    let purchaseCount;
    switch (user.purchaseFrequency) {
      case 'daily':
        purchaseCount = 200 + Math.floor(Math.random() * 50); // ~8 months of daily
        break;
      case 'weekly':
        purchaseCount = 35 + Math.floor(Math.random() * 10); // ~8 months of weekly
        break;
      case 'biweekly':
        purchaseCount = 16 + Math.floor(Math.random() * 5); // ~8 months of biweekly
        break;
      case 'monthly':
        purchaseCount = 8 + Math.floor(Math.random() * 3); // ~8 months of monthly
        break;
      default:
        purchaseCount = 20;
    }
    
    // Get favorite categories
    const favoriteCategories = user.preferredCategories;
    
    // Generate purchases
    for (let i = 0; i < purchaseCount; i++) {
      // Generate purchase date
      const purchaseDate = getRandomPastDate();
      
      // Determine item count for this purchase (3-15 items)
      const itemCount = Math.floor(Math.random() * 12) + 3;
      
      // Select items based on preferences and some randomness
      const purchasedItems = [];
      let totalAmount = 0;
      
      // Add some staple items (always needed goods)
      const stapleItems = items.filter(item => 
        item.tags.includes('staple') && 
        (user.dietaryPreferences.isVegetarian ? item.isVegetarian : true)
      );
      
      // Pick 1-3 staples
      const stapleCount = Math.floor(Math.random() * 3) + 1;
      for (let j = 0; j < stapleCount; j++) {
        if (stapleItems.length > 0) {
          const randomStaple = stapleItems[Math.floor(Math.random() * stapleItems.length)];
          const quantity = Math.floor(Math.random() * 3) + 1;
          
          purchasedItems.push({
            item: randomStaple._id,
            quantity,
            price: randomStaple.price,
            categoryAtPurchase: randomStaple.category,
            subCategoryAtPurchase: randomStaple.subCategory
          });
          
          totalAmount += randomStaple.price * quantity;
          
          // Remove to prevent duplicates
          stapleItems.splice(stapleItems.indexOf(randomStaple), 1);
        }
      }
      
      // Add preferred category items
      favoriteCategories.forEach(category => {
        if (purchasedItems.length >= itemCount) return;
        
        const categoryItems = items.filter(item => 
          item.category === category && 
          (user.dietaryPreferences.isVegetarian ? item.isVegetarian : true)
        );
        
        if (categoryItems.length > 0) {
          const randomItem = categoryItems[Math.floor(Math.random() * categoryItems.length)];
          const quantity = Math.floor(Math.random() * 2) + 1;
          
          purchasedItems.push({
            item: randomItem._id,
            quantity,
            price: randomItem.price,
            categoryAtPurchase: randomItem.category,
            subCategoryAtPurchase: randomItem.subCategory
          });
          
          totalAmount += randomItem.price * quantity;
        }
      });
      
      // Fill remaining slots with random items
      while (purchasedItems.length < itemCount) {
        // Filter based on dietary preferences
        const availableItems = items.filter(item => 
          (user.dietaryPreferences.isVegetarian ? item.isVegetarian : true) &&
          !purchasedItems.some(pi => pi.item.equals(item._id))
        );
        
        if (availableItems.length > 0) {
          const randomItem = availableItems[Math.floor(Math.random() * availableItems.length)];
          const quantity = Math.floor(Math.random() * 3) + 1;
          
          purchasedItems.push({
            item: randomItem._id,
            quantity,
            price: randomItem.price,
            categoryAtPurchase: randomItem.category,
            subCategoryAtPurchase: randomItem.subCategory
          });
          
          totalAmount += randomItem.price * quantity;
        } else {
          break; // No more items available
        }
      }
      
      // Create purchase history record
      if (purchasedItems.length > 0) {
        history.push({
          user: user._id,
          items: purchasedItems,
          totalAmount,
          purchaseDate,
          dayOfWeek: purchaseDate.getDay(),
          weekOfMonth: Math.ceil(purchaseDate.getDate() / 7),
          month: purchaseDate.getMonth(),
          year: purchaseDate.getFullYear(),
          season: getSeason(purchaseDate)
        });
      }
    }
  });
  
  return history;
};

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/inventory-management');
    console.log('MongoDB connected for Indian grocery seeding');
    return true;
  } catch (err) {
    console.error('MongoDB connection error:', err);
    return false;
  }
};

// Main seed function that runs everything
const runSeed = async () => {
  try {
    // Connect to MongoDB
    const connected = await connectDB();
    if (!connected) {
      throw new Error("Failed to connect to MongoDB");
    }
    
    // Clear existing data
    console.log("Clearing existing data...");
    await InventoryItem.deleteMany({});
    await PurchaseHistory.deleteMany({});
    
    // Create admin user if it doesn't exist
    const adminExists = await User.findOne({ uid: 'admin' });
    if (!adminExists) {
      console.log('Creating admin user...');
      const salt = await bcrypt.genSalt(10);
      await User.create({
        uid: 'admin',
        password: await bcrypt.hash('@123', salt),
        name: 'Admin User',
        isAdmin: true
      });
      console.log('Admin user created');
    } else {
      console.log('Admin user already exists');
    }
    
    // Create items
    console.log('Generating inventory items...');
    const inventoryItems = generateInventoryItems();
    const savedItems = await InventoryItem.insertMany(inventoryItems);
    console.log(`${savedItems.length} inventory items created`);
    
    // Create users
    console.log('Generating users...');
    const users = generateUsers(25);
    
    // Hash passwords before saving
    for (let user of users) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }
    
    const savedUsers = await User.insertMany(users);
    console.log(`${savedUsers.length} users created`);
    
    // Generate purchase history
    console.log('Generating purchase history...');
    const purchaseHistory = generatePurchaseHistory(savedUsers, savedItems);
    const savedHistory = await PurchaseHistory.insertMany(purchaseHistory);
    console.log(`${savedHistory.length} purchase records created`);
    
    console.log('Database seeded successfully!');
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
    
    return true;
  } catch (error) {
    console.error('Error seeding database:', error);
    
    // Try to disconnect
    try {
      await mongoose.disconnect();
      console.log('MongoDB disconnected after error');
    } catch (err) {
      console.error('Error disconnecting from MongoDB:', err);
    }
    
    return false;
  }
};

// Run the seed function
runSeed().then(success => {
  console.log(`Seed process ${success ? 'completed successfully' : 'failed'}`);
  process.exit(success ? 0 : 1);
});

// Utility to generate random Indian user names
const firstNames = [
  'Aarav', 'Arjun', 'Vihaan', 'Reyansh', 'Advik', 'Vivaan', 'Aditya', 'Rohan', 'Ansh', 'Parth',
  'Aanya', 'Saanvi', 'Aadhya', 'Aarohi', 'Diya', 'Myra', 'Pari', 'Sara', 'Kavya', 'Ananya'
];

const lastNames = [
  'Sharma', 'Patel', 'Verma', 'Agarwal', 'Singh', 'Gupta', 'Jain', 'Kumar', 'Shah', 'Reddy',
  'Nair', 'Rao', 'Mehta', 'Das', 'Choudhary', 'Iyer', 'Banerjee', 'Kapoor', 'Malhotra', 'Bose'
];

// Categories for Indian groceries
const groceryCategories = {
  "Spices": [
    { name: "Turmeric Powder", subCategory: "Ground Spices", unit: "gm", unitSize: 100, price: 60, image: "https://images.pexels.com/photos/4198370/pexels-photo-4198370.jpeg", isVegetarian: true, brand: "Everest", region: "Pan Indian", tags: ["staple", "essential", "cooking"] },
    { name: "Red Chilli Powder", subCategory: "Ground Spices", unit: "gm", unitSize: 100, price: 70, image: "https://images.pexels.com/photos/4197809/pexels-photo-4197809.jpeg", isVegetarian: true, brand: "MDH", region: "Pan Indian", tags: ["staple", "essential", "cooking"] },
    { name: "Coriander Powder", subCategory: "Ground Spices", unit: "gm", unitSize: 100, price: 50, image: "https://images.pexels.com/photos/4199053/pexels-photo-4199053.jpeg", isVegetarian: true, brand: "Everest", region: "Pan Indian", tags: ["staple", "essential", "cooking"] },
    { name: "Garam Masala", subCategory: "Ground Spices", unit: "gm", unitSize: 100, price: 90, image: "https://images.pexels.com/photos/8969237/pexels-photo-8969237.jpeg", isVegetarian: true, brand: "MDH", region: "North Indian", tags: ["essential", "cooking"] },
    { name: "Cumin Seeds", subCategory: "Whole Spices", unit: "gm", unitSize: 100, price: 80, image: "https://images.pexels.com/photos/4197613/pexels-photo-4197613.jpeg", isVegetarian: true, brand: "Catch", region: "Pan Indian", tags: ["staple", "essential", "cooking"] },
    { name: "Mustard Seeds", subCategory: "Whole Spices", unit: "gm", unitSize: 100, price: 45, image: "https://images.pexels.com/photos/8969251/pexels-photo-8969251.jpeg", isVegetarian: true, brand: "Catch", region: "Pan Indian", tags: ["staple", "cooking"] },
    { name: "Fenugreek Seeds", subCategory: "Whole Spices", unit: "gm", unitSize: 100, price: 40, image: "https://images.pexels.com/photos/4198362/pexels-photo-4198362.jpeg", isVegetarian: true, brand: "Catch", region: "Pan Indian", tags: ["cooking"] },
    { name: "Cardamom", subCategory: "Whole Spices", unit: "gm", unitSize: 50, price: 120, image: "https://images.pexels.com/photos/4198680/pexels-photo-4198680.jpeg", isVegetarian: true, brand: "Everest", region: "Pan Indian", tags: ["premium", "essential", "cooking", "tea"] },
    { name: "Cloves", subCategory: "Whole Spices", unit: "gm", unitSize: 50, price: 90, image: "https://images.pexels.com/photos/8969125/pexels-photo-8969125.jpeg", isVegetarian: true, brand: "MDH", region: "Pan Indian", tags: ["essential", "cooking"] },
    { name: "Cinnamon Sticks", subCategory: "Whole Spices", unit: "gm", unitSize: 50, price: 70, image: "https://images.pexels.com/photos/4197876/pexels-photo-4197876.jpeg", isVegetarian: true, brand: "Catch", region: "Pan Indian", tags: ["premium", "cooking", "tea"] }
  ],
  "Rice & Flour": [
    { name: "Basmati Rice", subCategory: "Rice", unit: "kg", unitSize: 5, price: 350, image: "https://images.pexels.com/photos/7543215/pexels-photo-7543215.jpeg", isVegetarian: true, brand: "India Gate", region: "North Indian", tags: ["staple", "essential"] },
    { name: "Sona Masoori Rice", subCategory: "Rice", unit: "kg", unitSize: 5, price: 280, image: "https://images.pexels.com/photos/4439580/pexels-photo-4439580.jpeg", isVegetarian: true, brand: "Daawat", region: "South Indian", tags: ["staple", "essential"] },
    { name: "Brown Rice", subCategory: "Rice", unit: "kg", unitSize: 2, price: 180, image: "https://images.pexels.com/photos/8471703/pexels-photo-8471703.jpeg", isVegetarian: true, brand: "24 Mantra", region: "Pan Indian", tags: ["healthy", "organic"] },
    { name: "Whole Wheat Flour", subCategory: "Flour", unit: "kg", unitSize: 5, price: 220, image: "https://images.pexels.com/photos/5765/flour-food-wheat-powder.jpg", isVegetarian: true, brand: "Aashirvaad", region: "Pan Indian", tags: ["staple", "essential", "roti"] },
    { name: "Besan (Gram Flour)", subCategory: "Flour", unit: "kg", unitSize: 1, price: 110, image: "https://images.pexels.com/photos/8469993/pexels-photo-8469993.jpeg", isVegetarian: true, brand: "Fortune", region: "Pan Indian", tags: ["staple", "cooking"] },
    { name: "Sooji (Semolina)", subCategory: "Flour", unit: "kg", unitSize: 1, price: 60, image: "https://images.pexels.com/photos/8470142/pexels-photo-8470142.jpeg", isVegetarian: true, brand: "Aashirvaad", region: "Pan Indian", tags: ["cooking", "dessert"] },
    { name: "Rice Flour", subCategory: "Flour", unit: "kg", unitSize: 1, price: 65, image: "https://images.pexels.com/photos/8469871/pexels-photo-8469871.jpeg", isVegetarian: true, brand: "24 Mantra", region: "South Indian", tags: ["cooking"] },
    { name: "Maida (All Purpose Flour)", subCategory: "Flour", unit: "kg", unitSize: 1, price: 55, image: "https://images.pexels.com/photos/5765/flour-food-wheat-powder.jpg", isVegetarian: true, brand: "Pillsbury", region: "Pan Indian", tags: ["cooking", "baking"] }
  ],
  "Pulses & Lentils": [
    { name: "Toor Dal", subCategory: "Pulses", unit: "kg", unitSize: 1, price: 130, image: "https://images.pexels.com/photos/4198377/pexels-photo-4198377.jpeg", isVegetarian: true, brand: "Tata Sampann", region: "Pan Indian", tags: ["staple", "essential", "protein"] },
    { name: "Moong Dal", subCategory: "Pulses", unit: "kg", unitSize: 1, price: 120, image: "https://images.pexels.com/photos/4198028/pexels-photo-4198028.jpeg", isVegetarian: true, brand: "Tata Sampann", region: "Pan Indian", tags: ["staple", "essential", "protein"] },
    { name: "Masoor Dal", subCategory: "Lentils", unit: "kg", unitSize: 1, price: 100, image: "https://images.pexels.com/photos/4198379/pexels-photo-4198379.jpeg", isVegetarian: true, brand: "Tata Sampann", region: "North Indian", tags: ["staple", "protein"] },
    { name: "Chana Dal", subCategory: "Pulses", unit: "kg", unitSize: 1, price: 95, image: "https://images.pexels.com/photos/4198688/pexels-photo-4198688.jpeg", isVegetarian: true, brand: "24 Mantra", region: "Pan Indian", tags: ["staple", "protein"] },
    { name: "Urad Dal", subCategory: "Pulses", unit: "kg", unitSize: 1, price: 150, image: "https://images.pexels.com/photos/4198376/pexels-photo-4198376.jpeg", isVegetarian: true, brand: "Tata Sampann", region: "South Indian", tags: ["staple", "protein", "idli"] },
    { name: "Rajma (Kidney Beans)", subCategory: "Beans", unit: "kg", unitSize: 1, price: 160, image: "https://images.pexels.com/photos/4198639/pexels-photo-4198639.jpeg", isVegetarian: true, brand: "24 Mantra", region: "North Indian", tags: ["protein", "curry"] },
    { name: "Kabuli Chana (Chickpeas)", subCategory: "Beans", unit: "kg", unitSize: 1, price: 145, image: "https://images.pexels.com/photos/4198641/pexels-photo-4198641.jpeg", isVegetarian: true, brand: "Tata Sampann", region: "Pan Indian", tags: ["protein", "curry"] }
  ],
  "Oils & Ghee": [
    { name: "Mustard Oil", subCategory: "Cooking Oil", unit: "litre", unitSize: 1, price: 180, image: "https://images.pexels.com/photos/4021983/pexels-photo-4021983.jpeg", isVegetarian: true, brand: "Fortune", region: "North Indian", tags: ["staple", "cooking", "essential"] },
    { name: "Sunflower Oil", subCategory: "Cooking Oil", unit: "litre", unitSize: 5, price: 700, image: "https://images.pexels.com/photos/4021985/pexels-photo-4021985.jpeg", isVegetarian: true, brand: "Saffola", region: "Pan Indian", tags: ["staple", "cooking", "essential"] },
    { name: "Groundnut Oil", subCategory: "Cooking Oil", unit: "litre", unitSize: 1, price: 210, image: "https://images.pexels.com/photos/9198072/pexels-photo-9198072.jpeg", isVegetarian: true, brand: "Dhara", region: "South Indian", tags: ["cooking", "frying"] },
    { name: "Coconut Oil", subCategory: "Cooking Oil", unit: "litre", unitSize: 1, price: 250, image: "https://images.pexels.com/photos/725998/pexels-photo-725998.jpeg", isVegetarian: true, brand: "Parachute", region: "South Indian", tags: ["cooking", "hair"] },
    { name: "Ghee", subCategory: "Dairy", unit: "kg", unitSize: 1, price: 550, image: "https://images.pexels.com/photos/10818317/pexels-photo-10818317.jpeg", isVegetarian: true, brand: "Amul", region: "Pan Indian", tags: ["staple", "essential", "cooking", "dessert"] }
  ],
  "Vegetables": [
    { name: "Potato", subCategory: "Root Vegetables", unit: "kg", unitSize: 1, price: 30, image: "https://images.pexels.com/photos/144248/potatoes-vegetables-erdfrucht-bio-144248.jpeg", isVegetarian: true, brand: "Fresh", region: "Pan Indian", tags: ["staple", "essential"], seasonal: false },
    { name: "Onion", subCategory: "Bulb Vegetables", unit: "kg", unitSize: 1, price: 40, image: "https://images.pexels.com/photos/533342/pexels-photo-533342.jpeg", isVegetarian: true, brand: "Fresh", region: "Pan Indian", tags: ["staple", "essential"], seasonal: false },
    { name: "Tomato", subCategory: "Fruit Vegetables", unit: "kg", unitSize: 1, price: 35, image: "https://images.pexels.com/photos/1271172/pexels-photo-1271172.jpeg", isVegetarian: true, brand: "Fresh", region: "Pan Indian", tags: ["staple", "essential"], seasonal: false },
    { name: "Bitter Gourd", subCategory: "Gourds", unit: "kg", unitSize: 0.5, price: 40, image: "https://images.pexels.com/photos/5499350/pexels-photo-5499350.jpeg", isVegetarian: true, brand: "Fresh", region: "Pan Indian", tags: ["healthy", "curry"], seasonal: true, seasonalAvailability: ["July", "August", "September"] },
    { name: "Okra", subCategory: "Pod Vegetables", unit: "kg", unitSize: 0.5, price: 60, image: "https://images.pexels.com/photos/5834056/pexels-photo-5834056.jpeg", isVegetarian: true, brand: "Fresh", region: "Pan Indian", tags: ["curry"], seasonal: true, seasonalAvailability: ["June", "July", "August"] },
    { name: "Cauliflower", subCategory: "Cruciferous", unit: "piece", unitSize: 1, price: 40, image: "https://images.pexels.com/photos/161514/brocoli-vegetables-salad-green-161514.jpeg", isVegetarian: true, brand: "Fresh", region: "Pan Indian", tags: ["curry"], seasonal: true, seasonalAvailability: ["November", "December", "January", "February"] },
    { name: "Green Beans", subCategory: "Pod Vegetables", unit: "kg", unitSize: 0.5, price: 45, image: "https://images.pexels.com/photos/165936/pexels-photo-165936.jpeg", isVegetarian: true, brand: "Fresh", region: "Pan Indian", tags: ["curry", "healthy"], seasonal: true, seasonalAvailability: ["October", "November", "December"] },
    { name: "Spinach", subCategory: "Leafy Greens", unit: "bunch", unitSize: 1, price: 25, image: "https://images.pexels.com/photos/2894535/pexels-photo-2894535.jpeg", isVegetarian: true, brand: "Fresh", region: "Pan Indian", tags: ["curry", "healthy"], seasonal: true, seasonalAvailability: ["December", "January", "February"] },
    { name: "Eggplant", subCategory: "Fruit Vegetables", unit: "kg", unitSize: 1, price: 40, image: "https://images.pexels.com/photos/6439066/pexels-photo-6439066.jpeg", isVegetarian: true, brand: "Fresh", region: "Pan Indian", tags: ["curry"], seasonal: false }
  ],
  "Dairy & Dairy Products": [
    { name: "Milk", subCategory: "Milk", unit: "litre", unitSize: 1, price: 60, image: "https://images.pexels.com/photos/533293/pexels-photo-533293.jpeg", isVegetarian: true, brand: "Amul", region: "Pan Indian", tags: ["staple", "essential", "daily"] },
    { name: "Paneer", subCategory: "Cheese", unit: "gm", unitSize: 200, price: 80, image: "https://images.pexels.com/photos/6641814/pexels-photo-6641814.jpeg", isVegetarian: true, brand: "Amul", region: "North Indian", tags: ["protein", "curry"] },
    { name: "Curd", subCategory: "Yogurt", unit: "gm", unitSize: 400, price: 40, image: "https://images.pexels.com/photos/4397899/pexels-photo-4397899.jpeg", isVegetarian: true, brand: "Nestlé", region: "Pan Indian", tags: ["staple", "daily"] },
    { name: "Butter", subCategory: "Spread", unit: "gm", unitSize: 500, price: 245, image: "https://images.pexels.com/photos/531334/pexels-photo-531334.jpeg", isVegetarian: true, brand: "Amul", region: "Pan Indian", tags: ["breakfast", "essential"] },
    { name: "Cheese", subCategory: "Cheese", unit: "gm", unitSize: 200, price: 120, image: "https://images.pexels.com/photos/821365/pexels-photo-821365.jpeg", isVegetarian: true, brand: "Amul", region: "Pan Indian", tags: ["breakfast", "sandwich"] }
  ],
  "Snacks & Packaged Foods": [
    { name: "Potato Chips", subCategory: "Chips", unit: "gm", unitSize: 150, price: 30, image: "https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg", isVegetarian: true, brand: "Lays", region: "Pan Indian", tags: ["snack", "junk food"] },
    { name: "Bhujia", subCategory: "Namkeen", unit: "gm", unitSize: 200, price: 55, image: "https://images.pexels.com/photos/9224862/pexels-photo-9224862.jpeg", isVegetarian: true, brand: "Haldiram", region: "North Indian", tags: ["snack", "tea time"] },
    { name: "Mixture", subCategory: "Namkeen", unit: "gm", unitSize: 200, price: 60, image: "https://images.pexels.com/photos/7517106/pexels-photo-7517106.jpeg", isVegetarian: true, brand: "MTR", region: "South Indian", tags: ["snack", "tea time"] },
    { name: "Instant Noodles", subCategory: "Ready to Cook", unit: "packet", unitSize: 70, price: 14, image: "https://images.pexels.com/photos/4518703/pexels-photo-4518703.jpeg", isVegetarian: true, brand: "Maggi", region: "Pan Indian", tags: ["quick meal", "kids"] },
    { name: "Khakhra", subCategory: "Traditional Snacks", unit: "gm", unitSize: 200, price: 70, image: "https://images.pexels.com/photos/9218906/pexels-photo-9218906.jpeg", isVegetarian: true, brand: "Lijjat", region: "West Indian", tags: ["healthy", "tea time"] }
  ],
  "Beverages": [
    { name: "Tea", subCategory: "Tea", unit: "gm", unitSize: 250, price: 140, image: "https://images.pexels.com/photos/1695715/pexels-photo-1695715.jpeg", isVegetarian: true, brand: "Tata Tea", region: "Pan Indian", tags: ["daily", "essential"] },
    { name: "Coffee", subCategory: "Coffee", unit: "gm", unitSize: 200, price: 180, image: "https://images.pexels.com/photos/4195534/pexels-photo-4195534.jpeg", isVegetarian: true, brand: "Nescafé", region: "South Indian", tags: ["daily"] },
    { name: "Fruit Juice", subCategory: "Juice", unit: "litre", unitSize: 1, price: 110, image: "https://images.pexels.com/photos/1536871/pexels-photo-1536871.jpeg", isVegetarian: true, brand: "Real", region: "Pan Indian", tags: ["healthy", "breakfast"] },
    { name: "Coconut Water", subCategory: "Natural Drinks", unit: "litre", unitSize: 1, price: 85, image: "https://images.pexels.com/photos/4114132/pexels-photo-4114132.jpeg", isVegetarian: true, brand: "Tender", region: "South Indian", tags: ["healthy", "summer"] }
  ],
  "Fruits": [
    { name: "Banana", subCategory: "Fresh Fruits", unit: "dozen", unitSize: 1, price: 60, image: "https://images.pexels.com/photos/47305/bananas-banana-shrub-fruits-yellow-47305.jpeg", isVegetarian: true, brand: "Fresh", region: "Pan Indian", tags: ["daily", "healthy"], seasonal: false },
    { name: "Apple", subCategory: "Fresh Fruits", unit: "kg", unitSize: 1, price: 160, image: "https://images.pexels.com/photos/102104/pexels-photo-102104.jpeg", isVegetarian: true, brand: "Fresh", region: "North Indian", tags: ["daily", "healthy"], seasonal: true, seasonalAvailability: ["September", "October", "November"] },
    { name: "Mango", subCategory: "Fresh Fruits", unit: "kg", unitSize: 1, price: 120, image: "https://images.pexels.com/photos/918643/pexels-photo-918643.jpeg", isVegetarian: true, brand: "Fresh", region: "Pan Indian", tags: ["summer", "seasonal"], seasonal: true, seasonalAvailability: ["April", "May", "June"] },
    { name: "Orange", subCategory: "Fresh Fruits", unit: "kg", unitSize: 1, price: 80, image: "https://images.pexels.com/photos/691166/pexels-photo-691166.jpeg", isVegetarian: true, brand: "Fresh", region: "Pan Indian", tags: ["winter", "vitamin C"], seasonal: true, seasonalAvailability: ["November", "December", "January"] }
  ],
  "Dry Fruits & Nuts": [
    { name: "Almonds", subCategory: "Nuts", unit: "gm", unitSize: 250, price: 350, image: "https://images.pexels.com/photos/1013420/pexels-photo-1013420.jpeg", isVegetarian: true, brand: "Premium", region: "Pan Indian", tags: ["healthy", "protein", "snack"] },
    { name: "Cashews", subCategory: "Nuts", unit: "gm", unitSize: 250, price: 400, image: "https://images.pexels.com/photos/4198357/pexels-photo-4198357.jpeg", isVegetarian: true, brand: "Premium", region: "Pan Indian", tags: ["healthy", "snack"] },
    { name: "Raisins", subCategory: "Dry Fruits", unit: "gm", unitSize: 250, price: 160, image: "https://images.pexels.com/photos/11813229/pexels-photo-11813229.jpeg", isVegetarian: true, brand: "Premium", region: "Pan Indian", tags: ["healthy", "snack", "dessert"] },
    { name: "Dates", subCategory: "Dry Fruits", unit: "gm", unitSize: 500, price: 220, image: "https://images.pexels.com/photos/7095095/pexels-photo-7095095.jpeg", isVegetarian: true, brand: "Premium", region: "Pan Indian", tags: ["healthy", "snack", "natural sweetener"] }
  ],
  "Meat & Poultry": [
    { name: "Chicken", subCategory: "Poultry", unit: "kg", unitSize: 1, price: 220, image: "https://images.pexels.com/photos/6210962/pexels-photo-6210962.jpeg", isVegetarian: false, brand: "Fresh", region: "Pan Indian", tags: ["protein", "curry"] },
    { name: "Mutton", subCategory: "Meat", unit: "kg", unitSize: 1, price: 700, image: "https://images.pexels.com/photos/8280696/pexels-photo-8280696.jpeg", isVegetarian: false, brand: "Fresh", region: "Pan Indian", tags: ["protein", "curry", "premium"] },
    { name: "Fish (Rohu)", subCategory: "Seafood", unit: "kg", unitSize: 1, price: 250, image: "https://images.pexels.com/photos/3296434/pexels-photo-3296434.jpeg", isVegetarian: false, brand: "Fresh", region: "East Indian", tags: ["protein", "curry"] },
    { name: "Eggs", subCategory: "Poultry", unit: "dozen", unitSize: 1, price: 70, image: "https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg", isVegetarian: false, brand: "Farm Fresh", region: "Pan Indian", tags: ["protein", "breakfast", "daily"] }
  ]
};

// Generate random purchase date within the last 10 months
const getRandomPastDate = (monthsBack = 10) => {
  const now = new Date();
  const pastDate = new Date();
  pastDate.setMonth(now.getMonth() - Math.floor(Math.random() * monthsBack));
  pastDate.setDate(Math.floor(Math.random() * 28) + 1); // Random day between 1-28
  return pastDate;
};

// Determine season based on date
const getSeason = (date) => {
  const month = date.getMonth();
  
  if (month >= 11 || month <= 1) return 'Winter';
  if (month >= 2 && month <= 4) return 'Spring';
  if (month >= 5 && month <= 6) return 'Summer';
  if (month >= 7 && month <= 8) return 'Monsoon';
  return 'Autumn';
};

// Generate items with initial inventory
const generateInventoryItems = () => {
  const items = [];
  
  // Create items from each category
  Object.entries(groceryCategories).forEach(([category, products]) => {
    products.forEach(product => {
      // Calculate random stock
      const stock = Math.floor(Math.random() * 100) + 50;
      
      // Generate monthly demand history for past 10 months
      const monthlyDemandHistory = [];
      const currentDate = new Date();
      
      for (let i = 0; i < 10; i++) {
        const pastDate = new Date();
        pastDate.setMonth(currentDate.getMonth() - i);
        
        const monthName = pastDate.toLocaleString('default', { month: 'long' });
        const year = pastDate.getFullYear();
        
        // Base demand with some randomness
        let demand = Math.floor(Math.random() * 50) + 20;
        
        // Adjust demand based on seasonality if applicable
        if (product.seasonal && product.seasonalAvailability) {
          if (product.seasonalAvailability.includes(monthName)) {
            demand *= 3; // Higher demand during season
          } else {
            demand = Math.floor(demand / 2); // Lower demand off-season
          }
        }
        
        monthlyDemandHistory.push({
          month: monthName,
          year: year,
          demand: demand
        });
      }
      
      // Calculate restock threshold based on average demand
      const avgDemand = monthlyDemandHistory.reduce((sum, record) => sum + record.demand, 0) / monthlyDemandHistory.length;
      const restockThreshold = Math.max(5, Math.ceil(avgDemand / 4));
      
      // Create inventory item
      items.push({
        name: product.name,
        description: `${product.brand} ${product.name} - ${product.unitSize}${product.unit}`,
        price: product.price,
        stock: stock,
        image: product.image,
        category: category,
        subCategory: product.subCategory,
        unit: product.unit,
        unitSize: product.unitSize,
        brand: product.brand,
        isVegetarian: product.isVegetarian,
        region: product.region,
        tags: product.tags || [],
        avgRating: (Math.random() * 2.5 + 2.5).toFixed(1), // Random rating between 2.5-5
        popularity: Math.floor(Math.random() * 100),
        seasonal: product.seasonal || false,
        seasonalAvailability: product.seasonalAvailability || [],
        purchaseFrequency: Math.floor(Math.random() * 200),
        restockThreshold: restockThreshold,
        nextRestock: new Date(Date.now() + (7 + Math.floor(Math.random() * 14)) * 24 * 60 * 60 * 1000),
        monthlyDemandHistory: monthlyDemandHistory
      });
    });
  });
  
  return items;
};

// Generate users with random preferences
const generateUsers = (count = 25) => {
  const users = [];
  
  // Create the users with random attributes
  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    // Random household size (1-7)
    const householdSize = Math.floor(Math.random() * 6) + 1;
    
    // Random user segment
    const userSegment = [
      'price_sensitive', 'quality_focused', 'convenience_seeker', 
      'health_conscious', 'traditional', 'explorer'
    ][Math.floor(Math.random() * 6)];
    
    // Random dietary preferences
    const isVegetarian = Math.random() > 0.4; // 60% are vegetarian
    
    // Random preferred categories (2-5 categories)
    const numCategories = Math.floor(Math.random() * 3) + 2;
    const allCategories = Object.keys(groceryCategories);
    const preferredCategories = [];
    
    for (let j = 0; j < numCategories; j++) {
      const randomCategory = allCategories[Math.floor(Math.random() * allCategories.length)];
      if (!preferredCategories.includes(randomCategory)) {
        preferredCategories.push(randomCategory);
      }
    }
    
    // Create user object
    users.push({
      uid: `user${i+1}`,
      password: 'password123', // Simple password for demo
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      phone: `9${Math.floor(Math.random() * 900000000 + 100000000)}`, // Random 10-digit phone
      address: {
        street: `${Math.floor(Math.random() * 100) + 1}, ${['Main', 'Park', 'Gandhi', 'Nehru', 'Lake'][Math.floor(Math.random() * 5)]} Road`,
        city: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad'][Math.floor(Math.random() * 8)],
        state: ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'West Bengal', 'Telangana', 'Gujarat'][Math.floor(Math.random() * 7)],
        pincode: `${Math.floor(Math.random() * 900000) + 100000}` // Random 6-digit pincode
      },
      isAdmin: false,
      dietaryPreferences: {
        isVegetarian,
        isVegan: isVegetarian && Math.random() > 0.8, // Small percent of vegetarians are vegan
        allergies: Math.random() > 0.8 ? ['Peanuts', 'Dairy', 'Gluten'][Math.floor(Math.random() * 3)] : [],
        preferredCuisines: ['North Indian', 'South Indian', 'Bengali', 'Gujarati', 'Punjabi'].sort(() => 0.5 - Math.random()).slice(0, 2)
      },
      preferredCategories,
      householdSize,
      userSegment,
      purchaseFrequency: ['daily', 'weekly', 'biweekly', 'monthly'][Math.floor(Math.random() * 4)]
    });
  }
  
  return users;
};