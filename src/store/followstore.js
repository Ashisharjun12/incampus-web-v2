import { create } from 'zustand';
import { followAPI } from '../api/api.js';

const useFollowStore = create((set, get) => ({
    // State
    followers: [],
    following: [],
    followCounts: {},
    isLoading: false,
    error: null,

    // Actions
    followUser: async (userId) => {
        try {
            set({ isLoading: true, error: null });
            const response = await followAPI.followUser(userId);
            
            if (response.data.success) {
                // Update follow counts if we have them cached
                const { followCounts } = get();
                if (followCounts[userId]) {
                    set({
                        followCounts: {
                            ...followCounts,
                            [userId]: {
                                ...followCounts[userId],
                                followersCount: followCounts[userId].followersCount + 1
                            }
                        }
                    });
                }
            }
            
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to follow user';
            set({ error: errorMessage });
            throw new Error(errorMessage);
        } finally {
            set({ isLoading: false });
        }
    },

    unfollowUser: async (userId) => {
        try {
            set({ isLoading: true, error: null });
            const response = await followAPI.unfollowUser(userId);
            
            if (response.data.success) {
                // Update follow counts if we have them cached
                const { followCounts } = get();
                if (followCounts[userId]) {
                    set({
                        followCounts: {
                            ...followCounts,
                            [userId]: {
                                ...followCounts[userId],
                                followersCount: Math.max(0, followCounts[userId].followersCount - 1)
                            }
                        }
                    });
                }
            }
            
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to unfollow user';
            set({ error: errorMessage });
            throw new Error(errorMessage);
        } finally {
            set({ isLoading: false });
        }
    },

    getUserFollowers: async (userId, page = 1, limit = 20) => {
        try {
            set({ isLoading: true, error: null });
            const response = await followAPI.getUserFollowers(userId, { page, limit });
            
            if (response.data.success) {
                if (page === 1) {
                    set({ followers: response.data.data });
                } else {
                    set({ followers: [...get().followers, ...response.data.data] });
                }
            }
            
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch followers';
            set({ error: errorMessage });
            throw new Error(errorMessage);
        } finally {
            set({ isLoading: false });
        }
    },

    getUserFollowing: async (userId, page = 1, limit = 20) => {
        try {
            set({ isLoading: true, error: null });
            const response = await followAPI.getUserFollowing(userId, { page, limit });
            
            if (response.data.success) {
                if (page === 1) {
                    set({ following: response.data.data });
                } else {
                    set({ following: [...get().following, ...response.data.data] });
                }
            }
            
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch following';
            set({ error: errorMessage });
            throw new Error(errorMessage);
        } finally {
            set({ isLoading: false });
        }
    },

    checkFollowStatus: async (userId) => {
        try {
            const response = await followAPI.checkFollowStatus(userId);
            return response.data.data.isFollowing;
        } catch (error) {
            return false;
        }
    },

    getUserFollowCounts: async (userId) => {
        try {
            const response = await followAPI.getUserFollowCounts(userId);
            
            if (response.data.success) {
                set({
                    followCounts: {
                        ...get().followCounts,
                        [userId]: response.data.data
                    }
                });
            }
            
            return response.data.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch follow counts';
            set({ error: errorMessage });
            throw new Error(errorMessage);
        }
    },

    clearError: () => set({ error: null }),
    clearData: () => set({ followers: [], following: [], followCounts: {}, error: null }),
}));

export { useFollowStore };