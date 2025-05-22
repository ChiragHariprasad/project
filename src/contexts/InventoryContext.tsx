import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { InventoryItem, CartItem, RecommendedItem } from '../types';
import sampleInventory from '../data/sampleInventory';

const API_URL = 'http://localhost:5000/api';

interface InventoryContextType {
  inventory: InventoryItem[];
  cart: CartItem[];
  recommendations: RecommendedItem[];
  isLoadingRecommendations: boolean;
  refreshRecommendations: () => void;
  addToCart: (item: InventoryItem, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  updateCartItemQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  checkout: () => void;
  addInventoryItem: (item: InventoryItem) => void;
  updateInventoryItem: (item: InventoryItem) => void;
  deleteInventoryItem: (itemId: string) => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendedItem[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState<boolean>(false);

  // Load inventory from API
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await axios.get(`${API_URL}/inventory`);
        if (response.data && Array.isArray(response.data)) {
          setInventory(response.data);
        } else {
          // Fallback to sample data if API fails
          setInventory(sampleInventory);
        }
      } catch (error) {
        console.error('Error fetching inventory:', error);
        // Use sample data if API fails
        setInventory(sampleInventory);
      }
    };

    fetchInventory();

    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
    
    // Fetch recommendations
    fetchRecommendations();
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // We don't save inventory to localStorage anymore as it's stored in the database
  
  // Fetch personalized recommendations
  const fetchRecommendations = async () => {
    try {
      setIsLoadingRecommendations(true);
      const token = localStorage.getItem('token');
      
      if (!token) return;
      
      const response = await axios.get(`${API_URL}/recommendations/user`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data && response.data.success) {
        setRecommendations(response.data.recommendations);
      }
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  const addToCart = (item: InventoryItem, quantity: number) => {
    // Prevent adding out-of-stock items
    if (item.stock <= 0) {
      console.warn('Attempted to add out-of-stock item to cart:', item.name);
      alert(`Sorry, "${item.name}" is out of stock.`);
      return;
    }
    
    // Check if attempting to add more than available stock
    if (quantity > item.stock) {
      console.warn(`Attempted to add ${quantity} of ${item.name}, but only ${item.stock} in stock`);
      quantity = item.stock;
    }
    
    const itemId = item._id || item.id;
    const existingCartItem = cart.find(cartItem => 
      (cartItem.item._id && cartItem.item._id === itemId) || 
      (cartItem.item.id === itemId)
    );
    
    if (existingCartItem) {
      // Check if total quantity would exceed stock
      const newQuantity = existingCartItem.quantity + quantity;
      // Check if stock limits are reached
          if (newQuantity > item.stock) {
            console.warn(`Cannot add ${quantity} more of ${item.name}, would exceed stock`);
            setCart(cart.map(cartItem => 
              (cartItem.item._id && cartItem.item._id === itemId) || 
              (cartItem.item.id === itemId)
                ? { ...cartItem, quantity: item.stock } 
                : cartItem
            ));
            alert(`Only ${item.stock} of "${item.name}" are available.`);
            return;
          }
      
          // Refresh recommendations after adding items
          setTimeout(() => fetchRecommendations(), 1000);
      
      setCart(cart.map(cartItem => 
        (cartItem.item._id && cartItem.item._id === itemId) || 
        (cartItem.item.id === itemId)
          ? { ...cartItem, quantity: cartItem.quantity + quantity } 
          : cartItem
      ));
    } else {
      setCart([...cart, { item, quantity }]);
    }
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(cartItem => 
      (cartItem.item._id !== itemId) && (cartItem.item.id !== itemId)
    ));
  };

  const updateCartItemQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    // Find the cart item and corresponding inventory item
    const cartItem = cart.find(item => 
      (item.item._id && item.item._id === itemId) || 
      (item.item.id === itemId)
    );
    
    if (!cartItem) return;
    
    // Find the current inventory status of this item
    const inventoryItem = inventory.find(item => 
      (item._id && item._id === itemId) || 
      (item.id === itemId)
    );
    
    // If we have the inventory item, check if the requested quantity exceeds stock
    if (inventoryItem && quantity > inventoryItem.stock) {
      console.warn(`Attempted to set quantity to ${quantity}, but only ${inventoryItem.stock} in stock`);
      
      if (inventoryItem.stock <= 0) {
        // If completely out of stock, remove from cart
        removeFromCart(itemId);
        alert(`Sorry, "${inventoryItem.name}" is now out of stock and has been removed from your cart.`);
      } else {
        // Otherwise, set to maximum available
        setCart(cart.map(item => 
          (item.item._id && item.item._id === itemId) || 
          (item.item.id === itemId)
            ? { ...item, quantity: inventoryItem.stock } 
            : item
        ));
        alert(`Only ${inventoryItem.stock} of "${inventoryItem.name}" are available.`);
      }
      return;
    }
    
    // If there's no inventory check or quantity is valid, update normally
    setCart(cart.map(item => 
      (item.item._id && item.item._id === itemId) || 
      (item.item.id === itemId)
        ? { ...item, quantity } 
        : item
    ));
  };

  const clearCart = () => {
    setCart([]);
  };

  const checkout = async () => {
    try {
      console.log('Starting checkout with cart:', cart);
      
      // Verify stock levels before checkout
      const stockCheck = await axios.get(`${API_URL}/inventory`);
      if (stockCheck.data && Array.isArray(stockCheck.data)) {
        const currentInventory = stockCheck.data;
        const outOfStockItems = [];
        
        // Check each cart item against current inventory
        for (const cartItem of cart) {
          const itemId = cartItem.item._id || cartItem.item.id;
          const inventoryItem = currentInventory.find(item => 
            (item._id && item._id === itemId) || 
            (item.id === itemId)
          );
          
          if (!inventoryItem || inventoryItem.stock < cartItem.quantity) {
            outOfStockItems.push({
              name: cartItem.item.name,
              requested: cartItem.quantity,
              available: inventoryItem ? inventoryItem.stock : 0
            });
          }
        }
        
        // If any items are out of stock, alert the user and cancel checkout
        if (outOfStockItems.length > 0) {
          const message = outOfStockItems.map(item => 
            `${item.name}: Requested ${item.requested}, but only ${item.available} available`
          ).join('\n');
          
          alert(`Some items in your cart are no longer available:\n\n${message}`);
          
          // Update inventory and remove out-of-stock items from cart
          setInventory(currentInventory);
          
          // Filter out completely out-of-stock items
          const updatedCart = cart.filter(cartItem => {
            const itemId = cartItem.item._id || cartItem.item.id;
            const inventoryItem = currentInventory.find(item => 
              (item._id && item._id === itemId) || 
              (item.id === itemId)
            );
            return inventoryItem && inventoryItem.stock > 0;
          });
          
          // Update quantities for remaining items
          const adjustedCart = updatedCart.map(cartItem => {
            const itemId = cartItem.item._id || cartItem.item.id;
            const inventoryItem = currentInventory.find(item => 
              (item._id && item._id === itemId) || 
              (item.id === itemId)
            );
            
            return {
              ...cartItem,
              quantity: Math.min(cartItem.quantity, inventoryItem ? inventoryItem.stock : 0)
            };
          });
          
          setCart(adjustedCart);
          return;
        }
      }
      
      // Format cart items for the API
      const checkoutItems = cart.map(cartItem => ({
        id: cartItem.item._id || cartItem.item.id, // Use Mongo _id if available
        quantity: cartItem.quantity
      }));
      
      console.log('Sending checkout items to API:', checkoutItems);
      
      // Call the checkout API endpoint
      const checkoutResponse = await axios.put(`${API_URL}/inventory/checkout`, {
        items: checkoutItems
      });
      
      console.log('Checkout response:', checkoutResponse.data);
      
      // Refresh inventory after checkout
      const response = await axios.get(`${API_URL}/inventory`);
      if (response.data && Array.isArray(response.data)) {
        setInventory(response.data);
      }
      
      clearCart();
      
      // Record purchase for recommendation engine
      try {
        await axios.post(`${API_URL}/recommendations/record-purchase`, {
          items: checkoutItems,
          totalAmount: cart.reduce((sum, item) => sum + (item.item.price * item.quantity), 0)
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        // Refresh recommendations after purchase
        await fetchRecommendations();
      } catch (err) {
        console.error('Failed to record purchase for recommendations:', err);
      }
      
      alert('Checkout successful!');
    } catch (error: any) {
      console.error('Checkout failed:', error);
      const errorMessage = error.response?.data?.message || 'Unknown error';
      alert(`Checkout failed: ${errorMessage}. Please try again.`);
    }
  };

  const addInventoryItem = async (item: InventoryItem) => {
    try {
      const response = await axios.post(`${API_URL}/inventory`, item);
      if (response.data) {
        setInventory([...inventory, response.data]);
      }
    } catch (error) {
      console.error('Failed to add inventory item:', error);
    }
  };

  const updateInventoryItem = async (updatedItem: InventoryItem) => {
    try {
      console.log('Updating item:', updatedItem);
      
      // Ensure we're using the MongoDB _id
      const itemId = updatedItem._id || updatedItem.id; 
      
      // Format the data for the API
      const itemData = {
        name: updatedItem.name,
        description: updatedItem.description,
        price: Number(updatedItem.price),
        stock: Number(updatedItem.stock),
        image: updatedItem.image,
        category: updatedItem.category,
        nextRestock: updatedItem.nextRestock
      };
      
      console.log('Sending data to API:', itemData);
      
      const response = await axios.put(`${API_URL}/inventory/${itemId}`, itemData);
      console.log('API response:', response.data);
      
      if (response.data) {
        // Update inventory state
        setInventory(inventory.map(item => 
          (item._id || item.id) === (updatedItem._id || updatedItem.id) ? response.data : item
        ));
        
        // Also update any references in the cart
        setCart(cart.map(cartItem => {
          const cartItemId = cartItem.item._id || cartItem.item.id;
          if (cartItemId === itemId) {
            return { ...cartItem, item: response.data };
          }
          return cartItem;
        }));
      }
    } catch (error: any) {
      console.error('Failed to update inventory item:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update item';
      alert(`Error: ${errorMessage}. Please try again.`);
    }
  };

  const deleteInventoryItem = async (itemId: string) => {
    try {
      await axios.delete(`${API_URL}/inventory/${itemId}`);
      setInventory(inventory.filter(item => (item._id || item.id) !== itemId));
      
      // Also remove any references from the cart
      setCart(cart.filter(cartItem => 
        (cartItem.item._id !== itemId) && (cartItem.item.id !== itemId)
      ));
    } catch (error) {
      console.error('Failed to delete inventory item:', error);
      alert('Failed to delete item. Please try again.');
    }
  };

  return (
    <InventoryContext.Provider value={{
      inventory,
      cart,
      recommendations,
      isLoadingRecommendations,
      refreshRecommendations: fetchRecommendations,
      addToCart,
      removeFromCart,
      updateCartItemQuantity,
      clearCart,
      checkout,
      addInventoryItem,
      updateInventoryItem,
      deleteInventoryItem
    }}>
      {children}
    </InventoryContext.Provider>
  );
};