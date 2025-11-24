import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Award, Gift, AlertCircle, Check } from 'lucide-react';

export default function RewardsSection() {
  const [rewards, setRewards] = useState([]);
  const [userRewards, setUserRewards] = useState([]);
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchRewards();
    fetchUserData();
  }, []);

  const fetchRewards = async () => {
    try {
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .eq('is_active', true)
        .order('points_required', { ascending: true });

      if (error) throw error;
      setRewards(data || []);
    } catch (error) {
      console.error('Error fetching rewards:', error);
    }
  };

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      // Get user profile including points
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('points')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      setUserPoints(profile.points || 0);

      // Get user's redeemed rewards
      const { data: rewards, error: rewardsError } = await supabase
        .from('user_rewards')
        .select(`
          *,
          reward:rewards(*)
        `)
        .eq('user_id', user.id)
        .order('redeemed_at', { ascending: false });

      if (rewardsError) throw rewardsError;
      setUserRewards(rewards || []);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (reward) => {
    try {
      setRedeeming(true);
      setMessage({ text: '', type: '' });

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setMessage({ 
          text: 'You must be logged in to redeem rewards', 
          type: 'error' 
        });
        return;
      }

      // Check if user has enough points
      if (userPoints < reward.points_required) {
        setMessage({ 
          text: 'You don\'t have enough points to redeem this reward', 
          type: 'error' 
        });
        return;
      }

      // Generate a random code
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();

      // Start a transaction
      // 1. Deduct points from user
      const { error: updateError } = await supabase.rpc('deduct_points', {
        user_id: user.id,
        points_to_deduct: reward.points_required
      });

      if (updateError) throw updateError;

      // 2. Create user reward
      const { error: rewardError } = await supabase
        .from('user_rewards')
        .insert([
          {
            user_id: user.id,
            reward_id: reward.id,
            code: code
          }
        ]);

      if (rewardError) throw rewardError;

      // Update local state
      setUserPoints(userPoints - reward.points_required);
      setMessage({ 
        text: `Successfully redeemed ${reward.title}! Your code is ${code}`, 
        type: 'success' 
      });

      // Refresh user rewards
      fetchUserData();
    } catch (error) {
      console.error('Error redeeming reward:', error);
      setMessage({ 
        text: 'There was an error redeeming your reward. Please try again.', 
        type: 'error' 
      });
    } finally {
      setRedeeming(false);
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
      {message.text && (
        <div className={`p-4 rounded-lg ${
          message.type === 'error' ? 'bg-red-50 text-red-800' : 'bg-emerald-50 text-emerald-800'
        }`}>
          <div className="flex items-center">
            {message.type === 'error' ? (
              <AlertCircle className="h-5 w-5 mr-2" />
            ) : (
              <Check className="h-5 w-5 mr-2" />
            )}
            <p>{message.text}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Your Points</h3>
          <div className="flex items-center bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
            <Award className="h-5 w-5 mr-2" />
            <span className="font-semibold">{userPoints} points</span>
          </div>
        </div>
        <p className="text-gray-600">
          Earn points by recycling e-waste and completing other eco-friendly actions. 
          Redeem your points for discounts on marketplace purchases.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Rewards</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rewards.map((reward) => (
            <div key={reward.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-semibold text-gray-900">{reward.title}</h4>
                  <div className="flex items-center text-amber-600">
                    <Award className="h-4 w-4 mr-1" />
                    <span>{reward.points_required}</span>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">{reward.description}</p>
                <button
                  onClick={() => handleRedeem(reward)}
                  disabled={redeeming || userPoints < reward.points_required}
                  className={`w-full py-2 px-4 rounded-md flex items-center justify-center ${
                    userPoints >= reward.points_required
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Gift className="h-4 w-4 mr-2" />
                  {redeeming ? 'Redeeming...' : 'Redeem Reward'}
                </button>
              </div>
            </div>
          ))}

          {rewards.length === 0 && (
            <div className="col-span-full text-center py-8 bg-white rounded-lg shadow-sm">
              <Gift className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No rewards available</h3>
              <p className="mt-1 text-sm text-gray-500">
                Check back later for new rewards.
              </p>
            </div>
          )}
        </div>
      </div>

      {userRewards.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Redeemed Rewards</h3>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {userRewards.map((userReward) => (
                <li key={userReward.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{userReward.reward.title}</h4>
                      <p className="text-sm text-gray-500">
                        Redeemed on {new Date(userReward.redeemed_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        userReward.is_used ? 'bg-gray-100 text-gray-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {userReward.is_used ? 'Used' : 'Available'}
                      </span>
                      <p className="text-sm font-mono mt-1">{userReward.code}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}