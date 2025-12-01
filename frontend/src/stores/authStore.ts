import { create } from 'zustand';
import type { User, AuthState } from '../types/index';
import api from '../services/api';

interface ExtendedAuthState extends AuthState {
  isInitialized: boolean;
  isLoading: boolean;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<ExtendedAuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isInitialized: false,
  isLoading: true,

  login: (user: User) => set({ user, isAuthenticated: true }),

  logout: () => {
    // Clear token from localStorage
    localStorage.removeItem('token');
    set({ user: null, isAuthenticated: false });
  },

  initializeAuth: async () => {
    // Don't re-initialize if already done
    if (get().isInitialized) {
      return;
    }

    const token = localStorage.getItem('token');

    if (!token) {
      set({ isInitialized: true, isLoading: false });
      return;
    }

    try {
      // Validate token by fetching current user
      const response = await api.get('/auth/me');
      if (response.status === 200 && response.data) {
        set({
          user: response.data,
          isAuthenticated: true,
          isInitialized: true,
          isLoading: false,
        });
      }
    } catch {
      // Token is invalid or expired - clear it
      localStorage.removeItem('token');
      set({
        user: null,
        isAuthenticated: false,
        isInitialized: true,
        isLoading: false,
      });
    }
  },
}));
