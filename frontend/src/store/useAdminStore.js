import { create } from 'zustand';
import { api } from '../api/api';

const defaultPage = { content: [], page: 0, totalPages: 1, last: true };

export const useAdminStore = create((set) => ({
  stats: null,
  users: defaultPage,
  verifications: defaultPage,
  matches: defaultPage,
  queue: [],
  reports: defaultPage,
  interestFeedback: defaultPage,
  loading: false,
  error: null,

  fetchStats: async () => {
    set({ loading: true, error: null });
    try {
      const stats = await api.get('/admin/stats');
      set({ stats, loading: false });
      return stats;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchUsers: async (search = null, status = null, page = 0) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams({ page });
      if (search) params.append('search', search);
      if (status) params.append('status', status);
      
      const users = await api.get(`/admin/users?${params.toString()}`);
      set({ users, loading: false });
      return users;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchUser: async (userId) => {
    set({ loading: true, error: null });
    try {
      const user = await api.get(`/admin/users/${userId}`);
      set({ loading: false });
      return user; // Usually component handles local state for single user view
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchPendingVerifications: async (page = 0) => {
    set({ loading: true, error: null });
    try {
      const verifications = await api.get(`/admin/verifications?page=${page}`);
      set({ verifications, loading: false });
      return verifications;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  reviewDocument: async (documentId, approve, note = null) => {
    set({ loading: true, error: null });
    try {
      const payload = note ? { approve, note } : { approve };
      const response = await api.post(`/admin/verifications/${documentId}/review`, payload);
      set({ loading: false });
      return response;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchMatches: async (status = null, page = 0) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams({ page });
      if (status) params.append('status', status);
      
      const matches = await api.get(`/admin/matches?${params.toString()}`);
      set({ matches, loading: false });
      return matches;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchQueue: async () => {
    set({ loading: true, error: null });
    try {
      const queue = await api.get('/admin/queue');
      set({ queue, loading: false });
      return queue;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  createMatch: async (userIds, interestId, connectionType, projectType) => {
    set({ loading: true, error: null });
    try {
      const payload = { userIds, interestId, connectionType, projectType };
      const response = await api.post('/admin/matches', payload);
      set({ loading: false });
      return response;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  unmatch: async (matchGroupId, userId = null) => {
    set({ loading: true, error: null });
    try {
      const payload = userId ? { matchGroupId, userId } : { matchGroupId };
      const response = await api.post('/admin/matches/unmatch', payload);
      set({ loading: false });
      return response;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchReports: async (page = 0) => {
    set({ loading: true, error: null });
    try {
      const reports = await api.get(`/admin/reports?page=${page}`);
      set({ reports, loading: false });
      return reports;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchInterestFeedback: async (page = 0) => {
    set({ loading: true, error: null });
    try {
      const interestFeedback = await api.get(`/admin/interest-feedback?page=${page}`);
      set({ interestFeedback, loading: false });
      return interestFeedback;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  createCollege: async (name, emailDomain, city = null) => {
    set({ loading: true, error: null });
    try {
      const payload = city ? { name, emailDomain, city } : { name, emailDomain };
      const response = await api.post('/admin/colleges', payload);
      set({ loading: false });
      return response;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  }
}));
