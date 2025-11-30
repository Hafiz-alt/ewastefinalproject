import React from 'react';
import { Truck, PenTool, AlertCircle, CheckCircle, Calendar } from 'lucide-react';

export default function FleetManager() {
    const vehicles = [
        { id: 1, name: 'Truck 01', type: 'Heavy Duty', status: 'available', fuel: 85, mileage: 12500, nextService: '2025-04-15' },
        { id: 2, name: 'Van 03', type: 'Light Cargo', status: 'on_route', fuel: 45, mileage: 8900, nextService: '2025-03-20' },
        { id: 3, name: 'Truck 02', type: 'Heavy Duty', status: 'maintenance', fuel: 0, mileage: 15600, nextService: '2025-03-01' },
        { id: 4, name: 'Van 01', type: 'Light Cargo', status: 'available', fuel: 92, mileage: 5400, nextService: '2025-05-10' },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Fleet</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">4 Vehicles</p>
                        </div>
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <Truck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Active Now</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">1 Vehicle</p>
                        </div>
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <Navigation className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Maintenance</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">1 Vehicle</p>
                        </div>
                        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                            <PenTool className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Vehicle Status</h3>
                    <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors">
                        Add Vehicle
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Vehicle</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fuel Level</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Next Service</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {vehicles.map((vehicle) => (
                                <tr key={vehicle.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                                <Truck className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">{vehicle.name}</div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">{vehicle.type}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${vehicle.status === 'available' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                vehicle.status === 'on_route' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                                    'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                                            }`}>
                                            {vehicle.status === 'available' ? 'Available' :
                                                vehicle.status === 'on_route' ? 'On Route' : 'Maintenance'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="w-full max-w-[100px] bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                            <div
                                                className={`h-2.5 rounded-full ${vehicle.fuel > 50 ? 'bg-green-500' : vehicle.fuel > 20 ? 'bg-yellow-500' : 'bg-red-500'
                                                    }`}
                                                style={{ width: `${vehicle.fuel}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 inline-block">{vehicle.fuel}%</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        <div className="flex items-center">
                                            <Calendar className="h-4 w-4 mr-2" />
                                            {vehicle.nextService}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button className="text-emerald-600 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-300 mr-4">Edit</button>
                                        <button className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300">History</button>
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

function Navigation(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polygon points="3 11 22 2 13 21 11 13 3 11" />
        </svg>
    )
}
