import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { TrendingUp, TrendingDown, AlertTriangle, Info, Calendar, RefreshCw } from 'lucide-react';
import Button from '../ui/Button';

interface RestockItem {
  item: {
    _id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    image: string;
    category: string;
    subCategory: string;
    brand: string;
    restockThreshold: number;
  };
  currentStock: number;
  restockThreshold: number;
  urgency: 'high' | 'medium' | 'low';
  recommended: number;
  isSeasonal?: boolean;
  upcomingSeason?: string;
  historicalData?: any;
}

interface InsightData {
  stockSummary: {
    value: number;
    totalItems: number;
    totalUnits: number;
  };
  categoryBreakdown: Array<{
    _id: string;
    itemCount: number;
    totalValue: number;
    avgPrice: number;
  }>;
  mostPopular: Array<any>;
  nonMovingItems: Array<any>;
  monthlySalesTrend: Array<{
    _id: { month: number; year: number };
    totalSales: number;
    totalTransactions: number;
  }>;
  timestamp: string;
}

const AdminRecommendations: React.FC = () => {
  const [restockRecommendations, setRestockRecommendations] = useState<RestockItem[]>([]);
  const [insights, setInsights] = useState<InsightData | null>(null);
  const [isLoadingRestock, setIsLoadingRestock] = useState<boolean>(true);
  const [isLoadingInsights, setIsLoadingInsights] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingRestock(true);
        setIsLoadingInsights(true);
        setError(null);
        
        // Fetch restock recommendations
        const restockResponse = await axios.get('/api/recommendations/restock', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (restockResponse.data && restockResponse.data.success) {
          setRestockRecommendations(restockResponse.data.recommendations);
        }
        
        // Fetch insights
        const insightsResponse = await axios.get('/api/recommendations/insights', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (insightsResponse.data && insightsResponse.data.success) {
          setInsights(insightsResponse.data.insights);
        }
      } catch (err) {
        console.error('Error fetching admin recommendations:', err);
        setError('Could not load recommendations at this time.');
      } finally {
        setIsLoadingRestock(false);
        setIsLoadingInsights(false);
      }
    };
    
    if (token) {
      fetchData();
    }
  }, [token]);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const renderLoadingState = () => (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded mb-4 w-1/4"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded"></div>
        ))}
      </div>
    </div>
  );

  const renderError = () => (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {error}
    </div>
  );

  const renderInsightsSummary = () => {
    if (!insights) return null;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="rounded-full bg-blue-100 p-2 mr-4">
              <TrendingUp className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Inventory Value</p>
              <p className="text-xl font-bold">{formatCurrency(insights.stockSummary.value)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="rounded-full bg-green-100 p-2 mr-4">
              <Info className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Products</p>
              <p className="text-xl font-bold">{insights.stockSummary.totalItems}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="rounded-full bg-yellow-100 p-2 mr-4">
              <AlertTriangle className="text-yellow-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Low Stock Items</p>
              <p className="text-xl font-bold">{restockRecommendations.filter(r => r.urgency === 'high').length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="rounded-full bg-purple-100 p-2 mr-4">
              <Calendar className="text-purple-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Seasonal Items</p>
              <p className="text-xl font-bold">{restockRecommendations.filter(r => r.isSeasonal).length}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderRestockRecommendations = () => {
    if (restockRecommendations.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <RefreshCw size={40} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">No restock recommendations at this time.</p>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Restock Recommendations</h3>
          <p className="text-sm text-gray-500">Based on historical data, current stock, and predicted demand</p>
        </div>
        
        <div className="divide-y divide-gray-200">
          {restockRecommendations.slice(0, 10).map((rec) => (
            <div key={rec.item._id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center">
                <div className="h-12 w-12 flex-shrink-0 rounded overflow-hidden">
                  <img src={rec.item.image} alt={rec.item.name} className="h-full w-full object-cover" />
                </div>
                
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{rec.item.name}</h4>
                      <p className="text-xs text-gray-500">{rec.item.category} • {rec.item.brand}</p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUrgencyColor(rec.urgency)}`}>
                        {rec.urgency === 'high' ? 'Urgent' : rec.urgency === 'medium' ? 'Soon' : 'Planned'}
                      </span>
                      
                      {rec.isSeasonal && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
                          {rec.upcomingSeason}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div>
                        <span className="text-xs text-gray-500">Current Stock</span>
                        <p className={`text-sm font-medium ${rec.currentStock <= rec.restockThreshold ? 'text-red-600' : 'text-gray-900'}`}>
                          {rec.currentStock} units
                        </p>
                      </div>
                      
                      <div>
                        <span className="text-xs text-gray-500">Threshold</span>
                        <p className="text-sm font-medium text-gray-900">{rec.restockThreshold} units</p>
                      </div>
                      
                      <div>
                        <span className="text-xs text-gray-500">Recommended</span>
                        <p className="text-sm font-medium text-blue-600">+{rec.recommended} units</p>
                      </div>
                    </div>
                    
                    <Button variant="primary" size="sm">
                      Restock
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {restockRecommendations.length > 10 && (
          <div className="px-6 py-3 bg-gray-50 text-right">
            <Button variant="outline" size="sm">
              View All ({restockRecommendations.length})
            </Button>
          </div>
        )}
      </div>
    );
  };

  const renderCategoryBreakdown = () => {
    if (!insights || !insights.categoryBreakdown) return null;
    
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Inventory by Category</h3>
        </div>
        
        <div className="px-6 py-4">
          {insights.categoryBreakdown.slice(0, 5).map((category, index) => (
            <div key={category._id} className="mb-3 last:mb-0">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">{category._id}</span>
                <span className="text-sm text-gray-500">{formatCurrency(category.totalValue)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ 
                    width: `${Math.min(100, (category.totalValue / insights.stockSummary.value) * 100)}%` 
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderNonMovingItems = () => {
    if (!insights || !insights.nonMovingItems || insights.nonMovingItems.length === 0) return null;
    
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Non-Moving Items</h3>
          <p className="text-sm text-gray-500">No sales in past 3 months</p>
        </div>
        
        <div className="divide-y divide-gray-200">
          {insights.nonMovingItems.slice(0, 5).map((item) => (
            <div key={item._id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center">
                <div className="h-10 w-10 flex-shrink-0 rounded overflow-hidden">
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.category} • Stock: {item.stock}</p>
                </div>
              </div>
              <div className="text-sm font-medium text-red-600">
                <TrendingDown size={16} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Inventory Intelligence</h2>
      
      {error && renderError()}
      
      {isLoadingInsights ? renderLoadingState() : renderInsightsSummary()}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          {isLoadingRestock ? renderLoadingState() : renderRestockRecommendations()}
        </div>
        
        <div className="space-y-6">
          {insights && renderCategoryBreakdown()}
          {insights && renderNonMovingItems()}
        </div>
      </div>
    </div>
  );
};

export default AdminRecommendations;