import React, { useState } from 'react';
import AdminItemList from '../components/admin/AdminItemList';
import AdminRecommendations from '../components/recommendations/AdminRecommendations';
import CustomerBehaviorAnalytics from '../components/admin/CustomerBehaviorAnalytics';

const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'analytics' | 'customers'>('inventory');
  
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 border-b border-gray-200">
        <div className="flex space-x-8">
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'inventory'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('inventory')}
          >
            Inventory Management
          </button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'analytics'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('analytics')}
          >
            Inventory Analytics
          </button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'customers'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('customers')}
          >
            Customer Behavior
          </button>
        </div>
      </div>
      
      {activeTab === 'inventory' && <AdminItemList />}
      {activeTab === 'analytics' && <AdminRecommendations />}
      {activeTab === 'customers' && <CustomerBehaviorAnalytics />}
    </div>
  );
};

export default AdminPage;