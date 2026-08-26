import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

// Create a configured axios instance
export const api = axios.create({
  baseURL: 'http://localhost:8081/api', // Adjust if needed based on environments later
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach the access token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401s and automatic token refresh
api.interceptors.response.use(
  (response) => {
    return response.data; // Return just the data to simplify store logic
  },
  async (error) => {
    const originalRequest = error.config;

    // Normalize error format based on our backend's ErrorResponse shape
    let normalizedError = 'An unexpected error occurred';
    if (error.response && error.response.data) {
        if(typeof error.response.data.message === 'string') {
            normalizedError = error.response.data.message;
        } else if (typeof error.response.data === 'string') {
            normalizedError = error.response.data;
        }
    } else if (error.message) {
        normalizedError = error.message;
    }

    // If we get a 401 (Unauthorized) and it's not a retry attempt
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't intercept refresh token failures to avoid infinite loops
      if (originalRequest.url.includes('/auth/refresh')) {
        useAuthStore.getState().logout();
        return Promise.reject(new Error(normalizedError));
      }

      originalRequest._retry = true;

      try {
        // Attempt to refresh the token using the store's action
        await useAuthStore.getState().refresh();
        
        // If refresh was successful, the new token is in the store.
        // Update the authorization header for the failed request.
        const newToken = useAuthStore.getState().accessToken;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        
        // Retry the original request
        const retryResponse = await axios(originalRequest);
        return retryResponse.data;
      } catch (refreshError) {
        // If refresh fails (e.g., refresh token expired), log out the user
        useAuthStore.getState().logout();
        return Promise.reject(new Error('Session expired. Please log in again.'));
      }
    }

    // For any other error, reject with the normalized error message
    return Promise.reject(new Error(normalizedError));
  }
);
