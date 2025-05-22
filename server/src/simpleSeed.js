import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/userModel.js';
import InventoryItem from './models/inventoryModel.js';
import PurchaseHistory from './models/purchaseHistoryModel.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/inventory-management')
  .then(() => console.log('MongoDB connected for seeding'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Create items with initial inventory
const createBasicInventoryItems = async () => {
  // Basic Indian grocery items
  const items = [
    {
      name: "Basmati Rice",
      description: "Premium long grain rice - 5kg",
      price: 350,
      stock: 100,
      image: "https://images.pexels.com/photos/7543215/pexels-photo-7543215.jpeg",
      category: "Rice & Flour",
      subCategory: "Rice",
      unit: "kg",
      unitSize: 5,
      brand: "India Gate",
      isVegetarian: true,
      region: "North Indian",
      tags: ["staple", "essential"],
      avgRating: 4.5,
      popularity: 95,
      restockThreshold: 15,
      nextRestock: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
    },
    {
      name: "Toor Dal",
      description: "Split yellow lentils - 1kg",
      price: 130,
      stock: 75,
      image: "https://images.pexels.com/photos/4198377/pexels-photo-4198377.jpeg",
      category: "Pulses & Lentils",
      subCategory: "Pulses",
      unit: "kg",
      unitSize: 1,
      brand: "Tata Sampann",
      isVegetarian: true,
      region: "Pan Indian",
      tags: ["staple", "essential", "protein"],
      avgRating: 4.3,
      popularity: 87,
      restockThreshold: 12,
      nextRestock: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000)
    },
    {
      name: "Turmeric Powder",
      description: "Pure ground turmeric - 100g",
      price: 60,
      stock: 90,
      image: "https://images.pexels.com/photos/4198370/pexels-photo-4198370.jpeg",
      category: "Spices",
      subCategory: "Ground Spices",
      unit: "gm",
      unitSize: 100,
      brand: "Everest",
      isVegetarian: true,
      region: "Pan Indian",
      tags: ["staple", "essential", "cooking"],
      avgRating: 4.7,
      popularity: 90,
      restockThreshold: 20,
      nextRestock: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    },
    {
      name: "Ghee",
      description: "Pure cow ghee - 1kg",
      price: 550,
      stock: 60,
      image: "https://images.pexels.com/photos/10818317/pexels-photo-10818317.jpeg",
      category: "Oils & Ghee",
      subCategory: "Dairy",
      unit: "kg",
      unitSize: 1,
      brand: "Amul",
      isVegetarian: true,
      region: "Pan Indian",
      tags: ["staple", "essential", "cooking", "dessert"],
      avgRating: 4.8,
      popularity: 80,
      restockThreshold: 10,
      nextRestock: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000)
    },
    {
      name: "Wheat Flour (Atta)",
      description: "Stone-ground whole wheat flour - 5kg",
      price: 220,
      stock: 85,
      image: "https://images.pexels.com/photos/5765/flour-food-wheat-powder.jpg",
      category: "Rice & Flour",
      subCategory: "Flour",
      unit: "kg",
      unitSize: 5,
      brand: "Aashirvaad",
      isVegetarian: true,
      region: "Pan Indian",
      tags: ["staple", "essential", "roti"],
      avgRating: 4.6,
      popularity: 92,
      restockThreshold: 15,
      nextRestock: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000)
    },
    {
      name: "Mustard Oil",
      description: "Cold-pressed mustard oil - 1L",
      price: 180,
      stock: 70,
      image: "https://images.pexels.com/photos/4021983/pexels-photo-4021983.jpeg",
      category: "Oils & Ghee",
      subCategory: "Cooking Oil",
      unit: "litre",
      unitSize: 1,
      brand: "Fortune",
      isVegetarian: true,
      region: "North Indian",
      tags: ["staple", "cooking", "essential"],
      avgRating: 4.4,
      popularity: 75,
      restockThreshold: 12,
      nextRestock: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    },
    {
      name: "Cumin Seeds",
      description: "Whole cumin seeds - 100g",
      price: 80,
      stock: 95,
      image: "https://images.pexels.com/photos/4197613/pexels-photo-4197613.jpeg",
      category: "Spices",
      subCategory: "Whole Spices",
      unit: "gm",
      unitSize: 100,
      brand: "Catch",
      isVegetarian: true,
      region: "Pan Indian",
      tags: ["staple", "essential", "cooking"],
      avgRating: 4.5,
      popularity: 82,
      restockThreshold: 18,
      nextRestock: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
    },
    {
      name: "Moong Dal",
      description: "Split green gram - 1kg",
      price: 120,
      stock: 65,
      image: "https://images.pexels.com/photos/4198028/pexels-photo-4198028.jpeg",
      category: "Pulses & Lentils",
      subCategory: "Pulses",
      unit: "kg",
      unitSize: 1,
      brand: "Tata Sampann",
      isVegetarian: true,
      region: "Pan Indian",
      tags: ["staple", "essential", "protein"],
      avgRating: 4.3,
      popularity: 79,
      restockThreshold: 10,
      nextRestock: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000)
    },
    {
      name: "Red Chilli Powder",
      description: "Hot ground red chillies - 100g",
      price: 70,
      stock: 80,
      image: "https://images.pexels.com/photos/4197809/pexels-photo-4197809.jpeg",
      category: "Spices",
      subCategory: "Ground Spices",
      unit: "gm",
      unitSize: 100,
      brand: "MDH",
      isVegetarian: true,
      region: "Pan Indian",
      tags: ["staple", "essential", "cooking"],
      avgRating: 4.6,
      popularity: 85,
      restockThreshold: 20,
      nextRestock: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000)
    },
    {
      name: "Potato",
      description: "Fresh potatoes - 1kg",
      price: 30,
      stock: 120,
      image: "https://images.pexels.com/photos/144248/potatoes-vegetables-erdfrucht-bio-144248.jpeg",
      category: "Vegetables",
      subCategory: "Root Vegetables",
      unit: "kg",
      unitSize: 1,
      brand: "Fresh",
      isVegetarian: true,
      region: "Pan Indian",
      tags: ["staple", "essential"],
      seasonal: false,
      avgRating: 4.2,
      popularity: 90,
      restockThreshold: 25,
      nextRestock: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    },
    {
      name: "Paneer",
      description: "Fresh cottage cheese - 200g",
      price: 80,
      stock: 45,
      image: "https://images.pexels.com/photos/6641814/pexels-photo-6641814.jpeg",
      category: "Dairy & Dairy Products",
      subCategory: "Cheese",
      unit: "gm",
      unitSize: 200,
      brand: "Amul",
      isVegetarian: true,
      region: "North Indian",
      tags: ["protein", "curry"],
      avgRating: 4.4,
      popularity: 78,
      restockThreshold: 10,
      nextRestock: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
    }
  ];

  try {
    // Delete any existing items
    await InventoryItem.deleteMany({});
    
    // Insert new items
    const savedItems = await InventoryItem.insertMany(items);
    console.log(`${savedItems.length} items inserted successfully`);
    
    return savedItems;
  } catch (err) {
    console.error('Error creating inventory items:', err);
    throw err;
  }
};

// Create demo users
const createDemoUsers = async () => {
  try {
    // Don't delete existing users, just add if they don't exist
    
    // Create demo users
    const users = [];
    
    // Create admin user if it doesn't exist
    const adminExists = await User.findOne({ uid: 'admin' });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const adminUser = await User.create({
        uid: 'admin',
        password: await bcrypt.hash('@123', salt),
        name: 'Admin User',
        isAdmin: true
      });
      users.push(adminUser);
      console.log('Admin user created');
    } else {
      console.log('Admin user already exists');
    }
    
    // Create regular user if it doesn't exist
    const userExists = await User.findOne({ uid: 'user1' });
    if (!userExists) {
      const salt = await bcrypt.genSalt(10);
      const regularUser = await User.create({
        uid: 'user1',
        password: await bcrypt.hash('password123', salt),
        name: 'Aarav Sharma',
        email: 'aarav.sharma@example.com',
        phone: '9876543210',
        address: {
          street: '42, Gandhi Road',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001'
        },
        isAdmin: false,
        dietaryPreferences: {
          isVegetarian: true,
          isVegan: false,
          allergies: [],
          preferredCuisines: ['North Indian', 'Punjabi']
        },
        preferredCategories: ['Spices', 'Rice & Flour', 'Pulses & Lentils'],
        householdSize: 4,
        userSegment: 'traditional',
        purchaseFrequency: 'weekly'
      });
      users.push(regularUser);
      console.log('Regular user created');
    } else {
      console.log('Regular user already exists');
    }
    
    return users;
  } catch (err) {
    console.error('Error creating users:', err);
    throw err;
  }
};

// Create sample purchase history
const createSamplePurchaseHistory = async (users, items) => {
  try {
    // Clear existing purchase history
    await PurchaseHistory.deleteMany({});
    
    // We only need purchase history if we have both users and items
    if (users.length === 0 || items.length === 0) {
      console.log('Skipping purchase history creation due to missing users or items');
      return [];
    }
    
    const regularUser = users.find(u => !u.isAdmin) || await User.findOne({ uid: 'user1' });
    if (!regularUser) {
      console.log('No regular user found for purchase history');
      return [];
    }
    
    // Create 5 purchase records over the last 2 months
    const histories = [];
    
    for (let i = 0; i < 5; i++) {
      // Create a date in the past (1-60 days ago)
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - Math.floor(Math.random() * 60) - 1);
      
      // Select 3-6 random items for this purchase
      const itemCount = Math.floor(Math.random() * 4) + 3;
      const purchasedItems = [];
      let totalAmount = 0;
      
      // Create a set of already selected indices to avoid duplicates
      const selectedIndices = new Set();
      
      for (let j = 0; j < itemCount; j++) {
        // Get a random item not already selected
        let randomIndex;
        do {
          randomIndex = Math.floor(Math.random() * items.length);
        } while (selectedIndices.has(randomIndex));
        
        selectedIndices.add(randomIndex);
        const item = items[randomIndex];
        
        // Random quantity 1-3
        const quantity = Math.floor(Math.random() * 3) + 1;
        
        purchasedItems.push({
          item: item._id,
          quantity,
          price: item.price,
          categoryAtPurchase: item.category,
          subCategoryAtPurchase: item.subCategory
        });
        
        totalAmount += item.price * quantity;
      }
      
      // Create purchase record
      const purchaseRecord = new PurchaseHistory({
        user: regularUser._id,
        items: purchasedItems,
        totalAmount,
        purchaseDate: pastDate,
        dayOfWeek: pastDate.getDay(),
        weekOfMonth: Math.ceil(pastDate.getDate() / 7),
        month: pastDate.getMonth(),
        year: pastDate.getFullYear(),
        season: getSeason(pastDate)
      });
      
      const savedRecord = await purchaseRecord.save();
      histories.push(savedRecord);
    }
    
    console.log(`${histories.length} purchase records created`);
    return histories;
  } catch (err) {
    console.error('Error creating purchase history:', err);
    throw err;
  }
};

// Helper to determine season based on date
const getSeason = (date) => {
  const month = date.getMonth();
  
  if (month >= 11 || month <= 1) return 'Winter';
  if (month >= 2 && month <= 4) return 'Spring';
  if (month >= 5 && month <= 6) return 'Summer';
  if (month >= 7 && month <= 8) return 'Monsoon';
  return 'Autumn';
};

// Main function to run the seed
const runSeed = async () => {
  try {
    console.log('Starting simple seed process...');
    
    // Create inventory items
    const items = await createBasicInventoryItems();
    
    // Create users
    const users = await createDemoUsers();
    
    // Create purchase history
    await createSamplePurchaseHistory(users, items);
    
    console.log('Seed completed successfully!');
    mongoose.disconnect();
    return true;
  } catch (error) {
    console.error('Seed process failed:', error);
    mongoose.disconnect();
    return false;
  }
};

// Run the seed function
runSeed().then(success => {
  process.exit(success ? 0 : 1);
});