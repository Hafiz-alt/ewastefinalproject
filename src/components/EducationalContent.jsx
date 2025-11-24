import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';

export default function EducationalContent() {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data, error } = await supabase
          .from('educational_content')
          .select('*, profiles(full_name)')
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        setContent(data || []);
      } catch (error) {
        console.error('Error fetching educational content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {content.map((item) => (
        <div key={item.id} className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {item.title}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              By {item.profiles?.full_name || 'Unknown Author'} • {format(new Date(item.created_at), 'MMM d, yyyy')}
            </p>
            <div className="prose max-w-none">
              {item.content}
            </div>
            {item.resources && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Additional Resources</h4>
                <ul className="list-disc pl-5 text-sm text-emerald-600">
                  {item.resources.map((resource, index) => (
                    <li key={index}>
                      <a href={resource.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {resource.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      ))}
      {content.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No educational content available yet
        </div>
      )}
    </div>
  );
}