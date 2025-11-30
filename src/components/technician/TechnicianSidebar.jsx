import React from 'react';
import {
    LayoutDashboard,
    ClipboardList,
    Stethoscope,
    Package,
    BarChart2,
    LogOut,
    Settings,
    User
} from 'lucide-react';

export default function TechnicianSidebar({ activeTab, setActiveTab, onLogout, technicianName }) {
    const menuItems = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'kanban', label: 'Repair Board', icon: ClipboardList },
        { id: 'diagnostics', label: 'AI Diagnostics', icon: Stethoscope },
        { id: 'inventory', label: 'Parts Inventory', icon: Package },
        { id: 'analytics', label: 'Performance', icon: BarChart2 },
    ];

    return (
        <div className="h-screen w-64 bg-white/80 backdrop-blur-xl border-r border-white/20 shadow-xl flex flex-col fixed left-0 top-0 z-50 transition-all duration-300">
            {/* Header */}
            <div className="p-6 border-b border-gray-100/50">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <Stethoscope className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-gray-800 text-lg tracking-tight">TechHub</h1>
                        <p className="text-xs text-gray-500 font-medium">Pro Workspace</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                    ? 'bg-emerald-50 text-emerald-600 shadow-sm ring-1 ring-emerald-100'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <Icon className={`h-5 w-5 transition-colors ${isActive ? 'text-emerald-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                            <span className="font-medium text-sm">{item.label}</span>
                            {isActive && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm" />
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* User Profile & Logout */}
            <div className="p-4 border-t border-gray-100/50 bg-gray-50/50">
                <div className="flex items-center gap-3 mb-4 px-2">
                    <div className="h-9 w-9 rounded-full bg-emerald-100 flex items-center justify-center border border-emerald-200">
                        <User className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{technicianName}</p>
                        <p className="text-xs text-gray-500 truncate">Technician</p>
                    </div>
                </div>

                <button
                    onClick={onLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all duration-200 text-sm font-medium"
                >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </button>
            </div>
        </div>
    );
}
