import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Recycle, Package, ShoppingBag, LogOut, Gavel, Repeat, Filter, CheckCircle } from 'lucide-react';
import ProductGrid from '../components/marketplace/ProductGrid';
import { supabase } from '../lib/supabase';
import { useTheme } from '../context/ThemeContext';

export default function Marketplace() {
  const location = useLocation();
  const { theme } = useTheme();
  const [message, setMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('buy');
  const [showRefurbishedOnly, setShowRefurbishedOnly] = useState(false);

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <Recycle className="h-8 w-8 text-emerald-600" />
                <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">E-Waste Manager</span>
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

        <div className="px-4 sm:px-0 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Marketplace</h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Browse refurbished electronics, swap items, or bid on vintage tech
              </p>
            </div>

            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTab('buy')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'buy'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
              >
                <ShoppingBag className="h-4 w-4 inline-block mr-2" />
                Buy
              </button>
              <button
                onClick={() => setActiveTab('swap')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'swap'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
              >
                <Repeat className="h-4 w-4 inline-block mr-2" />
                Swap
              </button>
              <button
                onClick={() => setActiveTab('auction')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'auction'
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
              >
                <Gavel className="h-4 w-4 inline-block mr-2" />
                Auction
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-6 flex items-center gap-4">
            <button
              onClick={() => setShowRefurbishedOnly(!showRefurbishedOnly)}
              className={`flex items-center px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${showRefurbishedOnly
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400'
                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300'
                }`}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Verified Refurbished
            </button>
            <button className="flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-white border border-gray-200 text-gray-600 hover:border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 transition-all">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </button>
          </div>
        </div>

        <div className="mt-6">
          <ProductGrid type={activeTab} refurbishedOnly={showRefurbishedOnly} />
        </div>
      </main>
    </div>
  );
}