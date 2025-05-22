import mongoose from 'mongoose';

const inventoryItemSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    image: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    subCategory: {
      type: String,
      trim: true,
      default: '',
    },
    unit: {
      type: String,
      default: 'piece',
      enum: ['kg', 'gm', 'piece', 'litre', 'ml', 'packet', 'dozen', 'box', 'bunch'],
    },
    unitSize: {
      type: Number,
      default: 1,
    },
    brand: {
      type: String,
      default: '',
    },
    isVegetarian: {
      type: Boolean,
      default: true,
    },
    region: {
      type: String,
      default: 'North Indian',
    },
    tags: [{
      type: String,
      trim: true,
    }],
    avgRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    popularity: {
      type: Number,
      default: 0,
    },
    seasonal: {
      type: Boolean,
      default: false,
    },
    seasonalAvailability: [{
      type: String,
      enum: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    }],
    purchaseFrequency: {
      type: Number,
      default: 0,
    },
    restockThreshold: {
      type: Number,
      default: 5,
    },
    nextRestock: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    },
    monthlyDemandHistory: [{
      month: String,
      year: Number,
      demand: Number,
    }],
  },
  {
    timestamps: true,
  }
);

// Index for faster recommendation queries
inventoryItemSchema.index({ category: 1, subCategory: 1, popularity: -1 });
inventoryItemSchema.index({ tags: 1 });
inventoryItemSchema.index({ purchaseFrequency: -1 });

const InventoryItem = mongoose.model('InventoryItem', inventoryItemSchema);

export default InventoryItem;