import { create } from "zustand";
import { toast } from "sonner";
import { authAPI } from "@/api/api";

export const useProfileStore = create((set) => ({
  profile: null,
  loading: false,
  error: null,

  fetchProfile: async () => {
    set({ loading: true, error: null });
    try {
      const response = await authAPI.getProfile();
      set({ profile: response.data.data, loading: false });
      return response.data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to fetch profile";
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  completeOnboarding: async (onboardingData) => {
    set({ loading: true, error: null });
    try {
      const response = await authAPI.completeOnboarding(onboardingData);
      set({ profile: response.data.data, loading: false });
      toast.success("Profile completed successfully!");
      return response.data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to complete profile";
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      throw error;
    }
  },
}));
