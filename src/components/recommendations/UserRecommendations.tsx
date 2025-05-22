import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useInventory } from '../../contexts/InventoryContext';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { ShoppingCart, Clock, Star, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface RecommendationItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  category: string;
  subCategory: string;
  brand: string;
  tags: string[];
  isVegetarian: boolean;
  recType?: string;
  score?: number;
  depletionPercentage?: number;
  seasonalMatch?: string;
}

const UserRecommendations: React.FC = () => {
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();
  const { addToCart } = useInventory();

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await axios.get('/api/recommendations/user', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.data && response.data.success) {
          setRecommendations(response.data.recommendations);
        } else {
          throw new Error('Failed to fetch recommendations');
        }
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError('Could not load recommendations at this time.');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (token) {
      fetchRecommendations();
    }
  }, [token]);
  
  const handleAddToCart = (item: RecommendationItem) => {
    addToCart(item, 1);
  };
  
  // Get recommendation type tag
  const getRecommendationTag = (recType: string | undefined) => {
    switch (recType) {
      case 'frequent':
        return { text: 'Frequently Bought', color: 'bg-blue-100 text-blue-800', icon: <TrendingUp size={12} className="mr-1" /> };
      case 'seasonal':
        return { text: 'Seasonal Item', color: 'bg-green-100 text-green-800', icon: <Clock size={12} className="mr-1" /> };
      case 'low_stock':
        return { text: 'Running Low', color: 'bg-red-100 text-red-800', icon: <ShoppingCart size={12} className="mr-1" /> };
      case 'collaborative':
        return { text: 'Popular Choice', color: 'bg-purple-100 text-purple-800', icon: <Star size={12} className="mr-1" /> };
      default:
        return { text: 'Recommended', color: 'bg-yellow-100 text-yellow-800', icon: null };
    }
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse flex flex-col">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="p-4">
        <div className="text-center py-6">
          <div className="text-gray-500 mb-2">No recommendations available yet.</div>
          <div className="text-sm text-gray-400">Continue shopping to get personalized recommendations.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 md:p-4">
      <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-800">Recommended for you</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {recommendations.slice(0, 8).map((item) => {
          const tag = getRecommendationTag(item.recType);
          
          return (
            <Card 
              key={item._id} 
              className="flex flex-col h-full overflow-hidden transition-transform hover:scale-[1.02] duration-200"
              borderColor={item.stock === 0 ? 'ring-2 ring-red-500' : ''}
            >
              <div className="relative h-40 overflow-hidden bg-gray-100">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className={`w-full h-full object-cover ${item.stock === 0 ? 'opacity-70' : ''}`}
                />
                <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${item.stock === 0 ? 'bg-red-100 text-red-800' : tag.color}`}>
                  <div className="flex items-center">
                    {tag.icon}
                    {item.stock === 0 ? 'Out of stock' : tag.text}
                  </div>
                </div>
                {item.isVegetarian && (
                  <div className="absolute top-2 left-2 w-4 h-4 rounded-full flex items-center justify-center bg-green-500 border border-white">
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                )}
              </div>
              
              <div className="p-3 flex-grow flex flex-col">
                <div className="text-xs font-medium text-gray-500 mb-1">
                  {item.brand} • {item.category}
                </div>
                <h3 className="text-sm font-semibold mb-1 text-gray-800 line-clamp-2">
                  {item.name}
                </h3>
                <div className="text-xs text-gray-600 mb-2 line-clamp-2">
                  {item.description || `${item.subCategory} • ${item.tags.join(', ')}`}
                </div>
                
                <div className="mt-auto flex items-center justify-between">
                  <span className="text-base font-bold text-gray-900">
                    {formatCurrency(item.price)}
                  </span>
                  
                  <Button 
                    variant={item.stock === 0 ? "outline" : "primary"}
                    size="sm"
                    onClick={() => item.stock > 0 && handleAddToCart(item)}
                    disabled={item.stock === 0}
                    className={item.stock === 0 ? "text-red-600 cursor-not-allowed text-xs" : "text-xs"}
                  >
                    {item.stock === 0 ? (
                      "Out of Stock"
                    ) : (
                      <>
                        <ShoppingCart size={14} className="mr-1" /> 
                        Add
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default UserRecommendations;