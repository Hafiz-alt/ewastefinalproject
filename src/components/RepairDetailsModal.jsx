import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, MessageSquare, PenTool as Tool, Calendar, MapPin, User, Phone, Mail, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import RepairStatusTracker from './RepairStatusTracker';

export default function RepairDetailsModal({ repair, onClose, onUpdate, userRole }) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [estimatedCost, setEstimatedCost] = useState(repair?.estimated_cost || '');
  const [estimatedCompletion, setEstimatedCompletion] = useState(repair?.estimated_completion || '');
  const [showCostInput, setShowCostInput] = useState(false);
  const [showDateInput, setShowDateInput] = useState(false);

  useEffect(() => {
    fetchUpdates();
    fetchCurrentUser();
  }, [repair?.id]);

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
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('There was an error sending your message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateCost = async () => {
    try {
      setIsSubmitting(true);
      
      if (!estimatedCost || isNaN(parseFloat(estimatedCost))) {
        alert('Please enter a valid cost estimate');
        return;
      }
      
      const { error } = await supabase
        .from('repair_requests')
        .update({ 
          estimated_cost: parseFloat(estimatedCost),
          updated_at: new Date().toISOString()
        })
        .eq('id', repair.id);

      if (error) throw error;

      // Add a message about the cost estimate
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('repair_updates')
          .insert([
            {
              repair_id: repair.id,
              author_id: user.id,
              message: `Estimated repair cost: $${parseFloat(estimatedCost).toFixed(2)}`
            }
          ]);
      }
      
      setShowCostInput(false);
      
      if (onUpdate) {
        onUpdate();
      }
      
      // Refresh updates
      fetchUpdates();
    } catch (error) {
      console.error('Error updating cost:', error);
      alert('There was an error updating the cost. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateCompletionDate = async () => {
    try {
      setIsSubmitting(true);
      
      if (!estimatedCompletion) {
        alert('Please select a valid completion date');
        return;
      }
      
      const { error } = await supabase
        .from('repair_requests')
        .update({ 
          estimated_completion: estimatedCompletion,
          updated_at: new Date().toISOString()
        })
        .eq('id', repair.id);

      if (error) throw error;

      // Add a message about the estimated completion
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('repair_updates')
          .insert([
            {
              repair_id: repair.id,
              author_id: user.id,
              message: `Estimated completion date: ${format(new Date(estimatedCompletion), 'PPP')}`
            }
          ]);
      }
      
      setShowDateInput(false);
      
      if (onUpdate) {
        onUpdate();
      }
      
      // Refresh updates
      fetchUpdates();
    } catch (error) {
      console.error('Error updating completion date:', error);
      alert('There was an error updating the completion date. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isTechnician = userRole === 'technician' || currentUser?.role === 'technician';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Tool className="w-5 h-5 text-emerald-600 mr-2" />
            {repair.device_type} {repair.device_model} Repair
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Status Tracker */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Repair Status</h3>
              <RepairStatusTracker 
                status={repair.status} 
                estimatedCompletion={repair.estimated_completion}
              />
            </div>
            
            {/* Repair Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Device Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div className="flex items-start gap-2">
                      <Tool className="w-5 h-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Device</p>
                        <p className="font-medium">{repair.device_type} - {repair.device_model}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Issue</p>
                        <p>{repair.issue_description}</p>
                      </div>
                    </div>
                    
                    {repair.notes && (
                      <div className="flex items-start gap-2">
                        <MessageSquare className="w-5 h-5 text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Additional Notes</p>
                          <p>{repair.notes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {repair.images && repair.images.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Device Images</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {repair.images.map((url, index) => (
                        <a 
                          key={index} 
                          href={url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <img
                            src={url}
                            alt={`Device image ${index + 1}`}
                            className="h-32 w-full object-cover rounded-md hover:opacity-80 transition-opacity"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Customer Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div className="flex items-start gap-2">
                      <User className="w-5 h-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Customer</p>
                        <p className="font-medium">{repair.user_name}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <Mail className="w-5 h-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p>{repair.user_email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Address</p>
                        <p>{repair.address}</p>
                      </div>
                    </div>
                    
                    {repair.preferred_date && (
                      <div className="flex items-start gap-2">
                        <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Preferred Pickup Date</p>
                          <p>{format(new Date(repair.preferred_date), 'PPP')}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Repair Details</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div className="flex items-start gap-2">
                      <Clock className="w-5 h-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Request Date</p>
                        <p>{format(new Date(repair.created_at), 'PPP')}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 flex-shrink-0">💰</div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Estimated Cost</p>
                        {showCostInput ? (
                          <div className="flex items-center mt-1">
                            <span className="text-gray-500 mr-1">$</span>
                            <input
                              type="number"
                              value={estimatedCost}
                              onChange={(e) => setEstimatedCost(e.target.value)}
                              className="w-24 px-2 py-1 border border-gray-300 rounded-md"
                              placeholder="0.00"
                              min="0"
                              step="0.01"
                            />
                            <button
                              onClick={updateCost}
                              disabled={isSubmitting}
                              className="ml-2 px-2 py-1 bg-emerald-600 text-white text-sm rounded-md hover:bg-emerald-700 disabled:opacity-50"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setShowCostInput(false)}
                              className="ml-1 px-2 py-1 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <p>{repair.estimated_cost ? `$${repair.estimated_cost}` : 'Not set'}</p>
                            {isTechnician && repair.status !== 'cancelled' && repair.status !== 'completed' && (
                              <button
                                onClick={() => setShowCostInput(true)}
                                className="ml-2 text-xs text-emerald-600 hover:text-emerald-700"
                              >
                                {repair.estimated_cost ? 'Update' : 'Set estimate'}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Estimated Completion</p>
                        {showDateInput ? (
                          <div className="flex items-center mt-1">
                            <input
                              type="date"
                              value={estimatedCompletion}
                              onChange={(e) => setEstimatedCompletion(e.target.value)}
                              className="w-40 px-2 py-1 border border-gray-300 rounded-md"
                              min={new Date().toISOString().split('T')[0]}
                            />
                            <button
                              onClick={updateCompletionDate}
                              disabled={isSubmitting}
                              className="ml-2 px-2 py-1 bg-emerald-600 text-white text-sm rounded-md hover:bg-emerald-700 disabled:opacity-50"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setShowDateInput(false)}
                              className="ml-1 px-2 py-1 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <p>{repair.estimated_completion ? format(new Date(repair.estimated_completion), 'PPP') : 'Not set'}</p>
                            {isTechnician && repair.status !== 'cancelled' && repair.status !== 'completed' && (
                              <button
                                onClick={() => setShowDateInput(true)}
                                className="ml-2 text-xs text-emerald-600 hover:text-emerald-700"
                              >
                                {repair.estimated_completion ? 'Update' : 'Set date'}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Communication History */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Communication History</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                {loading ? (
                  <div className="flex justify-center items-center h-24">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
                  </div>
                ) : updates.length > 0 ? (
                  <div className="space-y-4">
                    {updates.map((update) => (
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
                    ))}
                  </div>
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
              </div>
            </div>
          </div>
        </div>

        {/* Message Form */}
        {repair.status !== 'cancelled' && repair.status !== 'completed' && (
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 border-t">
            <div className="mb-4">
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Send a Message
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
                disabled={isSubmitting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}