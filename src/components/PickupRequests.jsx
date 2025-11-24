import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { Calendar, MapPin, Package, Clock, Phone, Mail } from 'lucide-react';

export default function PickupRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetchRequests();
    
    // Subscribe to new pickup requests
    const channel = supabase
      .channel('pickup_requests')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'pickup_requests'
        },
        (payload) => {
          setRequests(current => [payload.new, ...current]);
          // Play notification sound - commented out as the file might not exist
          // new Audio('/notification.mp3').play().catch(() => {});
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchRequests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      // Get user profile to check if they're a recycler
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'recycler') {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('pickup_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      setUpdating(requestId);
      const { error } = await supabase
        .from('pickup_requests')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      // Update local state
      setRequests(current =>
        current.map(request =>
          request.id === requestId
            ? { ...request, status: newStatus, updated_at: new Date().toISOString() }
            : request
        )
      );

      // Notify user via email about status change - this would be handled by a serverless function
      // For now, we'll just log it
      console.log(`Status updated for request ${requestId} to ${newStatus}`);
    } catch (error) {
      console.error('Error updating request status:', error);
    } finally {
      setUpdating(null);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {requests.map((request) => (
        <div
          key={request.id}
          className={`bg-white rounded-lg shadow-md p-6 space-y-4 transition-all duration-200 ${
            request.status === 'pending' ? 'border-l-4 border-yellow-400' : ''
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-600" />
                Pickup Request from {request.user_name || 'User'}
              </h3>
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                <Calendar className="w-4 h-4" />
                {format(new Date(request.created_at), 'PPp')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={request.status}
                onChange={(e) => handleStatusUpdate(request.id, e.target.value)}
                disabled={updating === request.id}
                className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                  getStatusBadgeClass(request.status)
                } ${updating === request.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Package className="w-5 h-5 text-gray-500 mt-1" />
                <div>
                  <p className="font-medium text-gray-700">Items</p>
                  <p className="text-gray-600">{request.items}</p>
                  <p className="text-sm text-gray-500 mt-1">Quantity: {request.quantity}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-500 mt-1" />
                <div>
                  <p className="font-medium text-gray-700">Pickup Address</p>
                  <p className="text-gray-600">{request.address}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {request.notes && (
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-500 mt-1" />
                  <div>
                    <p className="font-medium text-gray-700">Additional Notes</p>
                    <p className="text-gray-600">{request.notes}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-500 mt-1" />
                <div>
                  <p className="font-medium text-gray-700">Contact Information</p>
                  <p className="text-gray-600">{request.user_email || 'No email provided'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {requests.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No pickup requests</h3>
          <p className="mt-1 text-sm text-gray-500">
            New requests will appear here when users schedule pickups.
          </p>
        </div>
      )}
    </div>
  );
}