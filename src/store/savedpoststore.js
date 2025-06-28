import { create } from 'zustand';
import { savedPostAPI } from '../api/api.js';

const useSavedPostStore = create((set, get) => ({
    savedPosts: [],
    savedPostIds: {}, // { [postId]: true }
    isLoading: false,
    error: null,
    pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },

    fetchSavedPosts: async (params = {}) => {
        set({ isLoading: true, error: null });
        try {
            const response = await savedPostAPI.getAll(params);
            if (response.data.success) {
                const posts = response.data.data;
                const ids = {};
                posts.forEach(post => { ids[post.id] = true; });
                set({
                    savedPosts: posts,
                    savedPostIds: ids,
                    pagination: response.data.pagination || {},
                });
            } else {
                set({ error: response.data.message || 'Failed to fetch saved posts' });
            }
        } catch (error) {
            set({ error: error.response?.data?.message || 'Failed to fetch saved posts' });
        } finally {
            set({ isLoading: false });
        }
    },

    savePost: async (postId) => {
        try {
            await savedPostAPI.save(postId);
            set(state => ({
                savedPostIds: { ...state.savedPostIds, [postId]: true },
            }));
        } catch (error) {
            set({ error: error.response?.data?.message || 'Failed to save post' });
        }
    },

    unsavePost: async (postId) => {
        try {
            await savedPostAPI.unsave(postId);
            set(state => {
                const ids = { ...state.savedPostIds };
                delete ids[postId];
                return { savedPostIds: ids };
            });
        } catch (error) {
            set({ error: error.response?.data?.message || 'Failed to unsave post' });
        }
    },

    isPostSaved: (postId) => !!get().savedPostIds[postId],

    clearError: () => set({ error: null }),
    clear: () => set({ savedPosts: [], savedPostIds: {}, error: null }),
}));

export { useSavedPostStore }; 