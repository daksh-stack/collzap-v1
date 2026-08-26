import { create } from 'zustand';
import { api } from '../api/api';
import { useUserStore } from './useUserStore';

export const useInterestStore = create((set, get) => ({
  catalog: null,
  myInterests: [],
  projectTypes: new Set(),
  connectionTypes: [],
  loading: false,
  error: null,

  fetchCatalog: async () => {
    set({ loading: true, error: null });
    try {
      const catalog = await api.get('/interests/catalog');
      set({ catalog, loading: false });
      return catalog;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchMyInterests: async () => {
    set({ loading: true, error: null });
    try {
      const myInterests = await api.get('/interests/me');
      set({ myInterests, loading: false });
      return myInterests;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  selectInterests: async (projectType, selections) => {
    set({ loading: true, error: null });
    try {
      const myInterests = await api.put('/interests/me', { projectType, selections });
      set({ myInterests, loading: false });
      // Might want to refresh onboarding state if they just completed interest selection
      useUserStore.getState().fetchOnboarding();
      return myInterests;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  submitFeedback: async (projectType, suggestion) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/interests/feedback', { projectType, suggestion });
      set({ loading: false });
      return response;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchProjectTypes: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/project-types');
      // Store as Set for easier lookups
      set({ projectTypes: new Set(response.projectTypes), loading: false });
      return response.projectTypes;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  selectProjectTypes: async (types) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put('/project-types', { projectTypes: Array.from(types) });
      set({ projectTypes: new Set(response.projectTypes), loading: false });
      useUserStore.getState().fetchOnboarding();
      return response.projectTypes;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchConnectionTypes: async () => {
    set({ loading: true, error: null });
    try {
      const connectionTypes = await api.get('/connection-types');
      set({ connectionTypes, loading: false });
      return connectionTypes;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  selectConnectionType: async (projectType, connectionType) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put('/connection-types', { projectType, connectionType });
      
      // Update the local list
      const updatedTypes = get().connectionTypes.filter(ct => ct.projectType !== projectType);
      updatedTypes.push(response);
      
      set({ connectionTypes: updatedTypes, loading: false });
      useUserStore.getState().fetchOnboarding();
      
      return response;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  }
}));
