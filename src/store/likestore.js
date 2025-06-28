import { create } from 'zustand';
import { likeAPI } from '../api/api.js';

const useLikeStore = create((set, get) => ({
    // Store like states: { [contentType_contentId]: boolean }
    likeStates: {},
    // Store like counts: { [contentType_contentId]: number }
    likeCounts: {},
    // Store pending operations to prevent double-clicks
    pendingOperations: new Set(),
    isLoading: false,
    error: null,

    // Generate key for storing like state/count
    getKey: (contentType, contentId) => `${contentType}_${contentId}`,

    // Toggle like with optimistic updates (Instagram-style)
    toggleLike: async (contentType, contentId) => {
        const key = get().getKey(contentType, contentId);
        const state = get();
        
        // Prevent double-clicks
        if (state.pendingOperations.has(key)) {
            return;
        }

        const currentLiked = state.likeStates[key] || false;
        const currentCount = state.likeCounts[key] || 0;

        // Optimistic update
        set(state => ({
            likeStates: { ...state.likeStates, [key]: !currentLiked },
            likeCounts: { 
                ...state.likeCounts, 
                [key]: currentLiked ? Math.max(0, currentCount - 1) : currentCount + 1 
            },
            pendingOperations: new Set([...state.pendingOperations, key])
        }));

        try {
            if (currentLiked) {
                // Unlike
                await likeAPI.unlike(contentType, contentId);
            } else {
                // Like
                await likeAPI.like(contentType, contentId);
            }
        } catch (error) {
            // Rollback optimistic update on error
            set(state => ({
                likeStates: { ...state.likeStates, [key]: currentLiked },
                likeCounts: { ...state.likeCounts, [key]: currentCount },
                error: error.response?.data?.message || 'Failed to update like'
            }));
            
            // Re-throw error for UI handling
            throw error;
        } finally {
            // Remove from pending operations
            set(state => ({
                pendingOperations: new Set([...state.pendingOperations].filter(k => k !== key))
            }));
        }
    },

    // Like content (legacy method - use toggleLike instead)
    like: async (contentType, contentId) => {
        const key = get().getKey(contentType, contentId);
        const state = get();
        
        if (state.pendingOperations.has(key)) {
            return;
        }

        const currentCount = state.likeCounts[key] || 0;

        // Optimistic update
        set(state => ({
            likeStates: { ...state.likeStates, [key]: true },
            likeCounts: { ...state.likeCounts, [key]: currentCount + 1 },
            pendingOperations: new Set([...state.pendingOperations, key])
        }));

        try {
            await likeAPI.like(contentType, contentId);
        } catch (error) {
            // Rollback
            set(state => ({
                likeStates: { ...state.likeStates, [key]: false },
                likeCounts: { ...state.likeCounts, [key]: currentCount },
                error: error.response?.data?.message || 'Failed to like content'
            }));
            throw error;
        } finally {
            set(state => ({
                pendingOperations: new Set([...state.pendingOperations].filter(k => k !== key))
            }));
        }
    },

    // Unlike content (legacy method - use toggleLike instead)
    unlike: async (contentType, contentId) => {
        const key = get().getKey(contentType, contentId);
        const state = get();
        
        if (state.pendingOperations.has(key)) {
            return;
        }

        const currentCount = state.likeCounts[key] || 0;

        // Optimistic update
        set(state => ({
            likeStates: { ...state.likeStates, [key]: false },
            likeCounts: { ...state.likeCounts, [key]: Math.max(0, currentCount - 1) },
            pendingOperations: new Set([...state.pendingOperations, key])
        }));

        try {
            await likeAPI.unlike(contentType, contentId);
        } catch (error) {
            // Rollback
            set(state => ({
                likeStates: { ...state.likeStates, [key]: true },
                likeCounts: { ...state.likeCounts, [key]: currentCount },
                error: error.response?.data?.message || 'Failed to unlike content'
            }));
            throw error;
        } finally {
            set(state => ({
                pendingOperations: new Set([...state.pendingOperations].filter(k => k !== key))
            }));
        }
    },

    // Check if content is liked
    checkStatus: async (contentType, contentId) => {
        const key = get().getKey(contentType, contentId);
        try {
            const response = await likeAPI.checkStatus(contentType, contentId);
            if (response.data.success) {
                set(state => ({
                    likeStates: { ...state.likeStates, [key]: response.data.data.isLiked }
                }));
                return response.data.data.isLiked;
            }
            return false;
        } catch (error) {
            return false;
        }
    },

    // Get like count
    getCount: async (contentType, contentId) => {
        const key = get().getKey(contentType, contentId);
        try {
            const response = await likeAPI.getCount(contentType, contentId);
            if (response.data.success) {
                set(state => ({
                    likeCounts: { ...state.likeCounts, [key]: response.data.data.likeCount }
                }));
                return response.data.data.likeCount;
            }
            return 0;
        } catch (error) {
            return 0;
        }
    },

    // Get like state from store (no API call)
    isLiked: (contentType, contentId) => {
        const key = get().getKey(contentType, contentId);
        return get().likeStates[key] || false;
    },

    // Get like count from store (no API call)
    getLikeCount: (contentType, contentId) => {
        const key = get().getKey(contentType, contentId);
        return get().likeCounts[key] || 0;
    },

    // Check if operation is pending
    isPending: (contentType, contentId) => {
        const key = get().getKey(contentType, contentId);
        return get().pendingOperations.has(key);
    },

    // Initialize like data for content
    initializeLikeData: async (contentType, contentId) => {
        const key = get().getKey(contentType, contentId);
        const state = get();
        
        // Only fetch if not already in store
        if (state.likeStates[key] === undefined) {
            await state.checkStatus(contentType, contentId);
        }
        if (state.likeCounts[key] === undefined) {
            await state.getCount(contentType, contentId);
        }
    },

    // Batch initialize like data for multiple items
    initializeBatchLikeData: async (items) => {
        const promises = items.map(item => 
            get().initializeLikeData(item.contentType, item.contentId)
        );
        await Promise.all(promises);
    },

    // Set like data directly (for initial load)
    setLikeData: (contentType, contentId, isLiked, count) => {
        const key = get().getKey(contentType, contentId);
        set(state => ({
            likeStates: { ...state.likeStates, [key]: isLiked },
            likeCounts: { ...state.likeCounts, [key]: count }
        }));
    },

    clearError: () => set({ error: null }),
    clearData: () => set({ likeStates: {}, likeCounts: {}, error: null, pendingOperations: new Set() }),
}));

export { useLikeStore }; 