import React from 'react';
import { PieChart, TrendingUp, DollarSign, Leaf } from 'lucide-react';

export default function RecyclerAnalytics() {
    return (
        <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-white/20 p-2 rounded-lg">
                            <DollarSign className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-emerald-100 text-sm font-medium">+12.5% vs last month</span>
                    </div>
                    <h3 className="text-3xl font-bold mb-1">$42,500</h3>
                    <p className="text-emerald-100 text-sm">Total Revenue (This Month)</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                            <Leaf className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-green-500 text-sm font-medium">+8% vs last month</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">12.8 Tons</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Total Waste Processed</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-lg">
                            <TrendingUp className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                        </div>
                        <span className="text-green-500 text-sm font-medium">+5% Efficiency</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">94%</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Recovery Rate</p>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Waste Composition Chart (Simulated) */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <PieChart className="h-5 w-5 text-gray-500" />
                        Waste Composition
                    </h3>
                    <div className="flex items-center justify-center h-64 relative">
                        {/* Simple CSS Pie Chart Simulation */}
                        <div className="w-48 h-48 rounded-full bg-[conic-gradient(var(--color-1)_0_30%,var(--color-2)_30%_55%,var(--color-3)_55%_80%,var(--color-4)_80%_100%)]"
                            style={{
                                '--color-1': '#10b981', // Emerald
                                '--color-2': '#3b82f6', // Blue
                                '--color-3': '#f59e0b', // Amber
                                '--color-4': '#6366f1'  // Indigo
                            }}
                        ></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-32 h-32 bg-white dark:bg-gray-800 rounded-full flex flex-col items-center justify-center">
                                <span className="text-2xl font-bold text-gray-900 dark:text-white">Total</span>
                                <span className="text-xs text-gray-500">100%</span>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                            <span className="text-sm text-gray-600 dark:text-gray-300">Laptops (30%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            <span className="text-sm text-gray-600 dark:text-gray-300">Phones (25%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                            <span className="text-sm text-gray-600 dark:text-gray-300">Accessories (25%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                            <span className="text-sm text-gray-600 dark:text-gray-300">Other (20%)</span>
                        </div>
                    </div>
                </div>

                {/* Revenue Trend (Simulated Bar Chart) */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-gray-500" />
                        Revenue Trend
                    </h3>
                    <div className="h-64 flex items-end justify-between gap-2 px-2">
                        {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                            <div key={i} className="w-full bg-emerald-100 dark:bg-emerald-900/20 rounded-t-lg relative group">
                                <div
                                    className="absolute bottom-0 left-0 right-0 bg-emerald-500 rounded-t-lg transition-all duration-500 group-hover:bg-emerald-400"
                                    style={{ height: `${h}%` }}
                                ></div>
                                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                    ${h * 100}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>Mon</span>
                        <span>Tue</span>
                        <span>Wed</span>
                        <span>Thu</span>
                        <span>Fri</span>
                        <span>Sat</span>
                        <span>Sun</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
