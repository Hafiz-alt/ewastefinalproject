import React, { useState } from 'react';
import { Search, Plus, Package, AlertCircle, TrendingDown, Filter } from 'lucide-react';

export default function PartsInventory() {
    const [searchTerm, setSearchTerm] = useState('');
    const [inventory, setInventory] = useState([
        { id: 1, name: 'iPhone 13 Screen Assembly', sku: 'SCR-IP13-OEM', quantity: 4, minStock: 5, category: 'Screens', price: 120 },
        { id: 2, name: 'Samsung S21 Battery', sku: 'BAT-S21-GEN', quantity: 12, minStock: 8, category: 'Batteries', price: 45 },
        { id: 3, name: 'USB-C Charging Port', sku: 'PRT-USBC-UNI', quantity: 25, minStock: 10, category: 'Ports', price: 15 },
        { id: 4, name: 'Thermal Paste (4g)', sku: 'MSC-THM-4G', quantity: 2, minStock: 3, category: 'Misc', price: 8 },
        { id: 5, name: 'MacBook Air M1 Keyboard', sku: 'KBD-MBA-M1', quantity: 1, minStock: 2, category: 'Keyboards', price: 85 },
    ]);

    const filteredInventory = inventory.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="h-full flex flex-col">
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Parts Inventory</h2>
                    <p className="text-gray-500 text-sm">Manage stock levels and track usage.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-500/20">
                    <Plus className="h-4 w-4" />
                    <span>Add New Part</span>
                </button>
            </div>

            {/* Search & Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
                <div className="lg:col-span-3 bg-white p-1 rounded-xl border border-gray-200 shadow-sm flex items-center">
                    <div className="pl-3 text-gray-400">
                        <Search className="h-5 w-5" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search parts by name or SKU..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-3 bg-transparent border-none focus:ring-0 text-gray-700 placeholder-gray-400"
                    />
                    <button className="p-2 mr-1 text-gray-400 hover:bg-gray-50 rounded-lg">
                        <Filter className="h-5 w-5" />
                    </button>
                </div>

                <div className="bg-red-50 rounded-xl border border-red-100 p-4 flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-lg text-red-600">
                        <TrendingDown className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs text-red-600 font-bold uppercase tracking-wider">Low Stock</p>
                        <p className="text-xl font-bold text-gray-900">
                            {inventory.filter(i => i.quantity <= i.minStock).length} Items
                        </p>
                    </div>
                </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-1">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-200">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Part Details</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock Level</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Unit Price</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredInventory.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                                                <Package className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{item.name}</p>
                                                <p className="text-xs text-gray-500 font-mono">{item.sku}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                            {item.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${item.quantity <= item.minStock ? 'bg-red-500' : 'bg-emerald-500'
                                                        }`}
                                                    style={{ width: `${Math.min((item.quantity / (item.minStock * 2)) * 100, 100)}%` }}
                                                />
                                            </div>
                                            <span className={`text-sm font-medium ${item.quantity <= item.minStock ? 'text-red-600' : 'text-gray-600'}`}>
                                                {item.quantity}
                                            </span>
                                            {item.quantity <= item.minStock && (
                                                <AlertCircle className="h-4 w-4 text-red-500" />
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-gray-900 font-medium">${item.price.toFixed(2)}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">Edit</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
