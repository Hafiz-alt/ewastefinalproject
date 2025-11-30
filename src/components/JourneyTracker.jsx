import React from 'react';
import { Truck, Factory, Recycle, CheckCircle, MapPin, Package } from 'lucide-react';

export default function JourneyTracker({ pickupId }) {
    // Mock data - in real app, fetch based on pickupId
    const steps = [
        {
            id: 1,
            title: 'Pickup Scheduled',
            description: 'Request received and driver assigned',
            date: '2024-03-10 09:00 AM',
            status: 'completed',
            icon: Package,
            location: 'Your Location'
        },
        {
            id: 2,
            title: 'Collected',
            description: 'Item picked up by eco-logistics partner',
            date: '2024-03-11 02:30 PM',
            status: 'completed',
            icon: Truck,
            location: 'Transit'
        },
        {
            id: 3,
            title: 'Arrived at Facility',
            description: 'Received at certified recycling center',
            date: '2024-03-11 04:45 PM',
            status: 'completed',
            icon: Factory,
            location: 'GreenCycle Hub, Sector 4'
        },
        {
            id: 4,
            title: 'Processing & Sorting',
            description: 'Dismantling and material separation in progress',
            date: '2024-03-12 10:00 AM',
            status: 'current',
            icon: Recycle,
            location: 'Processing Unit B'
        },
        {
            id: 5,
            title: 'Material Recovery',
            description: 'Metals and plastics recovered for reuse',
            date: 'Estimated: 2024-03-13',
            status: 'pending',
            icon: CheckCircle,
            location: 'Recovery Zone'
        }
    ];

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">E-Waste Journey</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Tracking ID: #EW-{pickupId || 'DEMO'}</p>
                </div>
                <div className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-bold uppercase tracking-wide">
                    In Progress
                </div>
            </div>

            <div className="relative">
                {/* Vertical Line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>

                <div className="space-y-8">
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        const isCompleted = step.status === 'completed';
                        const isCurrent = step.status === 'current';

                        return (
                            <div key={step.id} className="relative flex gap-6 group">
                                {/* Icon Bubble */}
                                <div className={`
                  relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-4 transition-all duration-300
                  ${isCompleted
                                        ? 'bg-emerald-500 border-emerald-100 dark:border-emerald-900 text-white'
                                        : isCurrent
                                            ? 'bg-white dark:bg-gray-800 border-emerald-500 text-emerald-500 shadow-lg shadow-emerald-500/20'
                                            : 'bg-gray-100 dark:bg-gray-700 border-white dark:border-gray-800 text-gray-400'
                                    }
                `}>
                                    <Icon className="h-5 w-5" />
                                </div>

                                {/* Content */}
                                <div className={`flex-1 pt-1 ${isCurrent ? 'opacity-100' : isCompleted ? 'opacity-80' : 'opacity-50'}`}>
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                                        <h4 className={`text-base font-bold ${isCurrent ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>
                                            {step.title}
                                        </h4>
                                        <span className="text-xs font-medium text-gray-400 dark:text-gray-500 flex items-center bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-md">
                                            {step.date}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{step.description}</p>
                                    <div className="flex items-center mt-2 text-xs text-gray-400 dark:text-gray-500">
                                        <MapPin className="h-3 w-3 mr-1" />
                                        {step.location}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
