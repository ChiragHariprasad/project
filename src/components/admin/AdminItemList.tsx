import React, { useState } from 'react';
import { useInventory } from '../../contexts/InventoryContext';
import { Edit, Trash2, Plus, Search } from 'lucide-react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import AdminItemForm from './AdminItemForm';
import { InventoryItem } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

const AdminItemList: React.FC = () => {
  const { inventory, addInventoryItem, updateInventoryItem, deleteInventoryItem } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentItem, setCurrentItem] = useState<InventoryItem | null>(null);
  
  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleAddItem = (newItem: InventoryItem) => {
    addInventoryItem(newItem);
    setShowAddModal(false);
  };
  
  const handleEditItem = (updatedItem: InventoryItem) => {
    updateInventoryItem(updatedItem);
    setShowEditModal(false);
  };
  
  const handleDeleteItem = () => {
    if (currentItem) {
      deleteInventoryItem(currentItem._id || currentItem.id);
      setShowDeleteModal(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">Manage Inventory</h2>
        
        <div className="flex items-center w-full sm:w-auto">
          <div className="relative flex-grow mr-2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search inventory..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Button 
            variant="primary" 
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={16} className="mr-1" /> Add Item
          </Button>
        </div>
      </div>
      
      <div className="mt-6 overflow-x-auto bg-white shadow-md rounded-lg">
        <div className="p-4 bg-blue-50 border-b border-blue-100">
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-green-600 mr-2"></span>
              <span>In Stock</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-yellow-600 mr-2"></span>
              <span>Low Stock (less than 5)</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-red-600 mr-2"></span>
              <span>Out of Stock</span>
            </div>
          </div>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Next Restock
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredInventory.map((item) => (
              <tr 
                key={item._id || item.id} 
                className={`hover:bg-gray-50 ${
                  item.stock === 0 
                    ? 'bg-red-50 border-l-4 border-red-500' 
                    : item.stock < 5 
                      ? 'bg-yellow-50 border-l-4 border-yellow-500' 
                      : ''
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      <img className="h-10 w-10 rounded-full object-cover" src={item.image} alt="" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{item.description}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {item.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatCurrency(item.price)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`font-medium ${
                    item.stock === 0 
                      ? 'text-red-600' 
                      : item.stock < 5 
                        ? 'text-yellow-600' 
                        : 'text-green-600'
                  }`}>
                    {item.stock}
                    {item.stock === 0 && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                        Out of Stock
                      </span>
                    )}
                    {item.stock > 0 && item.stock < 5 && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                        Low Stock
                      </span>
                    )}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(new Date(item.nextRestock))}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    className="text-blue-600 hover:text-blue-900 mr-3"
                    onClick={() => {
                      setCurrentItem(item);
                      setShowEditModal(true);
                    }}
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    className="text-red-600 hover:text-red-900"
                    onClick={() => {
                      setCurrentItem(item);
                      setShowDeleteModal(true);
                    }}
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            
            {filteredInventory.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500">
                  No items found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Add Item Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Inventory Item"
        size="lg"
      >
        <AdminItemForm
          onSubmit={handleAddItem}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>
      
      {/* Edit Item Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Inventory Item"
        size="lg"
      >
        {currentItem && (
          <AdminItemForm
            item={currentItem}
            onSubmit={handleEditItem}
            onCancel={() => setShowEditModal(false)}
          />
        )}
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Deletion"
        size="sm"
      >
        <div className="text-center">
          <p className="mb-4">Are you sure you want to delete "{currentItem?.name}"?</p>
          <p className="mb-6 text-sm text-gray-500">This action cannot be undone.</p>
          
          <div className="flex justify-center space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteItem}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminItemList;