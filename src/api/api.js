import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const api = axios.create({
  baseURL: API_URL,
});

// Axios interceptor to add the token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Auth Service ---
export const authAPI = {
  loginWithGoogle: () => {
    window.location.href = `${API_URL}/auth/google`;
  },
  
  logout: () => {
    // Client-side token removal, backend is stateless
    return Promise.resolve(); 
  },

  getProfile: () => {
    return api.get('/profile/me');
  },
  
  getProfileById: (userId) => api.get(`/profile/${userId}`),

  updateProfile: (profileData) => {
    return api.put('/profile/me', profileData);
  },

  completeOnboarding: (onboardingData) => {
    return api.post('/profile/onboarding', onboardingData);
  },

  followUser: (targetUserId) => {
    return api.post(`/profile/follow/${targetUserId}`);
  },

  followCommunity: (communityId) => {
    return api.post(`/profile/follow-community/${communityId}`);
  },

  getFollowers: () => {
    return api.get('/profile/followers');
  },

  getFollowing: () => {
    return api.get('/profile/following');
  }
};

// --- College Service ---
export const collegeAPI = {
  getAll: () => api.get('/colleges'),
  getById: (id) => api.get(`/colleges/${id}`),
  create: (collegeData) => api.post('/colleges', collegeData),
  update: (id, collegeData) => api.put(`/colleges/${id}`, collegeData),
  delete: (id) => api.delete(`/colleges/${id}`),
};

// --- Upload Service ---
export const uploadAPI = {
  uploadImage: (file, folder) => {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) {
      formData.append('folder', folder);
    }
    return api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadImages: (files, folder) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    if (folder) {
      formData.append('folder', folder);
    }
    return api.post('/upload/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadVideo: (file, folder) => {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) {
      formData.append('folder', folder);
    }
    return api.post('/upload/video', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// --- Community Service ---
export const communityAPI = {
  // Get all communities with filters
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return api.get(`/communities?${queryParams}`);
  },

  // Get community by ID
  getById: (id) => api.get(`/communities/${id}`),

  // Create new community
  create: (communityData) => api.post('/communities', communityData),

  // Update community
  update: (id, updateData) => api.put(`/communities/${id}`, updateData),

  // Delete community
  delete: (id) => api.delete(`/communities/${id}`),

  // Join community
  join: (id) => api.post(`/communities/${id}/join`),

  // Leave community
  leave: (id) => api.delete(`/communities/${id}/leave`),

  // Get user's joined communities
  getUserCommunities: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return api.get(`/communities/user/joined?${queryParams}`);
  },

  // Add/Update topics for a community
  addOrUpdateTopics: (id, topics) => api.post(`/communities/${id}/topics`, { topics }),
};

// --- Follow Service ---
export const followAPI = {
  // Follow a user
  followUser: (userId) => api.post(`/follow/user/${userId}`),

  // Unfollow a user
  unfollowUser: (userId) => api.delete(`/follow/user/${userId}`),

  // Get user's followers
  getUserFollowers: (userId, params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return api.get(`/follow/user/${userId}/followers?${queryParams}`);
  },

  // Get users that a user is following
  getUserFollowing: (userId, params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return api.get(`/follow/user/${userId}/following?${queryParams}`);
  },

  // Check if current user is following a specific user
  checkFollowStatus: (userId) => api.get(`/follow/user/${userId}/status`),

  // Get follow counts for a user
  getUserFollowCounts: (userId) => api.get(`/follow/user/${userId}/counts`),
};

// --- Post Service ---
export const postAPI = {
  // Create a new post
  create: (postData) => api.post('/posts', postData),

  // Get all posts with filtering
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return api.get(`/posts?${queryParams}`);
  },

  // Get trending hashtags
  getTrendingHashtags: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return api.get(`/posts/trending-hashtags?${queryParams}`);
  },

  // Get posts by community
  getByCommunity: (communityId, params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return api.get(`/posts/community/${communityId}?${queryParams}`);
  },

  // Get post by ID
  getById: (id) => api.get(`/posts/${id}`),

  // Update post
  update: (id, updateData) => api.put(`/posts/${id}`, updateData),

  // Delete post
  delete: (id) => api.delete(`/posts/${id}`),

  // Share a post
  share: (id) => api.post(`/posts/${id}/share`),
};

// --- Admin AI Service ---
export const adminAIAPI = {
  // Get AI configuration
  getConfig: () => api.get('/admin/ai/config'),

  // Update AI configuration
  updateConfig: (config) => api.put('/admin/ai/config', config),

  // Test AI service
  testService: () => api.post('/admin/ai/test'),

  // Test content moderation
  testModeration: (content, isNsfwEnabled) => api.post('/admin/ai/moderate', { content, isNsfwEnabled }),

  // Bad words management
  getBadWords: () => api.get('/admin/bad-words'),
  
  addBadWords: (badWordsData) => api.post('/admin/bad-words', badWordsData),
  
  uploadBadWordsCSV: (formData) => api.post('/admin/bad-words/upload-csv', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  
  updateBadWords: (id, updateData) => api.put(`/admin/bad-words/${id}`, updateData),
  
  deleteBadWords: (id) => api.delete(`/admin/bad-words/${id}`),
  
  testBadWords: (content) => api.post('/admin/bad-words/test', { content }),
};

// --- Saved Post Service ---
export const savedPostAPI = {
  // Save a post
  save: (postId) => api.post(`/saved-posts/${postId}`),

  // Unsave a post
  unsave: (postId) => api.delete(`/saved-posts/${postId}`),

  // Get all saved posts for current user
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return api.get(`/saved-posts?${queryParams}`);
  },

  // Check if a post is saved by current user
  checkStatus: (postId) => api.get(`/saved-posts/${postId}/status`),
};

// --- Comment Service ---
export const commentAPI = {
  // Create a new comment
  create: (commentData) => api.post('/comments', commentData),

  // Get comments for a post
  getByPost: (postId, params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return api.get(`/comments/post/${postId}?${queryParams}`);
  },

  // Get comment thread (replies)
  getThread: (commentId, params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return api.get(`/comments/${commentId}/thread?${queryParams}`);
  },

  // Like a comment
  like: (commentId) => api.post(`/comments/${commentId}/like`),

  // Unlike a comment
  unlike: (commentId) => api.delete(`/comments/${commentId}/like`),

  // Edit a comment
  edit: (commentId, updateData) => api.put(`/comments/${commentId}`, updateData),

  // Delete a comment
  delete: (commentId) => api.delete(`/comments/${commentId}`),
};

// --- GIPHY Service ---
export const giphyAPI = {
  // Search GIFs
  search: (query, params = {}) => {
    const apiKey = import.meta.env.VITE_GIPHY_API_KEY || "F1gvwC02jncYASNOcHScU7J3tNH37zRk";
    const defaultParams = {
      api_key: apiKey,
      q: query,
      limit: 20,
      rating: 'g',
      lang: 'en'
    };
    const searchParams = new URLSearchParams({ ...defaultParams, ...params });
    return fetch(`https://api.giphy.com/v1/gifs/search?${searchParams}`);
  },

  // Get trending GIFs
  trending: (params = {}) => {
    const apiKey = import.meta.env.VITE_GIPHY_API_KEY;
    const defaultParams = {
      api_key: apiKey,
      limit: 20,
      rating: 'g'
    };
    const searchParams = new URLSearchParams({ ...defaultParams, ...params });
    return fetch(`https://api.giphy.com/v1/gifs/trending?${searchParams}`);
  }
};

// --- Like Service ---
export const likeAPI = {
  // Like content (post or comment)
  like: (contentType, contentId) => api.post('/likes', { contentType, contentId }),

  // Unlike content (post or comment)
  unlike: (contentType, contentId) => api.delete(`/likes?contentType=${contentType}&contentId=${contentId}`),

  // Check if content is liked by current user
  checkStatus: (contentType, contentId) => api.get(`/likes/${contentType}/${contentId}/status`),

  // Get like count for content
  getCount: (contentType, contentId) => api.get(`/likes/${contentType}/${contentId}/count`),
};

// --- Mention Service ---
export const mentionAPI = {
  // Get user's mentions (notifications)
  getMyMentions: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return api.get(`/mentions/me?${queryParams}`);
  },

  // Mark specific mentions as read
  markMentionsAsRead: (mentionIds) => {
    return api.put('/mentions/mark-read', { mentionIds });
  },

  // Mark all mentions as read
  markAllMentionsAsRead: () => {
    return api.put('/mentions/mark-all-read');
  },

  // Get unread mention count
  getUnreadCount: () => {
    return api.get('/mentions/unread-count');
  },

  // Search users for mention suggestions
  searchUsers: (query) => {
    return api.get(`/mentions/search-users?query=${encodeURIComponent(query)}`);
  },
};

// --- Search Service ---
export const searchAPI = {
  // Global search across all types
  globalSearch: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return api.get(`/search?${queryParams}`);
  },

  // Search users specifically
  searchUsers: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return api.get(`/search/users?${queryParams}`);
  },

  // Search communities specifically
  searchCommunities: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return api.get(`/search/communities?${queryParams}`);
  },

  // Search posts specifically
  searchPosts: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return api.get(`/search/posts?${queryParams}`);
  },
};

export default api;

