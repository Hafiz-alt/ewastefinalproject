import React, { useState, useEffect } from 'react';
import { Lightbulb, Loader2, AlertCircle } from 'lucide-react';
import { getRecyclingRecommendations, estimateEnvironmentalImpact } from '../lib/ai';

export default function AIRecommendations({ item }) {
  const [recommendations, setRecommendations] = useState(null);
  const [impact, setImpact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch recommendations and impact in parallel
        const [recResponse, impactResponse] = await Promise.all([
          getRecyclingRecommendations(item.description),
          estimateEnvironmentalImpact(item)
        ]);

        setRecommendations(recResponse);
        setImpact(impactResponse);
      } catch (err) {
        console.error('Error fetching AI recommendations:', err);
        setError('Failed to load recommendations. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (item) {
      fetchRecommendations();
    }
  }, [item]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-lg flex items-center text-red-700">
        <AlertCircle className="h-5 w-5 mr-2" />
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Recycling Recommendations */}
      <div className="bg-emerald-50 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <Lightbulb className="h-6 w-6 text-emerald-600 mr-2" />
          <h3 className="text-lg font-medium text-emerald-900">AI Recycling Recommendations</h3>
        </div>
        <div className="prose prose-emerald max-w-none">
          <p className="text-emerald-800">{recommendations}</p>
        </div>
      </div>

      {/* Environmental Impact */}
      {impact && (
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-4">Environmental Impact</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(impact).map(([key, value]) => (
              <div key={key} className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-500 capitalize">{key}</p>
                <p className="text-lg font-medium text-blue-700">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}