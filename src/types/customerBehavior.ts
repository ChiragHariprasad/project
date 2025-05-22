export interface PurchaseHistory {
  itemId: string;
  itemName: string;
  quantity: number;
  purchaseDate: string;
  price: number;
}

export interface CustomerBehavior {
  uid: string;
  purchaseHistory: PurchaseHistory[];
  totalSpent: number;
  lastPurchaseDate: string;
  averagePurchaseValue: number;
  purchaseFrequency: number; // average days between purchases
  topPurchases: {
    itemId: string;
    itemName: string;
    totalQuantity: number;
    lastPurchaseDate: string;
  }[];
  predictedNextPurchase: {
    predictedDate: string;
    predictedItems: {
      itemId: string;
      itemName: string;
      confidence: number;
    }[];
  };
}

export interface CustomerBehaviorSummary {
  totalCustomers: number;
  averagePurchaseValue: number;
  averagePurchaseFrequency: number;
  topSellingItems: {
    itemId: string;
    itemName: string;
    totalQuantity: number;
    totalRevenue: number;
  }[];
  customerSegments: {
    segment: string;
    count: number;
    averageSpend: number;
    topItems: string[];
  }[];
} 