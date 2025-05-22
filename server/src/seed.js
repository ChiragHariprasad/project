import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/userModel.js';
import InventoryItem from './models/inventoryModel.js';
import PurchaseHistory from './models/purchaseHistoryModel.js';
import sampleInventory from './data/sampleInventory.js';
import bcrypt from 'bcryptjs';
import { seedDatabase as seedIndianGrocery } from './data/indianGrocerySeed.js';

// Load environment variables
dotenv.config();

// Set mongoose options
mongoose.set('strictQuery', false);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/inventory-management')
  .then(() => console.log('MongoDB connected for seeding'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Create admin user
const createAdminUser = async () => {
  try {
    // Check if admin already exists
    const adminExists = await User.findOne({ uid: 'admin' });
    
    if (adminExists) {
      console.log('Admin user already exists');
      return;
    }
    
    // Create admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('@123', salt);
    
    await User.create({
      uid: 'admin',
      password: hashedPassword,
      isAdmin: true
    });
    
    console.log('Admin user created successfully');
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
};

// Import sample inventory data
const importInventory = async () => {
  try {
    // Choose which seed data to use
    const useIndianGrocery = true; // Set to true to use Indian grocery data
    
    if (useIndianGrocery) {
      console.log('Using Indian Grocery Seed Data...');
      const result = await seedIndianGrocery();
      if (result) {
        console.log('Indian grocery data imported successfully');
      } else {
        throw new Error('Failed to seed Indian grocery data');
      }
    } else {
      // Delete existing data
      await InventoryItem.deleteMany({});
      await PurchaseHistory.deleteMany({});
      
      // Insert basic sample data (original implementation)
      await InventoryItem.insertMany(sampleInventory);
      console.log('Basic sample inventory data imported successfully');
    }
  } catch (error) {
    console.error('Error importing inventory data:', error);
    throw error; // Re-throw to handle in main function
  }
};

// Main seeding function
const seedDatabase = async () => {
  try {
    await createAdminUser();
    await importInventory();
    
    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    console.error('Please check that MongoDB is running and all schema files are correct');
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();