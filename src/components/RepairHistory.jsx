import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';
import { Wrench, Clock, MapPin, MessageSquare, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import RepairUpdateModal from './RepairUpdateModal';

export default function RepairHistory() {
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRepair, setSelectedRepair] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    fetchRepairs();

    // Subscribe to status changes
    const statusChannel = supabase
      .channel('repair_status_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'repair_requests',
        },
        (payload) => {
          setRepairs(current =>
            current.map(repair =>
              repair.id === payload.new.id ? { ...repair, ...payload.new } : repair
            )
          );
          
          // If status changed, show notification
          if (payload.old.status !== payload.new.status) {
            const statusMessages = {
              'assigned': 'Your repair request has been accepted by a technician.',
              'diagnosing': 'Your device is now being diagnosed by the technician.',
              'repairing': 'Your device is now being repaired.',
              'completed': 'Your repair has been completed!',
              'cancelled': 'Your repair request has been cancelled.'
            };
            
            const message = statusMessages[payload.new.status] || `Your repair status has been updated to ${payload.new.status}.`;
            
            const notificationId = Date.now();
            setNotifications(prev => [
              ...prev, 
              {
                id: notificationId,
                message: message,
                type: payload.new.status === 'cancelled' ? 'error' : 'success'
              }
            ]);
            
            // Remove notification after 5 seconds
            setTimeout(() => {
              setNotifications(prev => prev.filter(n => n.id !== notificationId));
            }, 5000);
          }
        }
      )
      .subscribe();
      
    // Subscribe to repair updates (messages)
    const updatesChannel = supabase
      .channel('repair_updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'repair_updates',
        },
        (payload) => {
          // Check if this update is for one of our repairs
          const relatedRepair = repairs.find(r => r.id === payload.new.repair_id);
          if (relatedRepair) {
            // Refresh repairs to get the latest updates
            fetchRepairs();
            
            // Show notification about new message
            const notificationId = Date.now();
            setNotifications(prev => [
              ...prev, 
              {
                id: notificationId,
                message: `New message received about your ${relatedRepair.device_type} repair.`,
                type: 'info'
              }
            ]);
            
            // Remove notification after 5 seconds
            setTimeout(() => {
              setNotifications(prev => prev.filter(n => n.id !== notificationId));
            }, 5000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(statusChannel);
      supabase.removeChannel(updatesChannel);
    };
  }, [repairs]);

  const fetchRepairs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('repair_requests')
        .select(`
          *,
          technician:profiles!technician_id(full_name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRepairs(data || []);
    } catch (error) {
      console.error('Error fetching repair history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRepair = async (repairId) => {
    try {
      setCancellingId(repairId);
      
      const { error } = await supabase
        .from('repair_requests')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', repairId);

      if (error) throw error;
      
      // Add a message to repair_updates
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('repair_updates')
          .insert([
            {
              repair_id: repairId,
              author_id: user.id,
              message: 'Request cancelled by user.'
            }
          ]);
      }
      
      // Update local state
      setRepairs(current =>
        current.map(repair =>
          repair.id === repairId ? { ...repair, status: 'cancelled' } : repair
        )
      );
      
    } catch (error) {
      console.error('Error cancelling repair:', error);
      const notificationId = Date.now();
      setNotifications(prev => [
        ...prev, 
        {
          id: notificationId,
          message: 'Failed to cancel repair request. Please try again.',
          type: 'error'
        }
      ]);
      
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
      }, 5000);
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusColor = (status) => {
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

  const handleOpenUpdateModal = (repair) => {
    setSelectedRepair(repair);
    setShowUpdateModal(true);
  };

  const handleUpdateSuccess = () => {
    setShowUpdateModal(false);
    fetchRepairs();
  };

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
      
      {repairs.map((repair) => (
        <div key={repair.id} className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-emerald-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  {repair.device_type} Repair
                </h3>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(repair.status)}`}>
                {repair.status.charAt(0).toUpperCase() + repair.status.slice(1)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Issue</p>
                <p className="text-gray-900">{repair.issue_description}</p>
              </div>

              <div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Address</p>
                    <p className="text-gray-900">{repair.address}</p>
                  </div>
                </div>
              </div>
            </div>

            {repair.estimated_cost && (
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">Estimated Cost</p>
                <p className="text-gray-900">${repair.estimated_cost}</p>
              </div>
            )}

            {repair.technician && (
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">Assigned Technician</p>
                <p className="text-gray-900">{repair.technician.full_name}</p>
              </div>
            )}

            {repair.notes && (
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">Notes</p>
                <p className="text-gray-900">{repair.notes}</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>Requested on {format(new Date(repair.created_at), 'MMM d, yyyy')}</span>
              </div>

              <div className="flex gap-2">
                {repair.status === 'pending' && (
                  <button
                    onClick={() => handleCancelRepair(repair.id)}
                    disabled={cancellingId === repair.id}
                    className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    {cancellingId === repair.id ? 'Cancelling...' : 'Cancel Request'}
                  </button>
                )}
                <button
                  onClick={() => handleOpenUpdateModal(repair)}
                  className="inline-flex items-center px-3 py-2 border border-emerald-600 text-sm font-medium rounded-md text-emerald-600 hover:bg-emerald-50"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  {repair.status === 'pending' ? 'Check Status' : 'Send Message'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {repairs.length === 0 && (
        <div className="text-center py-8 bg-white shadow rounded-lg">
          <Wrench className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No repair requests yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Start by requesting a device repair from the dashboard.
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