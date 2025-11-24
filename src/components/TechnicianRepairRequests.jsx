import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { Wrench, MapPin, Clock, MessageSquare, PenTool as Tool, Bell, Mail, Phone, AlertCircle } from 'lucide-react';
import RepairUpdateModal from './RepairUpdateModal';

export default function TechnicianRepairRequests() {
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [selectedRepair, setSelectedRepair] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [estimatedCost, setEstimatedCost] = useState('');
  const [showCostInput, setShowCostInput] = useState(null);
  const [newRequestAlert, setNewRequestAlert] = useState(false);
  const [newRequestData, setNewRequestData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchRepairs();
    
    // Subscribe to new repair requests
    const insertChannel = supabase
      .channel('repair_requests_insert')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'repair_requests'
        },
        (payload) => {
          console.log('New repair request received:', payload.new);
          
          // Add to repairs list if it's not already there
          setRepairs(current => {
            if (!current.find(r => r.id === payload.new.id)) {
              return [payload.new, ...current];
            }
            return current;
          });
          
          setNewRequestAlert(true);
          setNewRequestData(payload.new);
          
          // Show notification
          const notificationId = Date.now();
          setNotifications(prev => [
            ...prev, 
            {
              id: notificationId,
              message: `New repair request received for ${payload.new.device_type}!`,
              type: 'success'
            }
          ]);
          
          // Clear the notification after 5 seconds
          setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
          }, 5000);
          
          // Clear the alert after 10 seconds
          setTimeout(() => {
            setNewRequestAlert(false);
          }, 10000);
          
          // Play notification sound - commented out as the file might not exist
          // new Audio('/notification.mp3').play().catch(() => {});
        }
      )
      .subscribe();
      
    // Subscribe to updates to repair requests
    const updateChannel = supabase
      .channel('repair_requests_update')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'repair_requests'
        },
        (payload) => {
          console.log('Repair request updated:', payload.new);
          
          // Update the repair in the list
          setRepairs(current =>
            current.map(repair =>
              repair.id === payload.new.id ? { ...repair, ...payload.new } : repair
            )
          );
          
          // If it was cancelled by user, show notification
          if (payload.old.status !== 'cancelled' && payload.new.status === 'cancelled') {
            const notificationId = Date.now();
            setNotifications(prev => [
              ...prev, 
              {
                id: notificationId,
                message: `A repair request for ${payload.new.device_type} has been cancelled by the user.`,
                type: 'error'
              }
            ]);
            
            setTimeout(() => {
              setNotifications(prev => prev.filter(n => n.id !== notificationId));
            }, 5000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(insertChannel);
      supabase.removeChannel(updateChannel);
    };
  }, []);

  const fetchRepairs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      // Get user profile to check if they're a technician
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'technician') {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('repair_requests')
        .select(`
          *,
          user:profiles!user_id(full_name, email)
        `)
        .or(`technician_id.is.null,technician_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching repairs:', error);
        throw error;
      }
      
      console.log('Fetched repair requests:', data);
      setRepairs(data || []);
    } catch (error) {
      console.error('Error fetching repairs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (repairId, newStatus) => {
    try {
      setUpdating(repairId);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const repair = repairs.find(r => r.id === repairId);
      const updateData = { 
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      // If status is changing to assigned, set the technician_id
      if (newStatus === 'assigned' && repair?.technician_id === null) {
        updateData.technician_id = user.id;
      }

      const { error } = await supabase
        .from('repair_requests')
        .update(updateData)
        .eq('id', repairId);

      if (error) throw error;

      // Send notification to user when request is accepted
      if (newStatus === 'assigned' && repair?.status !== 'assigned') {
        try {
          // Create a notification in repair_updates
          await supabase
            .from('repair_updates')
            .insert([
              {
                repair_id: repairId,
                author_id: user.id,
                message: `Your repair request has been accepted and assigned to a technician. We'll be in touch shortly to arrange the next steps.`
              }
            ]);
            
          console.log('Notification sent to user about repair acceptance');
          
          // Show success notification
          const notificationId = Date.now();
          setNotifications(prev => [
            ...prev, 
            {
              id: notificationId,
              message: 'You have successfully accepted this repair request.',
              type: 'success'
            }
          ]);
          
          setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
          }, 5000);
        } catch (notificationError) {
          console.error('Error sending notification:', notificationError);
        }
      }

      // Update local state
      setRepairs(current =>
        current.map(repair =>
          repair.id === repairId
            ? { 
                ...repair, 
                status: newStatus, 
                updated_at: new Date().toISOString(),
                technician_id: updateData.technician_id || repair.technician_id
              }
            : repair
        )
      );
    } catch (error) {
      console.error('Error updating repair status:', error);
      
      // Show error notification
      const notificationId = Date.now();
      setNotifications(prev => [
        ...prev, 
        {
          id: notificationId,
          message: 'Failed to update repair status. Please try again.',
          type: 'error'
        }
      ]);
      
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
      }, 5000);
    } finally {
      setUpdating(null);
    }
  };

  const handleUpdateCost = async (repairId) => {
    try {
      if (!estimatedCost || isNaN(parseFloat(estimatedCost))) {
        alert('Please enter a valid cost estimate');
        return;
      }

      setUpdating(repairId);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { error } = await supabase
        .from('repair_requests')
        .update({ 
          estimated_cost: parseFloat(estimatedCost),
          updated_at: new Date().toISOString()
        })
        .eq('id', repairId);

      if (error) throw error;

      // Add a message about the cost estimate
      await supabase
        .from('repair_updates')
        .insert([
          {
            repair_id: repairId,
            author_id: user.id,
            message: `Estimated repair cost: $${parseFloat(estimatedCost).toFixed(2)}`
          }
        ]);

      // Update local state
      setRepairs(current =>
        current.map(repair =>
          repair.id === repairId
            ? { 
                ...repair, 
                estimated_cost: parseFloat(estimatedCost), 
                updated_at: new Date().toISOString()
              }
            : repair
        )
      );

      setShowCostInput(null);
      setEstimatedCost('');
      
      // Show success notification
      const notificationId = Date.now();
      setNotifications(prev => [
        ...prev, 
        {
          id: notificationId,
          message: 'Cost estimate updated successfully.',
          type: 'success'
        }
      ]);
      
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
      }, 5000);
    } catch (error) {
      console.error('Error updating cost estimate:', error);
      
      // Show error notification
      const notificationId = Date.now();
      setNotifications(prev => [
        ...prev, 
        {
          id: notificationId,
          message: 'Failed to update cost estimate. Please try again.',
          type: 'error'
        }
      ]);
      
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
      }, 5000);
    } finally {
      setUpdating(null);
    }
  };

  const handleOpenUpdateModal = (repair) => {
    setSelectedRepair(repair);
    setShowUpdateModal(true);
  };

  const handleUpdateSuccess = () => {
    setShowUpdateModal(false);
    fetchRepairs();
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      case 'diagnosing':
        return 'bg-purple-100 text-purple-800';
      case 'repairing':
        return 'bg-indigo-100 text-indigo-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const filteredRepairs = repairs.filter(repair => {
    if (filter === 'all') return true;
    if (filter === 'pending') return repair.status === 'pending';
    if (filter === 'active') return ['assigned', 'diagnosing', 'repairing'].includes(repair.status);
    if (filter === 'completed') return repair.status === 'completed';
    if (filter === 'cancelled') return repair.status === 'cancelled';
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <div 
            key={notification.id}
            className={`p-3 rounded-lg shadow-md max-w-xs animate-fade-in ${
              notification.type === 'success' ? 'bg-green-50 text-green-800' : 
              notification.type === 'info' ? 'bg-blue-50 text-blue-800' : 
              'bg-red-50 text-red-800'
            }`}
          >
            {notification.message}
          </div>
        ))}
      </div>
      
      {newRequestAlert && (
        <div className="p-4 bg-emerald-50 text-emerald-700 rounded-lg shadow-md flex items-center animate-pulse">
          <Bell className="h-5 w-5 mr-2" />
          <span>
            New repair request received from {newRequestData?.user_name || 'a customer'} for {newRequestData?.device_type || 'a device'}!
          </span>
        </div>
      )}
      
      {/* Filter controls */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              filter === 'all' 
                ? 'bg-emerald-100 text-emerald-800' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            All Requests
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              filter === 'pending' 
                ? 'bg-yellow-100 text-yellow-800' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              filter === 'active' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              filter === 'completed' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setFilter('cancelled')}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              filter === 'cancelled' 
                ? 'bg-red-100 text-red-800' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            Cancelled
          </button>
        </div>
      </div>
      
      {filteredRepairs.map((repair) => (
        <div
          key={repair.id}
          className={`bg-white rounded-lg shadow-md p-6 space-y-4 transition-all duration-200 ${
            repair.status === 'pending' ? 'border-l-4 border-yellow-400' : 
            repair.status === 'assigned' ? 'border-l-4 border-blue-400' : ''
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-emerald-600" />
                {repair.device_type} Repair from {repair.user_name || repair.user?.full_name || 'User'}
              </h3>
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                <Clock className="w-4 h-4" />
                {format(new Date(repair.created_at), 'PPp')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={repair.status}
                onChange={(e) => handleStatusUpdate(repair.id, e.target.value)}
                disabled={updating === repair.id || repair.status === 'cancelled'}
                className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                  getStatusBadgeClass(repair.status)
                } ${(updating === repair.id || repair.status === 'cancelled') ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <option value="pending">Pending</option>
                <option value="assigned">Assigned</option>
                <option value="diagnosing">Diagnosing</option>
                <option value="repairing">Repairing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Tool className="w-5 h-5 text-gray-500 mt-1" />
                <div>
                  <p className="font-medium text-gray-700">Issue Description</p>
                  <p className="text-gray-600">{repair.issue_description}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-500 mt-1" />
                <div>
                  <p className="font-medium text-gray-700">Address</p>
                  <p className="text-gray-600">{repair.address}</p>
                </div>
              </div>

              {repair.user_email && (
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-500 mt-1" />
                  <div>
                    <p className="font-medium text-gray-700">Contact Email</p>
                    <p className="text-gray-600">{repair.user_email || repair.user?.email}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {repair.notes && (
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-500 mt-1" />
                  <div>
                    <p className="font-medium text-gray-700">Additional Notes</p>
                    <p className="text-gray-600">{repair.notes}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 flex-shrink-0">💰</div>
                <div>
                  <p className="font-medium text-gray-700">Cost Estimate</p>
                  {showCostInput === repair.id ? (
                    <div className="flex items-center mt-1">
                      <span className="text-gray-500 mr-1">$</span>
                      <input
                        type="number"
                        value={estimatedCost}
                        onChange={(e) => setEstimatedCost(e.target.value)}
                        className="w-24 px-2 py-1 border border-gray-300 rounded-md"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                      <button
                        onClick={() => handleUpdateCost(repair.id)}
                        disabled={updating === repair.id}
                        className="ml-2 px-2 py-1 bg-emerald-600 text-white text-sm rounded-md hover:bg-emerald-700 disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setShowCostInput(null)}
                        className="ml-1 px-2 py-1 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <p className="text-gray-600">
                        {repair.estimated_cost ? `$${repair.estimated_cost}` : 'Not set'}
                      </p>
                      {repair.status !== 'cancelled' && (
                        <button
                          onClick={() => {
                            setShowCostInput(repair.id);
                            setEstimatedCost(repair.estimated_cost?.toString() || '');
                          }}
                          className="ml-2 text-xs text-emerald-600 hover:text-emerald-700"
                        >
                          {repair.estimated_cost ? 'Update' : 'Set estimate'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {repair.images && repair.images.length > 0 && (
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-gray-500 mt-1" />
                  <div>
                    <p className="font-medium text-gray-700">Device Images</p>
                    <div className="mt-2 grid grid-cols-4 gap-2">
                      {repair.images.map((url, index) => (
                        <a 
                          key={index} 
                          href={url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <img
                            src={url}
                            alt={`Device image ${index + 1}`}
                            className="h-16 w-full object-cover rounded-md hover:opacity-80 transition-opacity"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end pt-4 border-t border-gray-200">
            {repair.status !== 'cancelled' && (
              <button
                onClick={() => handleOpenUpdateModal(repair)}
                className="inline-flex items-center px-3 py-2 border border-emerald-600 text-sm font-medium rounded-md text-emerald-600 hover:bg-emerald-50"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Send Message
              </button>
            )}
          </div>
        </div>
      ))}

      {filteredRepairs.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <Wrench className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No repair requests</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter === 'all' 
              ? 'New requests will appear here when users schedule repairs.'
              : `No ${filter} repair requests found.`}
          </p>
        </div>
      )}

      {showUpdateModal && selectedRepair && (
        <RepairUpdateModal
          repair={selectedRepair}
          onClose={() => setShowUpdateModal(false)}
          onSuccess={handleUpdateSuccess}
        />
      )}
    </div>
  );
}