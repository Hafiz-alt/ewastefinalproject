import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import { Package, Truck, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const statusIcons = {
  pending: <AlertTriangle className="h-5 w-5" />,
  paid: <Package className="h-5 w-5" />,
  shipped: <Truck className="h-5 w-5" />,
  completed: <CheckCircle className="h-5 w-5" />,
  cancelled: <XCircle className="h-5 w-5" />,
};

export default function OrderList({ type = 'buyer' }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetchOrders();

    // Subscribe to order updates
    const channel = supabase
      .channel('order_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setOrders((current) =>
              current.map((order) =>
                order.id === payload.new.id ? { ...order, ...payload.new } : order
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [type]);

  const fetchOrders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      let query = supabase
        .from('orders')
        .select('*, product:products(*), buyer:profiles!buyer_id(*), seller:profiles!seller_id(*)')
        .order('created_at', { ascending: false });

      if (type === 'buyer') {
        query = query.eq('buyer_id', user.id);
      } else {
        query = query.eq('seller_id', user.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdating(orderId);
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      setOrders((current) =>
        current.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (error) {
      console.error('Error updating order status:', error);
    } finally {
      setUpdating(null);
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
      {orders.map((order) => (
        <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status]}`}>
                  {statusIcons[order.status]}
                  <span className="ml-2 capitalize">{order.status}</span>
                </span>
                <span className="text-sm text-gray-500">
                  Order #{order.id.slice(0, 8)}
                </span>
              </div>
              <span className="text-sm text-gray-500">
                {format(new Date(order.created_at), 'PPp')}
              </span>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <img
                  src={order.product?.images && order.product.images.length > 0 ? order.product.images[0] : 'https://images.unsplash.com/photo-1526406915894-7bcd65f60845?w=800&auto=format&fit=crop&q=60'}
                  alt={order.product?.title || 'Product'}
                  className="w-24 h-24 object-cover rounded-lg"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-lg font-medium text-gray-900">
                  {order.product?.title || 'Product'}
                </h4>
                <p className="mt-1 text-sm text-gray-500">
                  {type === 'buyer' ? 'Sold by' : 'Purchased by'}: {type === 'buyer' ? order.seller?.full_name : order.buyer?.full_name}
                </p>
                <p className="mt-1 text-lg font-medium text-emerald-600">
                  ${order.product?.price || '0.00'}
                </p>
              </div>
            </div>

            <div className="mt-6 border-t border-gray-200 pt-4">
              <div className="flex items-start">
                <div className="flex-1">
                  <h5 className="text-sm font-medium text-gray-900">Shipping Address</h5>
                  <p className="mt-1 text-sm text-gray-600">{order.shipping_address}</p>
                </div>

                {type === 'seller' && order.status !== 'completed' && order.status !== 'cancelled' && (
                  <div className="ml-4">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      disabled={updating === order.id}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 disabled:opacity-50"
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="shipped">Shipped</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      {orders.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {type === 'buyer'
              ? 'Start shopping in the marketplace to see your orders here.'
              : 'Your sold items will appear here.'}
          </p>
        </div>
      )}
    </div>
  );
}