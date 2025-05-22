// Type definitions for the application

export interface User {
  _id?: string;
  uid: string;
  isAdmin: boolean;
  name?: string;
  email?: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  dietaryPreferences?: {
    isVegetarian: boolean;
    isVegan: boolean;
    allergies: string[];
    preferredCuisines: string[];
  };
  preferredCategories?: string[];
  householdSize?: number;
  userSegment?: string;
  purchaseFrequency?: string;
}

export interface InventoryItem {
  id?: string;
  _id?: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  category: string;
  subCategory?: string;
  unit?: string;
  unitSize?: number;
  brand?: string;
  isVegetarian?: boolean;
  region?: string;
  tags?: string[];
  avgRating?: number;
  popularity?: number;
  seasonal?: boolean;
  seasonalAvailability?: string[];
  purchaseFrequency?: number;
  restockThreshold?: number;
  nextRestock: string; // ISO date string
  monthlyDemandHistory?: Array<{
    month: string;
    year: number;
    demand: number;
  }>;
}

export interface CartItem {
  item: InventoryItem;
  quantity: number;
}

export interface RecommendedItem extends InventoryItem {
  recType?: string;
  score?: number;
  depletionPercentage?: number;
  seasonalMatch?: string;
  daysSinceLastPurchase?: number;
  avgDaysBetweenPurchases?: number;
}

export interface PurchaseHistoryItem {
  _id: string;
  user: string | User;
  items: Array<{
    item: string | InventoryItem;
    quantity: number;
    price: number;
    categoryAtPurchase: string;
    subCategoryAtPurchase: string;
  }>;
  totalAmount: number;
  purchaseDate: string;
  dayOfWeek: number;
  weekOfMonth: number;
  month: number;
  year: number;
  season: string;
}

export interface ExtensionPoint {
  id: string;
  component: React.ComponentType<any>;
}