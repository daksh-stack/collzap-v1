import { create } from 'zustand';
import { api } from '../api/api';
import { useAuthStore } from './useAuthStore';

// Landing on an onboarding-guarded route fires `fetchOnboarding()` from more
// than one place at once (AuthGuard's bootstrap effect and OnboardingPage's
// own mount effect both call it on the same navigation) — module-level, not
// per-store-instance, since there is only ever one store. De-duping in-flight
// calls means that's one real network request instead of two racing ones.
let onboardingFetchInFlight = null;

export const useUserStore = create((set) => ({
  profile: null,
  onboarding: null,
  settings: null,
  peerProfile: null,
  loading: false,
  error: null,

  /**
   * There is no stored "current step" server-side — `onboarding.step` is always
   * recomputed fresh from the user's real data. So "back" is purely a display
   * override: OnboardingPage and OnboardingLayout both read this ahead of
   * `onboarding.step` when it's set. It's cleared the moment a fresh
   * `fetchOnboarding()` lands, which only ever happens right after the
   * revisited step's own "Continue" action saves successfully — real forward
   * progress always wins over a manual back.
   */
  viewStepOverride: null,
  setViewStepOverride: (step) => set({ viewStepOverride: step }),

  fetchMe: async () => {
    set({ loading: true, error: null });
    try {
      const profile = await api.get('/me');
      set({ profile, loading: false });
      
      // Also update the auth store's use r reference if it's there
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
    if (onboardingFetchInFlight) return onboardingFetchInFlight;

    set({ loading: true, error: null });
    onboardingFetchInFlight = (async () => {
      try {
        const onboarding = await api.get('/me/onboarding');
        set({ onboarding, loading: false, viewStepOverride: null });

        // Keep auth store's nextStep in sync so guards work correctly
        if (useAuthStore.getState().isAuthenticated) {
            useAuthStore.setState({ nextStep: onboarding.step });
        }

        return onboarding;
      } catch (error) {
        set({ error: error.message, loading: false });
        throw error;
      } finally {
        onboardingFetchInFlight = null;
      }
    })();

    return onboardingFetchInFlight;
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
