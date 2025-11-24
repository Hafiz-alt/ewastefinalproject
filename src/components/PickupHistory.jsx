import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';
import { Package, Clock, MapPin, AlertCircle } from 'lucide-react';

export default function PickupHistory() {
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPickups();

    // Subscribe to status changes
    const channel = supabase
      .channel('pickup_status_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'pickup_requests',
        },
        (payload) => {
          setPickups(current =>
            current.map(pickup =>
              pickup.id === payload.new.id ? { ...pickup, ...payload.new } : pickup
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPickups = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('pickup_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPickups(data || []);
    } catch (error) {
      console.error('Error fetching pickup history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
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
      {pickups.map((pickup) => (
        <div key={pickup.id} className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-emerald-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Pickup Request
                </h3>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(pickup.status)}`}>
                {pickup.status.charAt(0).toUpperCase() + pickup.status.slice(1)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Items</p>
                <p className="text-gray-900">{pickup.items}</p>
                <p className="text-sm text-gray-500 mt-1">Quantity: {pickup.quantity}</p>
              </div>

              <div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Pickup Address</p>
                    <p className="text-gray-900">{pickup.address}</p>
                  </div>
                </div>
              </div>
            </div>

            {pickup.notes && (
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">Notes</p>
                <p className="text-gray-900">{pickup.notes}</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>Requested on {format(new Date(pickup.created_at), 'PPp')}</span>
              </div>

              {pickup.status === 'pending' && (
                <div className="flex items-center gap-1 text-sm text-yellow-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>Waiting for recycler response</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {pickups.length === 0 && (
        <div className="text-center py-8 bg-white shadow rounded-lg">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No pickups yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Start by requesting a new pickup from the dashboard.
          </p>
        </div>
      )}
    </div>
  );
}