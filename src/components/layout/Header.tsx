import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useInventory } from '../../contexts/InventoryContext';
import { Store, ShoppingCart, LogOut, User } from 'lucide-react';
import CartSidebar from '../inventory/CartSidebar';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { cart } = useInventory();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCartOpen, setIsCartOpen] = useState(false);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user || location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  return (
    <>
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/inventory" className="flex items-center text-blue-900 hover:text-blue-700">
                <Store size={24} className="mr-2" />
                <span className="text-lg font-semibold">Store Inventory</span>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              {user.isAdmin ? (
                <Link
                  to="/admin"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Admin Dashboard
                </Link>
              ) : (
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative text-gray-600 hover:text-gray-900"
                >
                  <ShoppingCart size={20} />
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </button>
              )}

              <div className="flex items-center space-x-2 text-gray-600">
                <User size={20} />
                <span className="text-sm font-medium">{user.uid}</span>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Header;