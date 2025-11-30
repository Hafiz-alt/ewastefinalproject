import React, { useState } from 'react';
import { MapPin, Navigation, User, Clock, CheckCircle } from 'lucide-react';
import Map from '../Map'; // Reusing existing Map component

export default function RouteOptimizer() {
    const [optimizing, setOptimizing] = useState(false);
    const [routeCalculated, setRouteCalculated] = useState(false);

    const drivers = [
        { id: 1, name: 'John D.', status: 'Available', vehicle: 'Van 01' },
        { id: 2, name: 'Mike R.', status: 'On Route', vehicle: 'Truck 03' },
    ];

    const stops = [
        { id: 1, address: '123 Green St', items: '2 Laptops', priority: 'High' },
        { id: 2, address: '45 Tech Park', items: '50kg E-Waste', priority: 'Medium' },
        { id: 3, address: '89 Eco Lane', items: '1 Printer', priority: 'Low' },
    ];

    const handleOptimize = () => {
        setOptimizing(true);
        setTimeout(() => {
            setOptimizing(false);
            setRouteCalculated(true);
        }, 2000);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
            {/* Sidebar Controls */}
            <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Navigation className="h-5 w-5 text-emerald-500" />
                    Route Planner
                </h3>

                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                    <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Pending Stops ({stops.length})</h4>
                        {stops.map((stop, index) => (
                            <div key={stop.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700 mb-2">
                                <div className="flex items-start gap-3">
                                    <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{stop.address}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{stop.items}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Assign Driver</h4>
                        <select className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm">
                            <option>Select a driver...</option>
                            {drivers.map(d => (
                                <option key={d.id} value={d.id}>{d.name} ({d.status})</option>
                            ))}
                        </select>
                    </div>
                </div>

                <button
                    onClick={handleOptimize}
                    disabled={optimizing || routeCalculated}
                    className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all ${routeCalculated
                            ? 'bg-green-500 hover:bg-green-600 shadow-green-500/30'
                            : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/30'
                        }`}
                >
                    {optimizing ? 'Calculating Best Route...' : routeCalculated ? 'Route Optimized!' : 'Optimize Route'}
                </button>
            </div>

            {/* Map View */}
            <div className="lg:col-span-2 bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden relative border border-gray-200 dark:border-gray-700">
                <Map />

                {routeCalculated && (
                    <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 max-w-xs animate-fade-in">
                        <div className="flex items-center gap-2 mb-2 text-emerald-600 dark:text-emerald-400 font-bold">
                            <CheckCircle className="h-5 w-5" />
                            <span>Optimization Complete</span>
                        </div>
                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                            <div className="flex justify-between">
                                <span>Est. Time:</span>
                                <span className="font-medium">1h 45m</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Distance:</span>
                                <span className="font-medium">12.5 km</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Fuel Saved:</span>
                                <span className="font-medium text-green-500">~1.2 L</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
