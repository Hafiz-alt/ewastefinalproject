import React, { useState } from 'react';
import { X, Plus, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function CreateContentModal({ onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [content, setContent] = useState({
    title: '',
    content: '',
    resources: []
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to create content');
      }

      // Create the content
      const { data, error } = await supabase
        .from('educational_content')
        .insert([
          {
            author_id: user.id,
            title: content.title,
            content: content.content,
            resources: content.resources
          }
        ])
        .select();

      if (error) throw error;

      onSuccess(data[0]);
      onClose();
    } catch (err) {
      console.error('Error creating content:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addResource = () => {
    setContent(prev => ({
      ...prev,
      resources: [...prev.resources, { title: '', url: '' }]
    }));
  };

  const updateResource = (index, field, value) => {
    const updatedResources = [...content.resources];
    updatedResources[index] = {
      ...updatedResources[index],
      [field]: value
    };
    setContent(prev => ({
      ...prev,
      resources: updatedResources
    }));
  };

  const removeResource = (index) => {
    setContent(prev => ({
      ...prev,
      resources: prev.resources.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Create Educational Content</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-4 text-sm text-red-600 bg-red-50 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={content.title}
                onChange={(e) => setContent(prev => ({ ...prev, title: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                Content
              </label>
              <textarea
                id="content"
                rows={8}
                value={content.content}
                onChange={(e) => setContent(prev => ({ ...prev, content: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Additional Resources
                </label>
                <button
                  type="button"
                  onClick={addResource}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-emerald-700 bg-emerald-100 hover:bg-emerald-200"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Resource
                </button>
              </div>

              <div className="space-y-3">
                {content.resources.map((resource, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Resource title"
                      value={resource.title}
                      onChange={(e) => updateResource(index, 'title', e.target.value)}
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                    />
                    <input
                      type="url"
                      placeholder="Resource URL"
                      value={resource.url}
                      onChange={(e) => updateResource(index, 'url', e.target.value)}
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeResource(index)}
                      className="p-2 text-red-600 hover:text-red-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2 inline" />
                  Creating...
                </>
              ) : (
                'Create Content'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}