import { create } from 'zustand';
import { api } from '../api/api';
import { useAuthStore } from './useAuthStore';

export const useUserStore = create((set) => ({
  profile: null,
  onboarding: null,
  settings: null,
  peerProfile: null,
  loading: false,
  error: null,

  fetchMe: async () => {
    set({ loading: true, error: null });
    try {
      const profile = await api.get('/me');
      set({ profile, loading: false });
      
      // Also update the auth store's user reference if it's there
      if (useAuthStore.getState().user) {
          useAuthStore.setState({ user: profile });
      }

      return profile;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchOnboarding: async () => {
    set({ loading: true, error: null });
    try {
      const onboarding = await api.get('/me/onboarding');
      set({ onboarding, loading: false });
      return onboarding;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateProfile: async (data) => {
    set({ loading: true, error: null });
    try {
      const profile = await api.put('/me/profile', data);
      set({ profile, loading: false });
      
      if (useAuthStore.getState().user) {
          useAuthStore.setState({ user: profile });
      }
      
      return profile;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updatePhoto: async (profilePhotoUrl) => {
    set({ loading: true, error: null });
    try {
      const profile = await api.patch('/me/photo', { profilePhotoUrl });
      set({ profile, loading: false });
      
      if (useAuthStore.getState().user) {
          useAuthStore.setState({ user: profile });
      }
      
      return profile;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchSettings: async () => {
    set({ loading: true, error: null });
    try {
      const settings = await api.get('/me/settings');
      set({ settings, loading: false });
      return settings;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateSettings: async (data) => {
    set({ loading: true, error: null });
    try {
      const settings = await api.patch('/me/settings', data);
      set({ settings, loading: false });
      return settings;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  registerDevice: async (token, platform) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/me/devices', { token, platform });
      set({ loading: false });
      return response;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  unregisterDevice: async (token) => {
    set({ loading: true, error: null });
    try {
      const response = await api.delete(`/me/devices/${token}`);
      set({ loading: false });
      return response;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  heartbeat: async () => {
    // Don't set loading state for background heartbeats to avoid UI flicker
    try {
      return await api.post('/me/heartbeat');
    } catch (error) {
      console.warn("Heartbeat failed", error);
      // Don't throw or set error to avoid polluting the state for background task
    }
  },

  logoutEverywhere: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/me/logout-all');
      set({ profile: null, settings: null, onboarding: null, loading: false });
      useAuthStore.getState().logout();
      return response;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteAccount: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.delete('/me');
      set({ profile: null, settings: null, onboarding: null, loading: false });
      useAuthStore.getState().logout();
      return response;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchPeerProfile: async (userId) => {
    set({ loading: true, error: null });
    try {
      const peerProfile = await api.get(`/users/${userId}`);
      set({ peerProfile, loading: false });
      return peerProfile;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  }
}));
