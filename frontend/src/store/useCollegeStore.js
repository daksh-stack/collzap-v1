import { create } from 'zustand';
import { api } from '../api/api';

export const useCollegeStore = create((set) => ({
  colleges: [],
  selectedCollege: null,
  loading: false,
  error: null,

  fetchColleges: async () => {
    set({ loading: true, error: null });
    try {
      // Open endpoint, no token needed usually but api instance handles it if present
      const colleges = await api.get('/colleges');
      set({ colleges, loading: false });
      return colleges;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchCollege: async (collegeId) => {
    set({ loading: true, error: null });
    try {
      const college = await api.get(`/colleges/${collegeId}`);
      set({ selectedCollege: college, loading: false });
      return college;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  }
}));
