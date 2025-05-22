import React, { useState } from 'react';
import { InventoryItem as InventoryItemType } from '../../types';
import { useInventory } from '../../contexts/InventoryContext';
import { ShoppingCart, Clock } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { formatDate, formatCurrency } from '../../utils/formatters';

interface InventoryItemProps {
  item: InventoryItemType;
}

const InventoryItem: React.FC<InventoryItemProps> = ({ item }) => {
  const { addToCart } = useInventory();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  
  const handleAddToCart = () => {
    addToCart(item, quantity);
    setIsAdding(false);
    setQuantity(1);
  };
  
  const stockStatus = () => {
    if (item.stock === 0) return 'Out of stock';
    if (item.stock < 5) return 'Low stock';
    return `${item.stock} in stock`;
  };
  
  const stockClass = () => {
    if (item.stock === 0) return 'bg-red-100 text-red-800';
    if (item.stock < 5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };
  
  // Prevent adding out-of-stock items
  const isOutOfStock = item.stock === 0;
  
  return (
    <Card className={`h-full flex flex-col ${item.stock === 0 ? 'ring-2 ring-red-500' : ''}`}>
      <div className="relative h-48 overflow-hidden">
        <img 
          src={item.image} 
          alt={item.name} 
          className={`w-full h-full object-cover transition-transform duration-300 hover:scale-105 ${item.stock === 0 ? 'opacity-70' : ''}`}
        />
        <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${stockClass()}`}>
          {stockStatus()}
        </div>
      </div>
      
      <div className="p-4 flex-grow flex flex-col">
        <div className="mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
          <p className="text-sm text-gray-500">{item.category}</p>
        </div>
        
        <p className="text-sm text-gray-600 mb-3">{item.description}</p>
        
        <div className="flex items-center text-sm text-gray-600 mt-auto mb-3">
          <Clock size={16} className="mr-1 text-blue-900" />
          <span>Restock: {formatDate(new Date(item.nextRestock))}</span>
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <span className="text-xl font-bold text-blue-900">{formatCurrency(item.price)}</span>
          
          {isAdding ? (
            <div className="flex items-center space-x-2">
              <button 
                className="p-1 border rounded"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={isOutOfStock}
              >
                -
              </button>
              <span className="w-8 text-center">{quantity}</span>
              <button 
                className="p-1 border rounded"
                onClick={() => setQuantity(Math.min(item.stock, quantity + 1))}
                disabled={isOutOfStock}
              >
                +
              </button>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
              >
                Add
              </Button>
            </div>
          ) : (
            <Button 
              variant={isOutOfStock ? "outline" : "primary"}
              size="sm"
              onClick={() => !isOutOfStock && setIsAdding(true)}
              disabled={isOutOfStock}
              className={isOutOfStock ? "text-red-600 cursor-not-allowed" : ""}
            >
              {isOutOfStock ? (
                "Out of Stock"
              ) : (
                <>
                  <ShoppingCart size={16} className="mr-1" /> 
                  Buy
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default InventoryItem;