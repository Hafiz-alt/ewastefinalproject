import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Recycle, Package, ShoppingBag, LogOut } from 'lucide-react';
import ProductGrid from '../components/marketplace/ProductGrid';
import { supabase } from '../lib/supabase';

export default function Marketplace() {
  const location = useLocation();
  const [message, setMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if there's a message in the location state
    if (location.state?.message) {
      setMessage(location.state.message);
      
      // Clear the message after 5 seconds
      const timer = setTimeout(() => {
        setMessage('');
      }, 5000);
      
      return () => clearTimeout(timer);
    }
    
    // Check if user is logged in
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
    };
    
    checkAuth();
  }, [location]);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <Recycle className="h-8 w-8 text-emerald-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">E-Waste Manager</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {isLoggedIn ? (
                <>
                  <Link
                    to="/marketplace/orders"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    My Orders
                  </Link>
                  <Link
                    to="/marketplace/sell"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Sell Item
                  </Link>
                  <Link to="/login" className="text-gray-600 hover:text-gray-900">
                    <LogOut className="h-5 w-5" />
                  </Link>
                </>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700"
                >
                  Sign In to Sell
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {message && (
          <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 rounded-md">
            {message}
          </div>
        )}
        
        <div className="px-4 sm:px-0">
          <h1 className="text-2xl font-bold text-gray-900">Marketplace</h1>
          <p className="mt-1 text-sm text-gray-600">
            Browse refurbished electronics from verified sellers
          </p>
        </div>

        <div className="mt-6">
          <ProductGrid />
        </div>
      </main>
    </div>
  );
}