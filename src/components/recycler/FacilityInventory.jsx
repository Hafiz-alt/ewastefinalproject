import React, { useState } from 'react';
import { Package, ArrowRight, Layers, Database, AlertTriangle } from 'lucide-react';

export default function FacilityInventory() {
    const [activeTab, setActiveTab] = useState('processing');

    // Mock Data for Kanban Board
    const stages = {
        received: [
            { id: 101, item: 'Batch #2024-001', type: 'Mixed Electronics', weight: '150kg', date: '2024-03-10' },
            { id: 102, item: 'Batch #2024-003', type: 'Laptops', weight: '45kg', date: '2024-03-11' },
        ],
        dismantling: [
            { id: 103, item: 'Batch #2024-002', type: 'Smartphones', weight: '12kg', date: '2024-03-09' },
        ],
        sorting: [
            { id: 104, item: 'Batch #2023-099', type: 'Cables', weight: '200kg', date: '2024-03-08' },
        ],
        refined: [
            { id: 105, item: 'Batch #2023-098', type: 'PCBs', weight: '30kg', date: '2024-03-07' },
        ]
    };

    // Mock Data for Recovered Materials
    const materials = [
        { id: 1, name: 'Gold', stock: '0.5 kg', value: '$32,000', trend: '+2%' },
        { id: 2, name: 'Copper', stock: '500 kg', value: '$4,500', trend: '-1%' },
        { id: 3, name: 'Aluminum', stock: '1,200 kg', value: '$2,800', trend: '+5%' },
        { id: 4, name: 'Plastic (ABS)', stock: '3,000 kg', value: '$1,500', trend: '0%' },
        { id: 5, name: 'Rare Earths', stock: '2.1 kg', value: '$8,400', trend: '+12%' },
    ];

    return (
        <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700">
                <button
                    onClick={() => setActiveTab('processing')}
                    className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === 'processing'
                            ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                        }`}
                >
                    Processing Stages
                </button>
                <button
                    onClick={() => setActiveTab('materials')}
                    className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === 'materials'
                            ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                        }`}
                >
                    Recovered Materials
                </button>
            </div>

            {/* Content */}
            {activeTab === 'processing' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto pb-4">
                    {Object.entries(stages).map(([stage, items]) => (
                        <div key={stage} className="min-w-[250px] bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-gray-700 dark:text-gray-200 capitalize">{stage}</h3>
                                <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded-full">
                                    {items.length}
                                </span>
                            </div>
                            <div className="space-y-3">
                                {items.map(item => (
                                    <div key={item.id} className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 cursor-move hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{item.item}</span>
                                            <span className="text-[10px] text-gray-400">{item.date}</span>
                                        </div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">{item.type}</p>
                                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                            <Database className="h-3 w-3 mr-1" />
                                            {item.weight}
                                        </div>
                                    </div>
                                ))}
                                <button className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 text-sm hover:border-emerald-500 hover:text-emerald-500 transition-colors">
                                    + Add Batch
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Material</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stock Level</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Est. Value</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Market Trend</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {materials.map((material) => (
                                <tr key={material.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                                                {material.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <span className="ml-3 font-medium text-gray-900 dark:text-white">{material.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {material.stock}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                                        {material.value}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${material.trend.startsWith('+')
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                : material.trend.startsWith('-')
                                                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                            }`}>
                                            {material.trend}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button className="text-emerald-600 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-300">Sell</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
