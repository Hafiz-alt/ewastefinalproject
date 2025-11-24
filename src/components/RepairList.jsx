import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';
import { Wrench, Clock, MapPin, MessageSquare, AlertCircle, CheckCircle, XCircle, Search, Filter } from 'lucide-react';
import RepairDetailsModal from './RepairDetailsModal';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  assigned: 'bg-blue-100 text-blue-800',
  diagnosing: 'bg-purple-100 text-purple-800',
  repairing: 'bg-indigo-100 text-indigo-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const statusIcons = {
  pending: <Clock className="h-5 w-5" />,
  assigned: <Wrench className="h-5 w-5" />,
  diagnosing: <AlertCircle className="h-5 w-5" />,
  repairing: <Wrench className="h-5 w-5" />,
  completed: <CheckCircle className="h-5 w-5" />,
  cancelled: <XCircle className="h-5 w-5" />,
};

export default function RepairList({ userRole = 'user', userId = null }) {
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRepair, setSelectedRepair] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

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
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(statusChannel);
      supabase.removeChannel(updatesChannel);
    };
  }, [userRole, userId]);

  const fetchRepairs = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user && !userId) {
        setLoading(false);
        return;
      }

      let query = supabase
        .from('repair_requests')
        .select(`
          *,
          technician:profiles!technician_id(full_name)
        `)
        .order('created_at', { ascending: false });

      if (userRole === 'user') {
        // For regular users, show only their own repairs
        query = query.eq('user_id', userId || user.id);
      } else if (userRole === 'technician') {
        // For technicians, show repairs assigned to them and pending repairs
        query = query.or(`technician_id.eq.${userId || user.id},status.eq.pending`);
      }

      const { data, error } = await query;

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
      alert('Failed to cancel repair request. Please try again.');
    } finally {
      setCancellingId(null);
    }
  };

  const handleStatusUpdate = async (repairId, newStatus) => {
    try {
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
      alert('Failed to update repair status. Please try again.');
    }
  };

  const handleViewDetails = (repair) => {
    setSelectedRepair(repair);
    setShowDetailsModal(true);
  };

  const handleDetailsClose = () => {
    setShowDetailsModal(false);
    setSelectedRepair(null);
  };

  const handleDetailsUpdate = () => {
    fetchRepairs();
  };

  const filteredRepairs = repairs.filter(repair => {
    // Apply status filter
    if (filter !== 'all' && repair.status !== filter) {
      return false;
    }
    
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        repair.device_type.toLowerCase().includes(searchLower) ||
        (repair.device_model && repair.device_model.toLowerCase().includes(searchLower)) ||
        repair.issue_description.toLowerCase().includes(searchLower) ||
        (repair.user_name && repair.user_name.toLowerCase().includes(searchLower))
      );
    }
    
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
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 md:items-center">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search repairs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                filter === 'all' 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              All
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
              onClick={() => setFilter('assigned')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                filter === 'assigned' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              Assigned
            </button>
            <button
              onClick={() => setFilter('diagnosing')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                filter === 'diagnosing' 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              Diagnosing
            </button>
            <button
              onClick={() => setFilter('repairing')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                filter === 'repairing' 
                  ? 'bg-indigo-100 text-indigo-800' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              Repairing
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
          </div>
        </div>
      </div>

      {/* Repair List */}
      {filteredRepairs.map((repair) => (
        <div
          key={repair.id}
          className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-200 ${
            repair.status === 'pending' ? 'border-l-4 border-yellow-400' : 
            repair.status === 'assigned' ? 'border-l-4 border-blue-400' : ''
          }`}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-emerald-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  {repair.device_type} {repair.device_model && `- ${repair.device_model}`} Repair
                </h3>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${statusColors[repair.status]}`}>
                {statusIcons[repair.status]}
                <span className="ml-1 capitalize">{repair.status}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Issue</p>
                <p className="text-gray-900 line-clamp-2">{repair.issue_description}</p>
              </div>

              <div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Address</p>
                    <p className="text-gray-900 line-clamp-1">{repair.address}</p>
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

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>Requested on {format(new Date(repair.created_at), 'MMM d, yyyy')}</span>
              </div>

              <div className="flex gap-2">
                {userRole === 'user' && repair.status === 'pending' && (
                  <button
                    onClick={() => handleCancelRepair(repair.id)}
                    disabled={cancellingId === repair.id}
                    className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    {cancellingId === repair.id ? 'Cancelling...' : 'Cancel Request'}
                  </button>
                )}
                
                {userRole === 'technician' && repair.status === 'pending' && (
                  <button
                    onClick={() => handleStatusUpdate(repair.id, 'assigned')}
                    className="inline-flex items-center px-3 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-600 hover:bg-blue-50"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Accept Request
                  </button>
                )}
                
                {userRole === 'technician' && repair.status === 'assigned' && (
                  <button
                    onClick={() => handleStatusUpdate(repair.id, 'diagnosing')}
                    className="inline-flex items-center px-3 py-2 border border-purple-300 text-sm font-medium rounded-md text-purple-600 hover:bg-purple-50"
                  >
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Start Diagnosis
                  </button>
                )}
                
                {userRole === 'technician' && repair.status === 'diagnosing' && (
                  <button
                    onClick={() => handleStatusUpdate(repair.id, 'repairing')}
                    className="inline-flex items-center px-3 py-2 border border-indigo-300 text-sm font-medium rounded-md text-indigo-600 hover:bg-indigo-50"
                  >
                    <Wrench className="w-4 h-4 mr-2" />
                    Start Repair
                  </button>
                )}
                
                {userRole === 'technician' && repair.status === 'repairing' && (
                  <button
                    onClick={() => handleStatusUpdate(repair.id, 'completed')}
                    className="inline-flex items-center px-3 py-2 border border-green-300 text-sm font-medium rounded-md text-green-600 hover:bg-green-50"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark Completed
                  </button>
                )}
                
                <button
                  onClick={() => handleViewDetails(repair)}
                  className="inline-flex items-center px-3 py-2 border border-emerald-600 text-sm font-medium rounded-md text-emerald-600 hover:bg-emerald-50"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {filteredRepairs.length === 0 && (
        <div className="text-center py-8 bg-white shadow rounded-lg">
          <Wrench className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No repair requests found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter !== 'all' 
              ? `No ${filter} repair requests found.`
              : searchTerm 
                ? 'No repair requests match your search criteria.'
                : userRole === 'user' 
                  ? 'Start by requesting a device repair from the dashboard.'
                  : 'New repair requests will appear here.'}
          </p>
        </div>
      )}

      {showDetailsModal && selectedRepair && (
        <RepairDetailsModal
          repair={selectedRepair}
          onClose={handleDetailsClose}
          onUpdate={handleDetailsUpdate}
          userRole={userRole}
        />
      )}
    </div>
  );
}