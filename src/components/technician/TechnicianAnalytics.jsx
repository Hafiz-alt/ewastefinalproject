import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    AreaChart,
    Area
} from 'recharts';
import { TrendingUp, Clock, CheckCircle, DollarSign } from 'lucide-react';

const weeklyData = [
    { name: 'Mon', repairs: 4, revenue: 240 },
    { name: 'Tue', repairs: 6, revenue: 380 },
    { name: 'Wed', repairs: 3, revenue: 150 },
    { name: 'Thu', repairs: 8, revenue: 520 },
    { name: 'Fri', repairs: 5, revenue: 310 },
    { name: 'Sat', repairs: 2, revenue: 120 },
    { name: 'Sun', repairs: 1, revenue: 60 },
];

const efficiencyData = [
    { name: 'Week 1', avgTime: 45 },
    { name: 'Week 2', avgTime: 42 },
    { name: 'Week 3', avgTime: 38 },
    { name: 'Week 4', avgTime: 35 },
];

export default function TechnicianAnalytics() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-2">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Performance Analytics</h2>
                    <p className="text-gray-500 text-sm">Track your efficiency and revenue generation.</p>
                </div>
                <select className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2.5">
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                    <option>This Year</option>
                </select>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase">Total Revenue</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">$1,780</h3>
                        </div>
                        <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                            <DollarSign className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-xs text-emerald-600 font-medium">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        <span>+12.5% from last week</span>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase">Repairs Completed</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">29</h3>
                        </div>
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                            <CheckCircle className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-xs text-blue-600 font-medium">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        <span>+4 new today</span>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase">Avg. Repair Time</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">38m</h3>
                        </div>
                        <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                            <Clock className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-xs text-emerald-600 font-medium">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        <span>-5m faster than avg</span>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase">Success Rate</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">98.5%</h3>
                        </div>
                        <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                            <CheckCircle className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-xs text-gray-500 font-medium">
                        <span>Top 5% of technicians</span>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Weekly Revenue</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={weeklyData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Repair Efficiency Trend</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={efficiencyData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Line type="monotone" dataKey="avgTime" stroke="#8B5CF6" strokeWidth={3} dot={{ r: 4, fill: '#8B5CF6', strokeWidth: 2, stroke: '#fff' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
