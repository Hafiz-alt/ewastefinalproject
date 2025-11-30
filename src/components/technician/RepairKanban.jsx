import React, { useState } from 'react';
import {
    MoreHorizontal,
    Clock,
    AlertCircle,
    CheckCircle2,
    Wrench,
    Smartphone,
    Laptop,
    Monitor,
    Printer,
    Tablet,
    HardDrive
} from 'lucide-react';

const deviceIcons = {
    'Smartphone': <Smartphone className="h-4 w-4" />,
    'Laptop': <Laptop className="h-4 w-4" />,
    'Desktop': <HardDrive className="h-4 w-4" />,
    'Tablet': <Tablet className="h-4 w-4" />,
    'Monitor': <Monitor className="h-4 w-4" />,
    'Printer': <Printer className="h-4 w-4" />,
    'Other': <Wrench className="h-4 w-4" />
};

const priorityColors = {
    high: 'bg-red-100 text-red-700 border-red-200',
    medium: 'bg-orange-100 text-orange-700 border-orange-200',
    low: 'bg-blue-100 text-blue-700 border-blue-200',
};

export default function RepairKanban({ repairs, onStatusUpdate }) {
    const columns = [
        { id: 'pending', title: 'Pending', color: 'bg-yellow-500/10 text-yellow-700 border-yellow-200' },
        { id: 'diagnosing', title: 'Diagnosing', color: 'bg-purple-500/10 text-purple-700 border-purple-200' },
        { id: 'repairing', title: 'In Repair', color: 'bg-blue-500/10 text-blue-700 border-blue-200' },
        { id: 'completed', title: 'Completed', color: 'bg-emerald-500/10 text-emerald-700 border-emerald-200' },
    ];

    const getRepairsByStatus = (status) => {
        return repairs.filter(r => r.status === status);
    };

    return (
        <div className="h-full overflow-x-auto pb-4">
            <div className="flex gap-6 min-w-[1000px] h-full">
                {columns.map((column) => (
                    <div key={column.id} className="flex-1 min-w-[300px] flex flex-col h-full">
                        {/* Column Header */}
                        <div className={`flex items-center justify-between p-3 rounded-t-xl border-b-2 ${column.color.replace('bg-', 'border-').split(' ')[2]} bg-white shadow-sm mb-3`}>
                            <div className="flex items-center gap-2">
                                <span className={`w-2.5 h-2.5 rounded-full ${column.color.replace('/10', '').split(' ')[0]}`}></span>
                                <h3 className="font-semibold text-gray-700">{column.title}</h3>
                                <span className="px-2 py-0.5 rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                                    {getRepairsByStatus(column.id).length}
                                </span>
                            </div>
                            <button className="text-gray-400 hover:text-gray-600">
                                <MoreHorizontal className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Column Content */}
                        <div className="flex-1 bg-gray-50/50 rounded-xl p-2 space-y-3 overflow-y-auto custom-scrollbar border border-gray-100">
                            {getRepairsByStatus(column.id).map((repair) => (
                                <div
                                    key={repair.id}
                                    className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 group cursor-pointer relative"
                                >
                                    {/* Priority Badge */}
                                    <div className="flex justify-between items-start mb-3">
                                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${priorityColors[repair.priority || 'medium']}`}>
                                            {repair.priority || 'Medium'}
                                        </span>
                                        <button className="text-gray-300 hover:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </button>
                                    </div>

                                    {/* Device Info */}
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className="p-2 rounded-lg bg-gray-50 text-gray-500 border border-gray-100">
                                            {deviceIcons[repair.device_type] || <Wrench className="h-5 w-5" />}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-800 text-sm line-clamp-1">
                                                {repair.device_type} {repair.device_model}
                                            </h4>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {repair.user_name || 'Customer'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Issue Description */}
                                    <p className="text-xs text-gray-600 mb-4 line-clamp-2 bg-gray-50 p-2 rounded-lg border border-gray-100/50">
                                        {repair.issue_description}
                                    </p>

                                    {/* Footer Stats */}
                                    <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                                        <div className="flex items-center gap-1 text-xs text-gray-400">
                                            <Clock className="h-3 w-3" />
                                            <span>{new Date(repair.created_at).toLocaleDateString()}</span>
                                        </div>

                                        {/* Action Buttons based on status */}
                                        <div className="flex gap-1">
                                            {column.id === 'pending' && (
                                                <button
                                                    onClick={() => onStatusUpdate(repair.id, 'assigned')}
                                                    className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                                                    title="Accept"
                                                >
                                                    <CheckCircle2 className="h-4 w-4" />
                                                </button>
                                            )}
                                            {column.id === 'assigned' && (
                                                <button
                                                    onClick={() => onStatusUpdate(repair.id, 'diagnosing')}
                                                    className="p-1.5 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
                                                    title="Start Diagnosis"
                                                >
                                                    <Wrench className="h-4 w-4" />
                                                </button>
                                            )}
                                            {column.id === 'diagnosing' && (
                                                <button
                                                    onClick={() => onStatusUpdate(repair.id, 'repairing')}
                                                    className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                                    title="Start Repair"
                                                >
                                                    <Wrench className="h-4 w-4" />
                                                </button>
                                            )}
                                            {column.id === 'repairing' && (
                                                <button
                                                    onClick={() => onStatusUpdate(repair.id, 'completed')}
                                                    className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                                                    title="Complete"
                                                >
                                                    <CheckCircle2 className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {getRepairsByStatus(column.id).length === 0 && (
                                <div className="flex flex-col items-center justify-center h-32 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                                    <AlertCircle className="h-6 w-6 mb-2 opacity-50" />
                                    <span className="text-xs font-medium">No items</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
