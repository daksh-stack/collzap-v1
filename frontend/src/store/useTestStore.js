import { create } from 'zustand';
import { api } from '../api/api';
import { useUserStore } from './useUserStore';

export const useTestStore = create((set) => ({
  eligibility: null,
  session: null,
  result: null,
  loading: false,
  error: null,

  resetTestState: () => {
    set({ session: null, result: null, error: null, loading: false });
  },

  checkEligibility: async () => {
    set({ loading: true, error: null });
    try {
      const eligibility = await api.get('/test/eligibility');
      set({ eligibility, loading: false });
      return eligibility;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  startSession: async () => {
    set({ loading: true, error: null, result: null });
    try {
      const session = await api.post('/test/sessions');
      set({ session, result: null, loading: false });
      return session;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchCurrentSession: async () => {
    set({ loading: true, error: null });
    try {
      const session = await api.get('/test/sessions/current');
      set({ session, loading: false });
      return session;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  submitAnswer: async (sessionId, questionId, selectedOptionIndex) => {
    // Don't set loading true for every answer to avoid UI jank, just catch errors
    try {
      const response = await api.post(`/test/sessions/${sessionId}/answers`, {
        questionId,
        selectedOptionIndex
      });
      return response; // { answeredCount, totalQuestions }
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  submitTest: async (sessionId) => {
    set({ loading: true, error: null });
    try {
      const result = await api.post(`/test/sessions/${sessionId}/submit`);
      set({ result, session: null, loading: false });
      
      // Test completion affects onboarding state
      useUserStore.getState().fetchOnboarding();
      
      return result;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchResult: async (sessionId) => {
    set({ loading: true, error: null });
    try {
      const result = await api.get(`/test/sessions/${sessionId}/result`);
      set({ result, loading: false });
      return result;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchLatestResult: async () => {
    set({ loading: true, error: null });
    try {
      const result = await api.get('/test/result');
      set({ result, loading: false });
      return result;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  }
}));
