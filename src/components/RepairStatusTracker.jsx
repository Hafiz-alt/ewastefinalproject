import React from 'react';
import { CheckCircle, Clock, PenTool as Tool, Truck, AlertCircle } from 'lucide-react';

const steps = [
  { id: 'pending', label: 'Request Submitted', icon: <Clock className="h-5 w-5" /> },
  { id: 'assigned', label: 'Technician Assigned', icon: <Truck className="h-5 w-5" /> },
  { id: 'diagnosing', label: 'Diagnosing', icon: <AlertCircle className="h-5 w-5" /> },
  { id: 'repairing', label: 'Repairing', icon: <Tool className="h-5 w-5" /> },
  { id: 'completed', label: 'Completed', icon: <CheckCircle className="h-5 w-5" /> }
];

export default function RepairStatusTracker({ status, estimatedCompletion }) {
  // Find the current step index
  const currentStepIndex = steps.findIndex(step => step.id === status);
  
  // If status is cancelled, show a different UI
  if (status === 'cancelled') {
    return (
      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
        <div className="flex items-center">
          <AlertCircle className="h-6 w-6 text-red-600 mr-3" />
          <div>
            <h3 className="text-lg font-medium text-red-800">Repair Request Cancelled</h3>
            <p className="text-sm text-red-600 mt-1">
              This repair request has been cancelled. Please contact support if you need assistance.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="relative">
        {/* Progress bar */}
        <div className="overflow-hidden h-2 mb-6 text-xs flex rounded bg-gray-200">
          <div 
            style={{ width: `${Math.max(5, (currentStepIndex / (steps.length - 1)) * 100)}%` }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-emerald-500 transition-all duration-500"
          ></div>
        </div>
        
        {/* Steps */}
        <div className="flex justify-between">
          {steps.map((step, index) => {
            // Determine if this step is active, completed, or upcoming
            const isActive = index === currentStepIndex;
            const isCompleted = index < currentStepIndex;
            const isUpcoming = index > currentStepIndex;
            
            return (
              <div 
                key={step.id} 
                className={`flex flex-col items-center ${isUpcoming ? 'opacity-50' : ''}`}
              >
                <div 
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center 
                    ${isActive ? 'bg-emerald-100 text-emerald-600 border-2 border-emerald-500' : 
                      isCompleted ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'}
                  `}
                >
                  {step.icon}
                </div>
                <div className="text-xs text-center mt-2 max-w-[80px]">{step.label}</div>
              </div>
            );
          })}
        </div>
      </div>
      
      {estimatedCompletion && (
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Estimated completion: {new Date(estimatedCompletion).toLocaleDateString()}</p>
        </div>
      )}
    </div>
  );
}