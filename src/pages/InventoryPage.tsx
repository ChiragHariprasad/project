import React, { useState } from 'react';
import InventoryList from '../components/inventory/InventoryList';
import UserRecommendations from '../components/recommendations/UserRecommendations';
import { useInventory } from '../contexts/InventoryContext';

const InventoryPage: React.FC = () => {
  const { recommendations, isLoadingRecommendations } = useInventory();
  
  return (
    <div className="max-w-7xl mx-auto">
      {(recommendations.length > 0 || isLoadingRecommendations) && (
        <UserRecommendations />
      )}
      <InventoryList />
    </div>
  );
};

export default InventoryPage;