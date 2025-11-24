import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';

export default function RepairUpdateModal({ repair, onClose, onSuccess }) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchUpdates();
    fetchCurrentUser();
  }, [repair.id]);

  const fetchCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, full_name')
          .eq('id', user.id)
          .single();
          
        setCurrentUser({ ...user, ...profile });
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchUpdates = async () => {
    try {
      const { data, error } = await supabase
        .from('repair_updates')
        .select(`
          *,
          author:profiles(full_name, role)
        `)
        .eq('repair_id', repair.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setUpdates(data || []);
    } catch (error) {
      console.error('Error fetching repair updates:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to send a message');
      }

      // Create repair update
      const { error } = await supabase
        .from('repair_updates')
        .insert([
          {
            repair_id: repair.id,
            author_id: user.id,
            message: data.message
          }
        ]);

      if (error) throw error;
      
      // Refresh updates
      fetchUpdates();
      reset({ message: '' });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('There was an error sending your message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {repair.device_type} Repair - Communication
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-24">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
            </div>
          ) : updates.length > 0 ? (
            updates.map((update) => (
              <div 
                key={update.id} 
                className={`p-3 rounded-lg ${
                  update.author.role === 'technician' 
                    ? 'bg-emerald-50 ml-6' 
                    : 'bg-gray-100 mr-6'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-sm">
                    {update.author.full_name} 
                    {update.author.role === 'technician' && ' (Technician)'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {format(new Date(update.created_at), 'MMM d, h:mm a')}
                  </span>
                </div>
                <p className="text-gray-800">{update.message}</p>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              {repair.status === 'pending' ? (
                <>
                  <p>Your repair request is pending assignment to a technician.</p>
                  <p className="mt-2">You'll be notified when a technician accepts your request.</p>
                </>
              ) : (
                <>No messages yet. Start the conversation!</>
              )}
            </div>
          )}
          
          {repair.status === 'assigned' && !repair.technician && (
            <div className="bg-blue-50 p-3 rounded-lg text-blue-800">
              <p className="font-medium">Your repair request has been accepted!</p>
              <p className="text-sm mt-1">A technician will contact you shortly with more details.</p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 border-t">
          <div className="mb-4">
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              Your Message
            </label>
            <textarea
              id="message"
              rows={3}
              {...register('message', { required: 'Message is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Type your message here..."
            />
            {errors.message && (
              <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || repair.status === 'pending' && currentUser?.role !== 'technician'}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}