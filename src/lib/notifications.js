import { supabase } from './supabase';

/**
 * Creates a new notification for a user
 * @param {string} userId - The user ID to send the notification to
 * @param {string} title - The notification title
 * @param {string} message - The notification message
 * @param {string} type - The notification type (success, error, info, message, system)
 * @param {Object} data - Optional additional data for the notification
 * @returns {Promise<Object>} - The created notification
 */
export const createNotification = async (userId, title, message, type = 'info', data = null) => {
  try {
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert([
        {
          user_id: userId,
          title,
          message,
          type,
          data,
          read: false
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Marks a notification as read
 * @param {string} notificationId - The notification ID to mark as read
 * @returns {Promise<void>}
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) throw error;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Marks all notifications for a user as read
 * @param {string} userId - The user ID
 * @returns {Promise<void>}
 */
export const markAllNotificationsAsRead = async (userId) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

/**
 * Gets all notifications for a user
 * @param {string} userId - The user ID
 * @param {number} limit - The maximum number of notifications to return
 * @param {boolean} unreadOnly - Whether to only return unread notifications
 * @returns {Promise<Array>} - The notifications
 */
export const getNotifications = async (userId, limit = 20, unreadOnly = false) => {
  try {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (unreadOnly) {
      query = query.eq('read', false);
    }
    
    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting notifications:', error);
    throw error;
  }
};

/**
 * Gets the count of unread notifications for a user
 * @param {string} userId - The user ID
 * @returns {Promise<number>} - The count of unread notifications
 */
export const getUnreadNotificationCount = async (userId) => {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error getting unread notification count:', error);
    throw error;
  }
};