import { create } from 'zustand';
import { api } from '../api/api';
import { useUserStore } from './useUserStore';

export const useModerationStore = create((set) => ({
  blockedUsers: [],
  verificationStatus: null,
  loading: false,
  error: null,

  blockUser: async (userId) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/safety/block', { userId });
      // Refresh blocked list
      const blockedUsers = await api.get('/safety/blocked');
      set({ blockedUsers, loading: false });
      return response;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  unblockUser: async (userId) => {
    set({ loading: true, error: null });
    try {
      const response = await api.delete(`/safety/block/${userId}`);
      // Refresh blocked list
      const blockedUsers = await api.get('/safety/blocked');
      set({ blockedUsers, loading: false });
      return response;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchBlockedUsers: async () => {
    set({ loading: true, error: null });
    try {
      const blockedUsers = await api.get('/safety/blocked');
      set({ blockedUsers, loading: false });
      return blockedUsers;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  reportUser: async (userId, reason) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/safety/report', { userId, reason });
      set({ loading: false });
      return response;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchVerificationStatus: async () => {
    set({ loading: true, error: null });
    try {
      const verificationStatus = await api.get('/verification');
      set({ verificationStatus, loading: false });
      return verificationStatus;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  uploadDocument: async (documentType, documentUrl, collegeId) => {
    set({ loading: true, error: null });
    try {
      await api.post('/verification/documents', { documentType, documentUrl, collegeId });
      // Fetch latest status which will include the new document
      const verificationStatus = await api.get('/verification');
      set({ verificationStatus, loading: false });

      // Verification status also affects onboarding state
      useUserStore.getState().fetchOnboarding();

      return verificationStatus;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  requestCollegeEmailOtp: async (email) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/verification/college-email', { email });
      set({ loading: false });
      return response;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  confirmCollegeEmailOtp: async (email, code) => {
    set({ loading: true, error: null });
    try {
      const verificationStatus = await api.post('/verification/college-email/confirm', { email, code });
      set({ verificationStatus, loading: false });
      useUserStore.getState().fetchOnboarding();
      return verificationStatus;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  }
}));
