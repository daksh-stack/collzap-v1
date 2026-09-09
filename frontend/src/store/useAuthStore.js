import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { api, API_BASE } from '../api/api';
import axios from 'axios';
import { webSocketService } from '../services/websocket';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      nextStep: null,
      loading: false,
      error: null,

      signup: async (email, password, name) => {
        set({ loading: true, error: null });
        try {
          const response = await api.post('/auth/signup', { email, password, name });
          set({
            user: response.user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            nextStep: response.nextStep,
            loading: false,
          });
          return response; // also carries otpExpiresInSeconds
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const response = await api.post('/auth/login', { email, password });
          set({
            user: response.user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            nextStep: response.nextStep,
            loading: false,
          });
          return response;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      verifyEmail: async (code) => {
        set({ loading: true, error: null });
        try {
          const onboarding = await api.post('/me/verify-email', { code });
          set({ nextStep: onboarding.step, loading: false });
          return onboarding;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      resendVerifyEmail: async () => {
        return api.post('/me/verify-email/resend');
      },

      forgotPassword: async (email) => {
        set({ loading: true, error: null });
        try {
          const response = await api.post('/auth/forgot-password', { email });
          set({ loading: false });
          return response;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      resetPassword: async (email, code, newPassword) => {
        set({ loading: true, error: null });
        try {
          const response = await api.post('/auth/reset-password', { email, code, newPassword });
          set({
            user: response.user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            nextStep: response.nextStep,
            loading: false,
          });
          return response;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      refresh: async () => {
        const { refreshToken } = get();
        if (!refreshToken) throw new Error("No refresh token available");

        // Use raw axios here to avoid interceptor loops if refresh fails
        try {
          const response = await axios.post(`${API_BASE}/auth/refresh`, {
            refreshToken
          });

          // AccessTokenResponse: { accessToken, tokenType, expiresInSeconds }.
          // The backend does not rotate refresh tokens, so we keep the existing one.
          const data = response.data;
          set({
            accessToken: data.accessToken,
            isAuthenticated: true,
          });
          return data;
        } catch (error) {
          // If refresh fails, clear auth state
          get().logout();
          throw error;
        }
      },

      logout: async () => {
        const { refreshToken } = get();
        if (refreshToken) {
            try {
                await api.post('/auth/logout', { refreshToken });
            } catch (error) {
                // Ignore errors on logout (e.g. token already invalid)
                console.warn('Logout request failed', error);
            }
        }

        webSocketService.disconnect();

        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          nextStep: null,
          error: null,
        });
      },

      adminLogin: async (username, password) => {
        set({ loading: true, error: null });
        try {
          const response = await api.post('/admin/auth/login', { username, password });

          // AdminAuthResponse is not a UserResponse, so build a minimal user object.
          const adminUser = {
              name: response.username,
              role: response.role,
              isAdmin: true
          };

          // AdminAuthResponse carries no refresh token — the session lasts until
          // the JWT expires. Store null rather than undefined so the 401
          // interceptor can tell "admin, cannot refresh" from "student".
          set({
            user: adminUser,
            accessToken: response.accessToken,
            refreshToken: null,
            isAuthenticated: true,
            nextStep: null,
            loading: false
          });
          return response;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage', // name of item in storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default the 'localStorage' is used
      // We don't want to persist loading and error states
      partialize: (state) => ({
          user: state.user,
          accessToken: state.accessToken,
          refreshToken: state.refreshToken,
          isAuthenticated: state.isAuthenticated,
          nextStep: state.nextStep
      }),
    }
  )
);
