import React, { useState } from 'react';
import { X } from 'lucide-react';
import RepairRequestForm from './RepairRequestForm';

export default function RepairRequestModal({ onClose, onSuccess }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Request Device Repair</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="overflow-y-auto p-6">
          <RepairRequestForm 
            onSuccess={onSuccess} 
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
}