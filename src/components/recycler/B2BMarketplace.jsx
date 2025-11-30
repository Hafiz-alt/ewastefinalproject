import React from 'react';
import { Package, DollarSign, Briefcase, Plus } from 'lucide-react';

export default function B2BMarketplace() {
    const listings = [
        { id: 1, title: 'Bulk Copper Wire (High Grade)', quantity: '500 kg', price: '$4,500', buyer: 'TechMetals Inc.', status: 'Active' },
        { id: 2, title: 'Sorted PCB Boards (Motherboards)', quantity: '1000 units', price: '$12,000', buyer: '-', status: 'Pending' },
        { id: 3, title: 'Recycled ABS Plastic Pellets', quantity: '2 Tons', price: '$3,200', buyer: 'EcoPlast', status: 'Sold' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-gradient-to-r from-blue-600 to-indigo-600 p-8 rounded-2xl text-white shadow-lg">
                <div>
                    <h2 className="text-2xl font-bold mb-2">B2B Material Exchange</h2>
                    <p className="text-blue-100 max-w-xl">
                        Connect directly with refineries and manufacturers to sell your recovered materials in bulk.
                    </p>
                </div>
                <button className="px-6 py-3 bg-white text-blue-600 rounded-xl font-bold shadow-lg hover:bg-blue-50 transition-colors flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Create Listing
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {listings.map(listing => (
                    <div key={listing.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className={`px-2 py-1 text-xs font-bold rounded-full ${listing.status === 'Active' ? 'bg-green-100 text-green-700' :
                                    listing.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-gray-100 text-gray-700'
                                }`}>
                                {listing.status}
                            </span>
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{listing.title}</h3>

                        <div className="space-y-2 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 dark:text-gray-400">Quantity:</span>
                                <span className="font-medium text-gray-900 dark:text-white">{listing.quantity}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 dark:text-gray-400">Asking Price:</span>
                                <span className="font-bold text-emerald-600 dark:text-emerald-400">{listing.price}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 dark:text-gray-400">Buyer:</span>
                                <span className="font-medium text-gray-900 dark:text-white">{listing.buyer}</span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button className="flex-1 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                                Edit
                            </button>
                            <button className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                                View Offers
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
