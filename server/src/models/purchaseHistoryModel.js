import mongoose from 'mongoose';

const purchaseHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'InventoryItem',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
        categoryAtPurchase: String,
        subCategoryAtPurchase: String,
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
    dayOfWeek: {
      type: Number, // 0-6, 0 is Sunday
      default: function() {
        return this.purchaseDate.getDay();
      },
    },
    weekOfMonth: {
      type: Number,
      default: function() {
        const date = this.purchaseDate.getDate();
        return Math.ceil(date / 7);
      },
    },
    month: {
      type: Number, // 0-11, 0 is January
      default: function() {
        return this.purchaseDate.getMonth();
      },
    },
    year: {
      type: Number,
      default: function() {
        return this.purchaseDate.getFullYear();
      },
    },
    season: {
      type: String,
      enum: ['Winter', 'Summer', 'Monsoon', 'Spring', 'Autumn'],
      default: function() {
        const month = this.purchaseDate.getMonth();
        if (month >= 11 || month <= 1) return 'Winter';
        if (month >= 2 && month <= 4) return 'Spring';
        if (month >= 5 && month <= 6) return 'Summer';
        if (month >= 7 && month <= 8) return 'Monsoon';
        return 'Autumn';
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster recommendation queries
purchaseHistorySchema.index({ user: 1, purchaseDate: -1 });
purchaseHistorySchema.index({ 'items.item': 1 });
purchaseHistorySchema.index({ month: 1, year: 1 });
purchaseHistorySchema.index({ season: 1 });
purchaseHistorySchema.index({ dayOfWeek: 1 });

const PurchaseHistory = mongoose.model('PurchaseHistory', purchaseHistorySchema);

export default PurchaseHistory;