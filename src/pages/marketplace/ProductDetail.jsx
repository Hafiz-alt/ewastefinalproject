import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
  ChevronLeft,
  ChevronRight,
  Tag,
  User,
  Calendar,
  Shield,
  AlertTriangle,
  Award,
} from 'lucide-react';

const conditionLabels = {
  like_new: 'Like New',
  good: 'Good',
  fair: 'Fair',
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [purchasing, setPurchasing] = useState(false);
  const [userRewards, setUserRewards] = useState([]);
  const [selectedReward, setSelectedReward] = useState('');
  const [discountedPrice, setDiscountedPrice] = useState(0);
  const [originalPrice, setOriginalPrice] = useState(0);

  useEffect(() => {
    fetchProduct();
    fetchUserRewards();
  }, [id]);

  useEffect(() => {
    if (product) {
      setOriginalPrice(product.price);
      setDiscountedPrice(product.price);
    }
  }, [product]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          seller:profiles(full_name, email)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
      navigate('/marketplace');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRewards = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data, error } = await supabase
        .from('user_rewards')
        .select(`
          *,
          reward:rewards(*)
        `)
        .eq('user_id', user.id)
        .eq('is_used', false)
        .order('redeemed_at', { ascending: false });

      if (error) throw error;
      setUserRewards(data || []);
    } catch (error) {
      console.error('Error fetching user rewards:', error);
    }
  };

  const handleRewardChange = (e) => {
    const rewardId = e.target.value;
    setSelectedReward(rewardId);
    
    if (!rewardId) {
      setDiscountedPrice(originalPrice);
      return;
    }

    const selectedUserReward = userRewards.find(ur => ur.id === rewardId);
    if (selectedUserReward) {
      const discountPercentage = selectedUserReward.reward.discount_percentage;
      const newPrice = originalPrice * (1 - (discountPercentage / 100));
      setDiscountedPrice(Math.max(0, newPrice).toFixed(2));
    }
  };

  const handlePurchase = async () => {
    try {
      setPurchasing(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }

      // Get user's shipping address
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', user.id)
        .single();

      // Create order
      const { data: order, error } = await supabase
        .from('orders')
        .insert([
          {
            buyer_id: user.id,
            seller_id: product.seller_id,
            product_id: product.id,
            shipping_address: "Please update your shipping address", // In a real app, this would come from the user's profile or checkout form
            status: 'pending'
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Update product status
      await supabase
        .from('products')
        .update({ status: 'sold' })
        .eq('id', product.id);

      // If a reward was used, mark it as used
      if (selectedReward) {
        await supabase
          .from('user_rewards')
          .update({ 
            is_used: true,
            used_at: new Date().toISOString()
          })
          .eq('id', selectedReward);
      }

      // Navigate to orders page
      navigate('/marketplace/orders', { 
        state: { message: 'Order placed successfully!' } 
      });
    } catch (error) {
      console.error('Error initiating purchase:', error);
      alert('There was an error processing your purchase. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Product Not Found</h2>
        <p className="mt-2 text-gray-600">This product may have been removed or sold.</p>
        <button
          onClick={() => navigate('/marketplace')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700"
        >
          Back to Marketplace
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate('/marketplace')}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-8"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Marketplace
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-200">
                <img
                  src={product.images && product.images.length > 0 ? product.images[currentImageIndex] : 'https://images.unsplash.com/photo-1526406915894-7bcd65f60845?w=800&auto=format&fit=crop&q=60'}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
                {product.images && product.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1))}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 rounded-full p-2 hover:bg-white"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1))}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 rounded-full p-2 hover:bg-white"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}
              </div>
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`aspect-square rounded-lg overflow-hidden ${
                        index === currentImageIndex ? 'ring-2 ring-emerald-500' : ''
                      }`}
                    >
                      <img
                        src={image}
                        alt={`Product image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{product.title}</h1>
                <div className="mt-2 flex items-baseline">
                  {selectedReward && discountedPrice < originalPrice ? (
                    <>
                      <p className="text-3xl font-bold text-emerald-600">${discountedPrice}</p>
                      <p className="ml-2 text-lg line-through text-gray-500">${originalPrice}</p>
                    </>
                  ) : (
                    <p className="text-3xl font-bold text-emerald-600">${product.price}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  product.condition === 'like_new' ? 'bg-emerald-100 text-emerald-800' :
                  product.condition === 'good' ? 'bg-blue-100 text-blue-800' :
                  'bg-amber-100 text-amber-800'
                }`}>
                  {conditionLabels[product.condition]}
                </span>
                <div className="flex items-center text-gray-600">
                  <Tag className="h-4 w-4 mr-1" />
                  {product.category}
                </div>
              </div>

              <div className="prose max-w-none">
                <h3 className="text-lg font-medium text-gray-900">Description</h3>
                <p className="mt-2 text-gray-600">{product.description}</p>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center space-x-4">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Seller</p>
                    <p className="font-medium text-gray-900">{product.seller?.full_name || 'Unknown Seller'}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center space-x-4">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Listed</p>
                    <p className="font-medium text-gray-900">
                      {new Date(product.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {userRewards.length > 0 && product.status === 'available' && (
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center mb-2">
                    <Award className="h-5 w-5 text-emerald-600 mr-2" />
                    <h3 className="text-lg font-medium text-gray-900">Apply Reward</h3>
                  </div>
                  <select
                    value={selectedReward}
                    onChange={handleRewardChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                  >
                    <option value="">No reward</option>
                    {userRewards.map((userReward) => (
                      <option key={userReward.id} value={userReward.id}>
                        {userReward.reward.title} ({userReward.reward.discount_percentage}% off)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="border-t border-gray-200 pt-6">
                <button
                  onClick={handlePurchase}
                  disabled={purchasing || product.status !== 'available'}
                  className={`w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white ${
                    product.status === 'available' 
                      ? 'bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500' 
                      : 'bg-gray-400 cursor-not-allowed'
                  } disabled:opacity-50`}
                >
                  {purchasing ? 'Processing...' : 
                   product.status === 'available' ? 'Purchase Now' : 'Sold Out'}
                </button>
                <p className="mt-4 text-center text-sm text-gray-600 flex items-center justify-center">
                  <Shield className="h-4 w-4 mr-1" />
                  Secure transaction
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}