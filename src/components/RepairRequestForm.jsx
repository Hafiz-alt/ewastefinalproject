import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../lib/supabase';
import { Upload, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const deviceTypes = [
  'Smartphone',
  'Laptop',
  'Desktop',
  'Tablet',
  'Monitor',
  'Printer',
  'Other'
];

const schema = z.object({
  deviceType: z.string().min(1, 'Device type is required'),
  deviceModel: z.string().min(1, 'Device model is required'),
  issueDescription: z.string().min(10, 'Description must be at least 10 characters'),
  address: z.string().min(5, 'Address is required'),
  preferredDate: z.string().optional(),
  notes: z.string().optional(),
});

export default function RepairRequestForm({ onSuccess, onCancel }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      deviceType: '',
      deviceModel: '',
      issueDescription: '',
      address: '',
      preferredDate: '',
      notes: ''
    }
  });

  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState([]);
  const [uploadError, setUploadError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 4) {
      setUploadError('Maximum 4 images allowed');
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      // For demo purposes, we'll use placeholder images
      // In a real app, you would upload to Supabase storage
      const demoImages = [
        'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=60'
      ];
      
      const newImages = demoImages.slice(0, files.length);
      setImages((prev) => [...prev, ...newImages]);
    } catch (error) {
      console.error('Error uploading images:', error);
      setUploadError('Error uploading images. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      setErrorMessage('');
      setSuccessMessage('');
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setErrorMessage('You must be logged in to request a repair');
        setIsSubmitting(false);
        return;
      }

      // Get user profile info
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        setErrorMessage('Error fetching your profile information');
        setIsSubmitting(false);
        return;
      }

      // Create repair request
      const { data: repairData, error } = await supabase
        .from('repair_requests')
        .insert([
          {
            user_id: user.id,
            user_name: profile?.full_name || 'Unknown',
            user_email: profile?.email || user.email,
            device_type: data.deviceType,
            device_model: data.deviceModel,
            issue_description: data.issueDescription,
            address: data.address,
            preferred_date: data.preferredDate || null,
            notes: data.notes,
            images: images.length > 0 ? images : null,
            status: 'pending'
          }
        ])
        .select();

      if (error) {
        console.error('Error creating repair request:', error);
        setErrorMessage(error.message || 'Error creating repair request');
        setIsSubmitting(false);
        return;
      }
      
      // Create initial notification message in repair_updates
      if (repairData && repairData.length > 0) {
        try {
          const { error: updateError } = await supabase
            .from('repair_updates')
            .insert([
              {
                repair_id: repairData[0].id,
                author_id: user.id,
                message: `New repair request submitted for ${data.deviceType} ${data.deviceModel}. Waiting for technician assignment.`
              }
            ]);
            
          if (updateError) {
            console.error('Error creating initial update:', updateError);
            // Continue even if this fails - it's not critical
          }
        } catch (updateError) {
          console.error('Error creating initial update:', updateError);
          // Continue even if this fails - it's not critical
        }
      }
      
      // Show success message
      setSuccessMessage('Repair request submitted successfully! A technician will be notified.');
      
      // Reset form
      reset();
      setImages([]);
      
      // Wait 2 seconds before calling onSuccess
      setTimeout(() => {
        if (onSuccess) {
          onSuccess(repairData && repairData.length > 0 ? repairData[0] : null);
        }
      }, 2000);
      
    } catch (error) {
      console.error('Error creating repair request:', error);
      setErrorMessage('There was an error creating your repair request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {successMessage && (
        <div className="p-4 bg-green-50 text-green-700 rounded-md flex items-center">
          <CheckCircle className="h-5 w-5 mr-2" />
          {successMessage}
        </div>
      )}
      
      {errorMessage && (
        <div className="p-4 bg-red-50 text-red-700 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {errorMessage}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="deviceType" className="block text-sm font-medium text-gray-700 mb-1">
              Device Type *
            </label>
            <select
              id="deviceType"
              {...register('deviceType')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">Select device type</option>
              {deviceTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.deviceType && (
              <p className="mt-1 text-sm text-red-600">{errors.deviceType.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="deviceModel" className="block text-sm font-medium text-gray-700 mb-1">
              Device Model *
            </label>
            <input
              id="deviceModel"
              type="text"
              {...register('deviceModel')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="e.g., iPhone 13, Dell XPS 15"
            />
            {errors.deviceModel && (
              <p className="mt-1 text-sm text-red-600">{errors.deviceModel.message}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="issueDescription" className="block text-sm font-medium text-gray-700 mb-1">
            Issue Description *
          </label>
          <textarea
            id="issueDescription"
            rows={3}
            {...register('issueDescription')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="Describe the issue with your device in detail"
          />
          {errors.issueDescription && (
            <p className="mt-1 text-sm text-red-600">{errors.issueDescription.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
            Pickup/Delivery Address *
          </label>
          <textarea
            id="address"
            rows={2}
            {...register('address')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="Your full address for device pickup or delivery"
          />
          {errors.address && (
            <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="preferredDate" className="block text-sm font-medium text-gray-700 mb-1">
            Preferred Pickup Date (Optional)
          </label>
          <input
            id="preferredDate"
            type="date"
            {...register('preferredDate')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
            min={new Date().toISOString().split('T')[0]}
          />
          {errors.preferredDate && (
            <p className="mt-1 text-sm text-red-600">{errors.preferredDate.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Device Images (Optional)
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label className="relative cursor-pointer bg-white rounded-md font-medium text-emerald-600 hover:text-emerald-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-emerald-500">
                  <span>Upload images</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="sr-only"
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB (max 4 images)</p>
            </div>
          </div>
          {uploadError && (
            <p className="mt-1 text-sm text-red-600">{uploadError}</p>
          )}
          {uploading && (
            <div className="mt-2 flex items-center justify-center text-sm text-gray-600">
              <Loader2 className="animate-spin h-4 w-4 mr-2" />
              Uploading...
            </div>
          )}
          {images.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {images.map((url, index) => (
                <div key={index} className="relative">
                  <img
                    src={url}
                    alt={`Device image ${index + 1}`}
                    className="h-16 w-full object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-100 rounded-full p-1 text-red-600 hover:bg-red-200"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Additional Notes
          </label>
          <textarea
            id="notes"
            rows={2}
            {...register('notes')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="Any special instructions or details"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting || successMessage}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  );
}