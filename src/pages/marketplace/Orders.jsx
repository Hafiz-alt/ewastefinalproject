import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Recycle, Package, LogOut } from 'lucide-react';
import OrderList from '../../components/marketplace/OrderList';

export default function Orders() {
  const [activeTab, setActiveTab] = useState('purchases');

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link to="/marketplace" className="flex items-center">
                <Recycle className="h-8 w-8 text-emerald-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">E-Waste Manager</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
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
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your purchases and sales
          </p>
        </div>

        <div className="mt-6">
          <div className="sm:hidden">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
            >
              <option value="purchases">My Purchases</option>
              <option value="sales">My Sales</option>
            </select>
          </div>

          <div className="hidden sm:block">
            <nav className="flex space-x-4 mb-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('purchases')}
                className={`${
                  activeTab === 'purchases'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'text-gray-500 hover:text-gray-700'
                } px-3 py-2 font-medium text-sm rounded-md`}
              >
                My Purchases
              </button>
              <button
                onClick={() => setActiveTab('sales')}
                className={`${
                  activeTab === 'sales'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'text-gray-500 hover:text-gray-700'
                } px-3 py-2 font-medium text-sm rounded-md`}
              >
                My Sales
              </button>
            </nav>
          </div>

          <OrderList type={activeTab === 'purchases' ? 'buyer' : 'seller'} />
        </div>
      </main>
    </div>
  );
}