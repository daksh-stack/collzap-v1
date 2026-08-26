import { create } from 'zustand';
import { api } from '../api/api';

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  pagination: {
    page: 0,
    totalPages: 1,
    last: true
  },
  loading: false,
  error: null,

  fetchNotifications: async (page = 0) => {
    set({ loading: page === 0, error: null }); // Only set loading for initial fetch
    try {
      const response = await api.get(`/notifications?page=${page}`);
      
      set((state) => {
        const newNotifications = page === 0 
          ? response.content 
          : [...state.notifications, ...response.content]; // Append older notifications

        return {
          notifications: newNotifications,
          pagination: {
            page: response.page,
            totalPages: response.totalPages,
            last: response.last
          },
          loading: false
        };
      });
      return response;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchUnreadCount: async () => {
    try {
      const response = await api.get('/notifications/unread-count');
      set({ unreadCount: response.unreadCount });
      return response.unreadCount;
    } catch (error) {
      console.warn("Failed to fetch unread count", error);
    }
  },

  markAllRead: async () => {
    try {
      await api.post('/notifications/read-all');
      
      // Update local state proactively
      set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0
      }));
    } catch (error) {
      console.warn("Failed to mark all read", error);
    }
  },

  markRead: async (notificationId) => {
    try {
      const updatedNotification = await api.post(`/notifications/${notificationId}/read`);
      
      set((state) => ({
        notifications: state.notifications.map(n => 
          n.id === notificationId ? updatedNotification : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      }));
      
      return updatedNotification;
    } catch (error) {
      console.warn("Failed to mark read", error);
      throw error;
    }
  },
  
  // Local action for when a push notification is received while app is open
  addIncomingNotification: (notification) => {
      set((state) => ({
          notifications: [notification, ...state.notifications],
          unreadCount: state.unreadCount + 1
      }));
  }
}));
