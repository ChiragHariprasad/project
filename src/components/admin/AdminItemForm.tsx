import React, { useState, useEffect } from 'react';
import { InventoryItem } from '../../types';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { AlertCircle } from 'lucide-react';

interface AdminItemFormProps {
  item?: InventoryItem;
  onSubmit: (item: InventoryItem) => void;
  onCancel: () => void;
}

const AdminItemForm: React.FC<AdminItemFormProps> = ({ 
  item, 
  onSubmit, 
  onCancel 
}) => {
  const [formData, setFormData] = useState<Omit<InventoryItem, 'id'>>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    image: '',
    category: '',
    nextRestock: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  });
  
  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        description: item.description,
        price: item.price,
        stock: item.stock,
        image: item.image,
        category: item.category,
        nextRestock: item.nextRestock,
      });
    }
  }, [item]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Make a deep copy of formData to avoid reference issues
    const formattedData = {
      ...formData,
      // Ensure price and stock are numbers
      price: Number(formData.price),
      stock: Number(formData.stock),
      // Ensure nextRestock is a valid date
      nextRestock: formData.nextRestock || new Date().toISOString(),
    };
    
    const newItem: InventoryItem = {
      ...(item?._id ? { _id: item._id } : {}),
      ...(item?.id && !item?._id ? { id: item.id } : {}),
      ...formattedData,
    };
    
    console.log('Submitting item:', newItem);
    onSubmit(newItem);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          id="name"
          label="Product Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        
        <Input
          id="category"
          label="Category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          value={formData.description}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          id="price"
          label="Price"
          name="price"
          type="number"
          step="0.01"
          min="0"
          value={formData.price.toString()}
          onChange={handleChange}
          required
        />
        
        <div>
          <Input
            id="stock"
            label="Stock"
            name="stock"
            type="number"
            min="0"
            step="1"
            value={formData.stock.toString()}
            onChange={handleChange}
            required
          />
          {Number(formData.stock) === 0 && (
            <div className="mt-1 flex items-center text-red-600 text-sm">
              <AlertCircle size={16} className="mr-1" />
              Item will be marked as out of stock
            </div>
          )}
          {Number(formData.stock) > 0 && Number(formData.stock) < 5 && (
            <div className="mt-1 flex items-center text-yellow-600 text-sm">
              <AlertCircle size={16} className="mr-1" />
              Low stock warning will be displayed
            </div>
          )}
        </div>
      </div>
      
      <Input
        id="image"
        label="Image URL"
        name="image"
        type="url"
        value={formData.image}
        onChange={handleChange}
        required
      />
      
      <Input
        id="nextRestock"
        label="Next Restock Date"
        name="nextRestock"
        type="datetime-local"
        value={formData.nextRestock ? new Date(formData.nextRestock).toISOString().slice(0, 16) : ''}
        onChange={(e) => {
          setFormData(prev => ({
            ...prev,
            nextRestock: e.target.value ? new Date(e.target.value).toISOString() : new Date().toISOString(),
          }));
        }}
        required
      />
      
      <div className="flex justify-end space-x-3">
        <Button onClick={onCancel} variant="outline" type="button">
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          {item ? 'Update Item' : 'Add Item'}
        </Button>
      </div>
    </form>
  );
};

export default AdminItemForm;