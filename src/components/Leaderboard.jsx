import React, { useState } from 'react';
import { Trophy, Medal, Users, Building2 } from 'lucide-react';

export default function Leaderboard() {
    const [activeTab, setActiveTab] = useState('neighborhood');

    const neighborhoodData = [
        { id: 1, name: 'Sarah J.', points: 2450, avatar: 'SJ' },
        { id: 2, name: 'Mike T.', points: 1890, avatar: 'MT' },
        { id: 3, name: 'You', points: 1250, avatar: 'ME', isUser: true },
        { id: 4, name: 'Emma W.', points: 980, avatar: 'EW' },
        { id: 5, name: 'David L.', points: 850, avatar: 'DL' },
    ];

    const corporateData = [
        { id: 1, name: 'TechCorp Inc.', points: 15400, avatar: 'TC' },
        { id: 2, name: 'GreenSystems', points: 12300, avatar: 'GS' },
        { id: 3, name: 'EcoSolutions', points: 9800, avatar: 'ES' },
    ];

    const data = activeTab === 'neighborhood' ? neighborhoodData : corporateData;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-yellow-500" />
                        Leaderboard
                    </h3>
                </div>

                <div className="flex p-1 bg-gray-100 dark:bg-gray-700 rounded-xl">
                    <button
                        onClick={() => setActiveTab('neighborhood')}
                        className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'neighborhood'
                                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                            }`}
                    >
                        <Users className="h-4 w-4 mr-2" />
                        Neighborhood
                    </button>
                    <button
                        onClick={() => setActiveTab('corporate')}
                        className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'corporate'
                                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                            }`}
                    >
                        <Building2 className="h-4 w-4 mr-2" />
                        Corporate
                    </button>
                </div>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {data.map((item, index) => (
                    <div
                        key={item.id}
                        className={`flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${item.isUser ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : ''
                            }`}
                    >
                        <div className="w-8 text-center font-bold text-gray-400 dark:text-gray-500">
                            {index + 1}
                        </div>
                        <div className="flex-1 flex items-center gap-3 ml-2">
                            <div className={`
                w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white
                ${index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-400' : 'bg-emerald-500'}
              `}>
                                {item.avatar}
                            </div>
                            <div>
                                <p className={`font-semibold ${item.isUser ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>
                                    {item.name} {item.isUser && '(You)'}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Level {Math.floor(item.points / 1000) + 1} Recycler</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-gray-900 dark:text-white">{item.points.toLocaleString()}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">pts</p>
                        </div>
                        {index < 3 && (
                            <div className="ml-4">
                                <Medal className={`h-5 w-5 ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-400' : 'text-orange-400'
                                    }`} />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700/30 text-center">
                <button className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300">
                    View Full Rankings
                </button>
            </div>
        </div>
    );
}
