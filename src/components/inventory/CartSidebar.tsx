import React from 'react';
import { useInventory } from '../../contexts/InventoryContext';
import { X, Trash2, ShoppingBag } from 'lucide-react';
import Button from '../ui/Button';
import { formatCurrency } from '../../utils/formatters';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, updateCartItemQuantity, checkout } = useInventory();
  
  const total = cart.reduce((sum, item) => sum + (item.item.price * item.quantity), 0);
  
  const handleCheckout = async () => {
    try {
      await checkout();
      onClose();
    } catch (error) {
      console.error('Checkout error:', error);
      // Keep the cart open if there's an error
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />
        
        <div className="fixed inset-y-0 right-0 max-w-full flex">
          <div className="w-screen max-w-md">
            <div className="h-full flex flex-col bg-white shadow-xl overflow-y-scroll">
              <div className="flex-1 py-6 overflow-y-auto px-4 sm:px-6">
                <div className="flex items-start justify-between">
                  <h2 className="text-lg font-medium text-gray-900">Shopping Cart</h2>
                  <div className="ml-3 h-7 flex items-center">
                    <button
                      type="button"
                      className="-m-2 p-2 text-gray-400 hover:text-gray-500"
                      onClick={onClose}
                    >
                      <span className="sr-only">Close panel</span>
                      <X size={20} aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <div className="mt-8">
                  {cart.length === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingBag size={48} className="mx-auto text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">Your cart is empty</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Start shopping to add items to your cart
                      </p>
                      <div className="mt-6">
                        <Button onClick={onClose} variant="primary">
                          Continue Shopping
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flow-root">
                      <ul className="-my-6 divide-y divide-gray-200">
                        {cart.map((cartItem) => (
                          <li key={cartItem.item._id || cartItem.item.id} className="py-6 flex">
                            <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                              <img
                                src={cartItem.item.image}
                                alt={cartItem.item.name}
                                className="h-full w-full object-cover object-center"
                              />
                            </div>

                            <div className="ml-4 flex-1 flex flex-col">
                              <div>
                                <div className="flex justify-between text-base font-medium text-gray-900">
                                  <h3>{cartItem.item.name}</h3>
                                  <p className="ml-4">{formatCurrency(cartItem.item.price)}</p>
                                </div>
                                <p className="mt-1 text-sm text-gray-500">{cartItem.item.category}</p>
                              </div>
                              
                              <div className="flex-1 flex items-end justify-between text-sm">
                                <div className="flex items-center space-x-3">
                                  <button 
                                    className="p-1 border rounded"
                                    onClick={() => {
                                      const itemId = cartItem.item._id || cartItem.item.id;
                                      console.log(`Decreasing quantity for item: ${itemId}`);
                                      updateCartItemQuantity(itemId, cartItem.quantity - 1);
                                    }}
                                  >
                                    -
                                  </button>
                                  <span className="text-gray-500">Qty {cartItem.quantity}</span>
                                  <button 
                                    className="p-1 border rounded"
                                    onClick={() => {
                                      const itemId = cartItem.item._id || cartItem.item.id;
                                      console.log(`Increasing quantity for item: ${itemId}`);
                                      updateCartItemQuantity(itemId, cartItem.quantity + 1);
                                    }}
                                  >
                                    +
                                  </button>
                                </div>

                                <div className="flex">
                                  <button
                                    type="button"
                                    className="font-medium text-red-600 hover:text-red-500"
                                    onClick={() => {
                                      const itemId = cartItem.item._id || cartItem.item.id;
                                      console.log(`Removing item from cart: ${itemId}`);
                                      removeFromCart(itemId);
                                    }}
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              
              {cart.length > 0 && (
                <div className="border-t border-gray-200 py-6 px-4 sm:px-6">
                  <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
                    <p>Subtotal</p>
                    <p>{formatCurrency(total)}</p>
                  </div>
                  <p className="mt-0.5 text-sm text-gray-500 mb-6">
                    Shipping and taxes calculated at checkout.
                  </p>
                  <Button onClick={handleCheckout} variant="primary" fullWidth>
                    Checkout
                  </Button>
                  <div className="mt-6 flex justify-center text-sm text-center text-gray-500">
                    <p>
                      or{' '}
                      <button
                        type="button"
                        className="text-blue-800 font-medium hover:text-blue-900"
                        onClick={onClose}
                      >
                        Continue Shopping
                        <span aria-hidden="true"> &rarr;</span>
                      </button>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartSidebar;