import { create } from 'zustand';
import { api } from '../api/api';

export const useMatchStore = create((set) => ({
  findResults: null,
  circle: null,
  currentGroup: null,
  loading: false,
  error: null,

  findMatches: async () => {
    set({ loading: true, error: null });
    try {
      const findResults = await api.post('/matches/find');
      set({ findResults, loading: false });
      return findResults;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchCircle: async () => {
    set({ loading: true, error: null });
    try {
      const circle = await api.get('/matches/circle');
      set({ circle, loading: false });
      return circle;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchGroup: async (groupId) => {
    set({ loading: true, error: null });
    try {
      const currentGroup = await api.get(`/matches/${groupId}`);
      set({ currentGroup, loading: false });
      return currentGroup;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  leaveGroup: async (groupId) => {
    set({ loading: true, error: null });
    try {
      const response = await api.delete(`/matches/${groupId}/members/me`);
      set({ currentGroup: null, loading: false });
      
      // Refresh circle if we just left a group
      // get().fetchCircle() would work, but typically components refetch on mount
      return response;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  }
}));
