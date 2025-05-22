import React, { useState, useMemo } from 'react';
import { useInventory } from '../../contexts/InventoryContext';
import InventoryItem from './InventoryItem';
import { useExtension } from '../../contexts/ExtensionContext';

const InventoryList: React.FC = () => {
  const { inventory } = useInventory();
  const { getExtensionsForPoint } = useExtension();
  const [category, setCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('name');
  const [showOutOfStock, setShowOutOfStock] = useState<boolean>(true);
  
  // Get the inventory extensions
  const InventoryExtensions = getExtensionsForPoint('inventory-list');
  
  // Get unique categories from inventory
  const categories = ['All', ...new Set(inventory.map(item => item.category))];
  
  // Filter and sort inventory
  const filteredInventory = useMemo(() => {
    return inventory
      .filter(item => (category === 'All' || item.category === category) && (showOutOfStock || item.stock > 0))
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'stock') return b.stock - a.stock;
        return 0;
      });
  }, [inventory, category, sortBy, showOutOfStock]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div className="mb-4 sm:mb-0">
          <h2 className="text-2xl font-bold text-gray-900">Store Inventory</h2>
          <p className="text-gray-600">Browse our latest products</p>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <select
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          
          <select
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="name">Name (A-Z)</option>
            <option value="price-low">Price (Low to High)</option>
            <option value="price-high">Price (High to Low)</option>
            <option value="stock">Stock (High to Low)</option>
          </select>
          
          <div className="flex items-center ml-4">
            <input
              type="checkbox"
              id="showOutOfStock"
              checked={showOutOfStock}
              onChange={(e) => setShowOutOfStock(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="showOutOfStock" className="ml-2 text-sm text-gray-700">
              Show Out of Stock
            </label>
          </div>
        </div>
      </div>
      
      {/* Extensions point */}
      {InventoryExtensions.map((Extension, index) => (
        <Extension key={`ext-${index}`} />
      ))}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredInventory.map((item) => (
          <InventoryItem key={item._id || item.id} item={item} />
        ))}
        
        {filteredInventory.length === 0 && (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">No items found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryList;