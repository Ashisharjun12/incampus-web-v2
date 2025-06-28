import { create } from 'zustand';
import { commentAPI } from '../api/api.js';

const useCommentStore = create((set, get) => ({
    comments: {}, // { [postId]: { comments: [], pagination: {} } }
    isLoading: false,
    error: null,

    fetchComments: async (postId, params = {}) => {
        set({ isLoading: true, error: null });
        try {
            const response = await commentAPI.getByPost(postId, params);
            if (response.data.success) {
                set(state => ({
                    comments: {
                        ...state.comments,
                        [postId]: {
                            comments: response.data.data,
                            pagination: response.data.pagination
                        }
                    }
                }));
            } else {
                set({ error: response.data.message || 'Failed to fetch comments' });
            }
        } catch (error) {
            set({ error: error.response?.data?.message || 'Failed to fetch comments' });
        } finally {
            set({ isLoading: false });
        }
    },

    createComment: async (commentData) => {
        try {
            const response = await commentAPI.create(commentData);
            if (response.data.success) {
                // Add the new comment to the store
                const { postId } = commentData;
                set(state => {
                    const postComments = state.comments[postId] || { comments: [], pagination: {} };
                    return {
                        comments: {
                            ...state.comments,
                            [postId]: {
                                ...postComments,
                                comments: [response.data.data, ...postComments.comments],
                                pagination: {
                                    ...postComments.pagination,
                                    total: postComments.pagination.total + 1
                                }
                            }
                        }
                    };
                });
            }
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to create comment';
            set({ error: errorMessage });
            throw new Error(errorMessage);
        }
    },

    likeComment: async (commentId) => {
        try {
            await commentAPI.like(commentId);
            // Update like count in store
            set(state => {
                const newComments = { ...state.comments };
                Object.keys(newComments).forEach(postId => {
                    newComments[postId].comments = newComments[postId].comments.map(comment => {
                        if (comment.id === commentId) {
                            return { ...comment, likeCount: (comment.likeCount || 0) + 1 };
                        }
                        return comment;
                    });
                });
                return { comments: newComments };
            });
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to like comment';
            set({ error: errorMessage });
            throw new Error(errorMessage);
        }
    },

    unlikeComment: async (commentId) => {
        try {
            await commentAPI.unlike(commentId);
            // Update like count in store
            set(state => {
                const newComments = { ...state.comments };
                Object.keys(newComments).forEach(postId => {
                    newComments[postId].comments = newComments[postId].comments.map(comment => {
                        if (comment.id === commentId) {
                            return { ...comment, likeCount: Math.max(0, (comment.likeCount || 0) - 1) };
                        }
                        return comment;
                    });
                });
                return { comments: newComments };
            });
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to unlike comment';
            set({ error: errorMessage });
            throw new Error(errorMessage);
        }
    },

    editComment: async (commentId, updateData) => {
        try {
            const response = await commentAPI.edit(commentId, updateData);
            if (response.data.success) {
                // Update comment in store
                set(state => {
                    const newComments = { ...state.comments };
                    Object.keys(newComments).forEach(postId => {
                        newComments[postId].comments = newComments[postId].comments.map(comment => {
                            if (comment.id === commentId) {
                                return { ...comment, ...response.data.data, isEdited: true };
                            }
                            return comment;
                        });
                    });
                    return { comments: newComments };
                });
            }
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to edit comment';
            set({ error: errorMessage });
            throw new Error(errorMessage);
        }
    },

    deleteComment: async (commentId) => {
        try {
            await commentAPI.delete(commentId);
            // Remove comment from store
            set(state => {
                const newComments = { ...state.comments };
                Object.keys(newComments).forEach(postId => {
                    newComments[postId].comments = newComments[postId].comments.filter(comment => comment.id !== commentId);
                    newComments[postId].pagination.total = Math.max(0, newComments[postId].pagination.total - 1);
                });
                return { comments: newComments };
            });
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to delete comment';
            set({ error: errorMessage });
            throw new Error(errorMessage);
        }
    },

    getCommentsForPost: (postId) => {
        const state = get();
        return state.comments[postId] || { comments: [], pagination: {} };
    },

    clearError: () => set({ error: null }),
    clearComments: (postId) => {
        if (postId) {
            set(state => {
                const newComments = { ...state.comments };
                delete newComments[postId];
                return { comments: newComments };
            });
        } else {
            set({ comments: {} });
        }
    },
}));

export { useCommentStore }; 