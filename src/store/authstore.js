import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";
import { authAPI } from "@/api/api";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      authUser: null,
      isLoading: false,
      isSuspended: false,

      // Action to set user data after successful authentication
      setAuthUser: (user) => {
        const currentState = get();
        const isSuspended = user?.profile?.status === 'suspended' || user?.profile?.status === 'deleted';
        
        // Only update if there's an actual change
        if (currentState.authUser?.id !== user?.id || 
            currentState.isSuspended !== isSuspended) {
          
          set({ 
            authUser: user,
            isSuspended
          });
          
          // Show notification only if status changed to suspended
          if (isSuspended && user?.profile?.status === 'suspended' && 
              currentState.authUser?.profile?.status !== 'suspended') {
            toast.error('Your account has been suspended by an administrator.');
          } else if (isSuspended && user?.profile?.status === 'deleted' && 
                     currentState.authUser?.profile?.status !== 'deleted') {
            toast.error('Your account has been deleted by an administrator.');
          }
        }
      },

      // Action to update user data
      updateUser: (updatedUser) => {
        set({ authUser: updatedUser });
      },
      
      // Action to handle the OAuth callback
      handleAuthCallback: async (token) => {
        try {
          // Store the token
          localStorage.setItem('token', token);
          
          // Get user profile using the status endpoint (allows suspended users)
          const response = await authAPI.getProfileStatus();
          if (response.data.success) {
            const user = response.data.data;
            const isSuspended = user?.profile?.status === 'suspended' || user?.profile?.status === 'deleted';
            
            set({ 
              authUser: user,
              isLoading: false,
              isSuspended
            });
            
            // Allow suspended users to log in - they will see SuspendedUser component
            // Don't throw error or remove token for suspended users
            return user;
          } else {
            throw new Error('Failed to get user profile');
          }
        } catch (error) {
          localStorage.removeItem('token');
          set({ authUser: null, isLoading: false, isSuspended: false });
          throw error;
        }
      },

      // Action to log the user out
      logout: async () => {
        try {
          await authAPI.logout();
        } catch (error) {
          // Silent error handling for logout
          console.log("logout error",error);
        }
        localStorage.removeItem('token');
        set({ authUser: null, isLoading: false, isSuspended: false });
        toast.success("Logout successful", {
          style: {
            background: '#10b981',
            color: 'white',
          },
        });
      },
      
      // Action to check authentication status on initial load
      checkAuth: async () => {
        set({ isLoading: true });
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            set({ authUser: null, isLoading: false, isSuspended: false });
            return;
          }

          const response = await authAPI.getProfileStatus();
          if (response.data.success) {
            const user = response.data.data;
            const isSuspended = user?.profile?.status === 'suspended' || user?.profile?.status === 'deleted';
            
            set({ 
              authUser: user,
              isLoading: false,
              isSuspended
            });
            
            // Show notification if user is suspended
            if (isSuspended && user?.profile?.status === 'suspended') {
              toast.error('Your account has been suspended by an administrator.');
            } else if (isSuspended && user?.profile?.status === 'deleted') {
              toast.error('Your account has been deleted by an administrator.');
            }
          } else {
            set({ authUser: null, isLoading: false, isSuspended: false });
            localStorage.removeItem('token');
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          set({ authUser: null, isLoading: false, isSuspended: false });
          localStorage.removeItem('token');
        }
      },

      setSuspended: (suspended) => {
        const currentState = get();
        if (currentState.isSuspended !== suspended) {
          set({ isSuspended: suspended });
        }
      },

      loginWithGoogle: () => {
        authAPI.loginWithGoogle();
      },

      // Method to refresh user data (useful when status might have changed)
      refreshUserData: async () => {
        try {
          const response = await authAPI.getProfileStatus();
          if (response.data.success) {
            const user = response.data.data;
            const isSuspended = user?.profile?.status === 'suspended' || user?.profile?.status === 'deleted';
            
            set({ 
              authUser: user,
              isSuspended
            });
            
            return { user, isSuspended };
          }
        } catch (error) {
          console.error('Failed to refresh user data:', error);
        }
        return null;
      },
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
      partialize: (state) => ({ 
        authUser: state.authUser, 
        isSuspended: state.isSuspended
      }),
    }
  )
);
