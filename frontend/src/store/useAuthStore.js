import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { api } from '../api/api';
import axios from 'axios';

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

      requestOtp: async (email, name = null) => {
        set({ loading: true, error: null });
        try {
          const payload = name ? { email, name } : { email };
          // For OTP request, we don't need auth, so we can use standard api call
          const response = await api.post('/auth/otp', payload);
          set({ loading: false });
          return response;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      verifyOtp: async (email, code, name = null) => {
        set({ loading: true, error: null });
        try {
          const payload = name ? { email, code, name } : { email, code };
          const response = await api.post('/auth/otp/verify', payload);
          
          set({ 
            user: response.user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            nextStep: response.nextStep,
            loading: false 
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
          const response = await axios.post('http://localhost:8081/api/auth/refresh', {
            refreshToken
          });
          
          const data = response.data;
          set({
            accessToken: data.accessToken,
            // Assuming refresh might return a new refresh token, otherwise keep old
            refreshToken: data.refreshToken || refreshToken,
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
          
          // Construct a mock user object for admin since it doesn't return a UserResponse
          const adminUser = {
              name: response.username,
              role: response.role,
              isAdmin: true
          };

          set({ 
            user: adminUser,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken, // Might not exist for admin
            isAuthenticated: true,
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
