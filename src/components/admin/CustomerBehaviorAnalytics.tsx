import React, { useState, useEffect } from 'react';
import { CustomerBehavior, CustomerBehaviorSummary } from '../../types/customerBehavior';
import { format } from 'date-fns';

const CustomerBehaviorAnalytics: React.FC = () => {
  const [summary, setSummary] = useState<CustomerBehaviorSummary | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerBehavior | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // In a real app, this would fetch data from an API
    // For now, we'll use mock data
    const mockSummary: CustomerBehaviorSummary = {
      totalCustomers: 150,
      averagePurchaseValue: 125.50,
      averagePurchaseFrequency: 14, // days
      topSellingItems: [
        { itemId: '1', itemName: 'Product A', totalQuantity: 500, totalRevenue: 25000 },
        { itemId: '2', itemName: 'Product B', totalQuantity: 300, totalRevenue: 15000 },
        { itemId: '3', itemName: 'Product C', totalQuantity: 200, totalRevenue: 10000 },
      ],
      customerSegments: [
        {
          segment: 'High Value',
          count: 30,
          averageSpend: 500,
          topItems: ['Product A', 'Product B'],
        },
        {
          segment: 'Regular',
          count: 80,
          averageSpend: 150,
          topItems: ['Product B', 'Product C'],
        },
        {
          segment: 'Occasional',
          count: 40,
          averageSpend: 50,
          topItems: ['Product C'],
        },
      ],
    };

    setSummary(mockSummary);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        {error}
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Total Customers</h3>
          <p className="mt-2 text-3xl font-bold text-blue-600">{summary.totalCustomers}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Average Purchase Value</h3>
          <p className="mt-2 text-3xl font-bold text-blue-600">${summary.averagePurchaseValue.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Average Purchase Frequency</h3>
          <p className="mt-2 text-3xl font-bold text-blue-600">{summary.averagePurchaseFrequency} days</p>
        </div>
      </div>

      {/* Top Selling Items */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Top Selling Items</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {summary.topSellingItems.map((item) => (
                <tr key={item.itemId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.itemName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.totalQuantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.totalRevenue.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Segments */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Customer Segments</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Segment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Spend</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Top Items</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {summary.customerSegments.map((segment) => (
                <tr key={segment.segment}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{segment.segment}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{segment.count}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${segment.averageSpend.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{segment.topItems.join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Individual Customer Analysis */}
      {selectedCustomer && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Customer Analysis</h3>
            <p className="text-sm text-gray-500">UID: {selectedCustomer.uid}</p>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Total Spent</h4>
                <p className="mt-1 text-lg font-semibold text-gray-900">${selectedCustomer.totalSpent.toFixed(2)}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Last Purchase</h4>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {format(new Date(selectedCustomer.lastPurchaseDate), 'MMM d, yyyy')}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Purchase Frequency</h4>
                <p className="mt-1 text-lg font-semibold text-gray-900">{selectedCustomer.purchaseFrequency} days</p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-3">Top Purchases</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Purchase</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedCustomer.topPurchases.map((purchase) => (
                      <tr key={purchase.itemId}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{purchase.itemName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{purchase.totalQuantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {format(new Date(purchase.lastPurchaseDate), 'MMM d, yyyy')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-3">Predicted Next Purchase</h4>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  Predicted date: {format(new Date(selectedCustomer.predictedNextPurchase.predictedDate), 'MMM d, yyyy')}
                </p>
                <div className="mt-2">
                  <p className="text-sm font-medium text-blue-800">Likely to purchase:</p>
                  <ul className="mt-1 space-y-1">
                    {selectedCustomer.predictedNextPurchase.predictedItems.map((item) => (
                      <li key={item.itemId} className="text-sm text-blue-700">
                        {item.itemName} ({(item.confidence * 100).toFixed(1)}% confidence)
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerBehaviorAnalytics; 