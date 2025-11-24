import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../../lib/supabase';
import { Upload, X, Loader2, ArrowLeft } from 'lucide-react';

const categories = [
  'Smartphones',
  'Laptops',
  'Tablets',
  'Desktops',
  'Monitors',
  'Accessories',
  'Other',
];

const conditions = [
  { value: 'like_new', label: 'Like New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
];

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  category: z.enum(categories),
  condition: z.enum(['like_new', 'good', 'fair']),
});

export default function SellItem() {
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState([]);
  const [uploadError, setUploadError] = useState('');
  const [user, setUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/login', { state: { message: 'Please log in to sell items' } });
          return;
        }
        
        // Get user profile
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
          
        if (error) {
          console.error('Error fetching profile:', error);
          setErrorMessage('Error fetching your profile. Please try again.');
          return;
        }
        
        setUser(user);
      } catch (error) {
        console.error('Authentication error:', error);
        setErrorMessage('Authentication error. Please try again.');
      }
    };
    
    checkAuth();
  }, [navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      category: categories[0],
      condition: 'like_new',
      price: ''
    }
  });

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
      
      if (!user) {
        navigate('/login');
        return;
      }

      // Create the product with proper handling of images
      const { data: product, error } = await supabase
        .from('products')
        .insert([
          {
            seller_id: user.id,
            title: data.title,
            description: data.description,
            price: data.price,
            category: data.category,
            condition: data.condition,
            images: images.length > 0 ? images : [], // Always provide an array, even if empty
            status: 'available'
          },
        ])
        .select();

      if (error) {
        console.error('Error creating product:', error);
        setErrorMessage('Failed to create listing: ' + error.message);
        return;
      }

      // Success - redirect to marketplace
      reset();
      setImages([]);
      navigate('/marketplace', { 
        state: { message: 'Your item has been listed successfully!' } 
      });
    } catch (error) {
      console.error('Error creating product:', error);
      setErrorMessage('There was an error creating your listing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate('/marketplace')}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Marketplace
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">List Your Item</h1>
          
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                {...register('title')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                placeholder="Enter product title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                {...register('description')}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                placeholder="Describe your item (condition, features, etc.)"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  {...register('price', { valueAsNumber: true })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                  placeholder="0.00"
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  {...register('category')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Condition</label>
              <select
                {...register('condition')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
              >
                {conditions.map((condition) => (
                  <option key={condition.value} value={condition.value}>
                    {condition.label}
                  </option>
                ))}
              </select>
              {errors.condition && (
                <p className="mt-1 text-sm text-red-600">{errors.condition.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Images (Optional)</label>
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
                        alt={`Product image ${index + 1}`}
                        className="h-24 w-full object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-100 rounded-full p-1 text-red-600 hover:bg-red-200"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/marketplace')}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || uploading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'Create Listing'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}