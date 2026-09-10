import { create } from 'zustand';
import { api } from '../api/api';
import { useUserStore } from './useUserStore';

export const useTestStore = create((set) => ({
  eligibility: null,
  session: null,
  result: null,
  loading: false,
  error: null,

  /**
   * True once starting a sitting has failed (most often because the question
   * bank for a chosen interest is empty, which the backend reports as a 409).
   *
   * OnboardingGuard reads this and stops forcing navigation to /test. That is
   * what breaks the /test -> /onboarding -> /test loop: deliberately NOT reset
   * on mount, so a failure stays sticky until the user retries or a sitting
   * actually starts.
   */
  startBlocked: false,

  clearStartBlocked: () => set({ startBlocked: false }),

  resetTestState: () => {
    set({ session: null, result: null, error: null, loading: false, startBlocked: false });
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
      set({ session, result: null, loading: false, startBlocked: false });
      return session;
    } catch (error) {
      // Sticky: the guard uses this to stop bouncing the user back to /test.
      set({ error: error.message, loading: false, startBlocked: true });
      throw error;
    }
  },

  fetchCurrentSession: async () => {
    set({ loading: true, error: null });
    try {
      const session = await api.get('/test/sessions/current');
      set({ session, loading: false, startBlocked: false });
      return session;
    } catch (error) {
      // A 404 here just means "no sitting in progress" — not a blocked state.
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  submitAnswer: async (questionId, selectedOptionIndex) => {
    // Don't set loading true for every answer to avoid UI jank, just catch errors
    try {
      const response = await api.post(`/test/answers`, {
        questionId,
        selectedOptionIndex
      });
      
      set((state) => {
        if (!state.session || !state.session.questions) return state;
        const newQuestions = state.session.questions.map((q) => 
          q.questionId === questionId ? { ...q, selectedOptionIndex } : q
        );
        return { session: { ...state.session, questions: newQuestions } };
      });

      return response; // { answeredCount, totalQuestions }
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  submitTest: async () => {
    set({ loading: true, error: null });
    try {
      const result = await api.post(`/test/submit`);
      set({ result, session: null, loading: false });
      
      // Test completion affects onboarding state
      useUserStore.getState().fetchOnboarding();
      
      return result;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchResult: async () => {
    set({ loading: true, error: null });
    try {
      const result = await api.get(`/test/result`);
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
      const result = await api.get('/test/latest-result');
      set({ result, loading: false });
      return result;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  }
}));
