import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";
import { authAPI } from "@/api/api";

export const useAuthStore = create(
  persist(
    (set) => ({
      authUser: null,
      isLoading: true,

      // Action to set user data after successful authentication
      setAuthUser: (user) => {
        set({ authUser: user, isLoading: false });
      },

      // Action to update user data
      updateUser: (updatedUser) => {
        set({ authUser: updatedUser });
      },
      
      // Action to handle the OAuth callback
      handleAuthCallback: async (token) => {
        try {
          localStorage.setItem('token', token);
          const response = await authAPI.getProfile();
          set({ authUser: response.data.data, isLoading: false });
          return response.data.data;
        } catch (error) {
          localStorage.removeItem('token');
          set({ authUser: null, isLoading: false });
          toast.error(error.response?.data?.message || "Authentication failed", {
            style: {
              background: '#ef4444',
              color: 'white',
              border: '1px solid #dc2626'
            }
          });
          throw error;
        }
      },

      // Action to log the user out
      logout: async () => {
        try {
          await authAPI.logout();
          localStorage.removeItem('token');
          set({ authUser: null });
          toast.success("Logout successful", {
            style: {
              background: '#22c55e',
              color: 'white',
              border: '1px solid #16a34a'
            }
          });
        } catch (error) {
          toast.error("Logout failed", {
            style: {
              background: '#ef4444',
              color: 'white',
              border: '1px solid #dc2626'
            }
          });
          throw error;
        }
      },
      
      // Action to check authentication status on initial load
      checkAuth: async () => {
          const token = localStorage.getItem('token');
          if (!token) {
              set({ authUser: null, isLoading: false });
              return;
          }
          try {
              const response = await authAPI.getProfile();
              set({ authUser: response.data.data, isLoading: false });
          } catch (error) {
              localStorage.removeItem('token');
              set({ authUser: null, isLoading: false });
          }
      }
    }),
    {
      name: "auth-storage", // unique name for local storage
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const { state } = JSON.parse(str);
          return {
            state: {
              ...state,
              isLoading: true, // Reset loading state on rehydration
            },
          };
        },
        setItem: (name, newValue) => {
          const { state, version } = newValue;
          const str = JSON.stringify({
            state: {
              ...state,
            },
            version,
          });
          localStorage.setItem(name, str);
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
      partialize: (state) => ({ authUser: state.authUser }),
    }
  )
);
