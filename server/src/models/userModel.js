import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    dietaryPreferences: {
      isVegetarian: {
        type: Boolean,
        default: true,
      },
      isVegan: {
        type: Boolean,
        default: false,
      },
      allergies: [String],
      preferredCuisines: [String],
    },
    preferredCategories: [String],
    favoriteItems: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InventoryItem',
    }],
    purchaseFrequency: {
      type: String,
      enum: ['daily', 'weekly', 'biweekly', 'monthly'],
      default: 'weekly',
    },
    householdSize: {
      type: Number,
      default: 4,
    },
    // Forgot password fields
    resetCode: {
      type: String,
    },
    resetCodeExpiry: {
      type: Date,
    },
    userSegment: {
      type: String,
      enum: ['price_sensitive', 'quality_focused', 'convenience_seeker', 'health_conscious', 'traditional', 'explorer'],
      default: 'traditional',
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Static method to generate unique UID
userSchema.statics.generateUID = function () {
  return Math.random().toString(36).substring(2, 10);
};

// Static method to assign a random user segment for demo purposes
userSchema.statics.getRandomUserSegment = function() {
  const segments = ['price_sensitive', 'quality_focused', 'convenience_seeker', 'health_conscious', 'traditional', 'explorer'];
  return segments[Math.floor(Math.random() * segments.length)];
};

// Add method to get related items based on user preferences
userSchema.methods.getRelatedCategories = function() {
  const relatedCategories = new Set(this.preferredCategories);
  
  // Add related categories based on user segment
  if (this.userSegment === 'health_conscious') {
    relatedCategories.add('Organic Products');
    relatedCategories.add('Health Foods');
  } else if (this.userSegment === 'traditional') {
    relatedCategories.add('Spices');
    relatedCategories.add('Rice & Flour');
  } else if (this.userSegment === 'price_sensitive') {
    relatedCategories.add('Discounted Items');
    relatedCategories.add('Value Packs');
  }
  
  return Array.from(relatedCategories);
};

const User = mongoose.model('User', userSchema);

export default User;