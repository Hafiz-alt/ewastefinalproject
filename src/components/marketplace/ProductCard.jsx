import React from 'react';
import { Link } from 'react-router-dom';
import { Tag, Star, ShoppingCart } from 'lucide-react';

const conditionColors = {
  like_new: 'bg-emerald-100 text-emerald-800',
  good: 'bg-blue-100 text-blue-800',
  fair: 'bg-amber-100 text-amber-800',
};

const conditionLabels = {
  like_new: 'Like New',
  good: 'Good',
  fair: 'Fair',
};

export default function ProductCard({ product }) {
  const mainImage = product.images[0] || 'https://images.unsplash.com/photo-1526406915894-7bcd65f60845?w=800&auto=format&fit=crop&q=60';

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative aspect-square">
        <img
          src={mainImage}
          alt={product.title}
          className="w-full h-full object-cover"
        />
        <div className={`absolute top-2 right-2 ${conditionColors[product.condition]} px-2 py-1 rounded-full text-xs font-medium`}>
          {conditionLabels[product.condition]}
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {product.title}
          </h3>
          <p className="text-lg font-bold text-emerald-600">
            ${product.price}
          </p>
        </div>
        
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Tag className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">{product.category}</span>
          </div>
          
          <Link
            to={`/marketplace/${product.id}`}
            className="inline-flex items-center px-3 py-2 border border-emerald-600 text-sm font-medium rounded-md text-emerald-600 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}