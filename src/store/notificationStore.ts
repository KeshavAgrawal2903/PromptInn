import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'booking' | 'payment' | 'system';
  read: boolean;
  created_at: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  createNotification: (title: string, message: string, type: Notification['type']) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  fetchNotifications: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const notifications = data as Notification[];
      const unreadCount = notifications.filter(n => !n.read).length;

      set({ notifications, unreadCount, loading: false });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      set({ loading: false });
    }
  },
  markAsRead: async (id) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        notifications: state.notifications.map(n =>
          n.id === id ? { ...n, read: true } : n
        ),
        unreadCount: state.unreadCount - 1
      }));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  },
  createNotification: async (title, message, type) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('notifications')
        .insert([{
          user_id: user.id,
          title,
          message,
          type
        }]);

      if (error) throw error;

      // Refresh notifications
      await get().fetchNotifications();
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }
}));