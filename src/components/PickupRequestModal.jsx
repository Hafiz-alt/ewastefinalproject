import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function PickupRequestModal({ onClose, onSuccess }) {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to request a pickup');
      }

      // Get user profile info
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', user.id)
        .single();

      // Create pickup request
      const { error } = await supabase
        .from('pickup_requests')
        .insert([
          {
            user_id: user.id,
            user_name: profile?.full_name || 'Unknown',
            user_email: profile?.email || user.email,
            items: data.items,
            quantity: parseInt(data.quantity, 10),
            address: data.address,
            notes: data.notes,
            status: 'pending'
          }
        ]);

      if (error) throw error;

      // Award points to the user (10 points per item)
      const pointsToAdd = parseInt(data.quantity, 10) * 10;
      
      const { error: pointsError } = await supabase.rpc('add_points', {
        user_id: user.id,
        points_to_add: pointsToAdd
      });
      
      if (pointsError) {
        console.error('Error adding points:', pointsError);
        // Continue even if points couldn't be added
      }

      // Notify recyclers (in a real app, this would call a serverless function)
      console.log('Pickup request created successfully');
      
      onSuccess();
    } catch (error) {
      console.error('Error creating pickup request:', error);
      alert('There was an error creating your pickup request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Request E-Waste Pickup</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label htmlFor="items" className="block text-sm font-medium text-gray-700 mb-1">
              Items to Pickup *
            </label>
            <input
              id="items"
              {...register('items', { required: 'Items are required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="e.g., Old laptop, broken phone, etc."
            />
            {errors.items && (
              <p className="mt-1 text-sm text-red-600">{errors.items.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
              Quantity *
            </label>
            <input
              id="quantity"
              type="number"
              min="1"
              {...register('quantity', { 
                required: 'Quantity is required',
                min: { value: 1, message: 'Quantity must be at least 1' }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Number of items"
            />
            {errors.quantity && (
              <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Pickup Address *
            </label>
            <textarea
              id="address"
              rows={3}
              {...register('address', { required: 'Address is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Your full address for pickup"
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes
            </label>
            <textarea
              id="notes"
              rows={3}
              {...register('notes')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Any special instructions or details"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}