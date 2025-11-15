import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getCurrentUser: () => api.get('/auth/me'),
};

// Album API calls
export const albumAPI = {
  getAll: (params) => api.get('/albums', { params }),
  getById: (id) => api.get(`/albums/${id}`),
  create: (albumData) => api.post('/albums', albumData),
  search: (query) => api.get(`/albums/search?q=${query}`),
};

// Review API calls
export const reviewAPI = {
  create: (reviewData) => api.post('/reviews', reviewData),
  getUserReviews: (userId, params) => api.get(`/reviews/user/${userId}`, { params }),
  getAlbumReviews: (albumId, params) => api.get(`/reviews/album/${albumId}`, { params }),
  getMyReview: (albumId) => api.get(`/reviews/my-review/${albumId}`),
  delete: (albumId) => api.delete(`/reviews/${albumId}`),
};

// User API calls
export const userAPI = {
  getProfile: (username) => api.get(`/users/${username}`),
  updateProfile: (profileData) => api.put('/users/profile', profileData),
  changePassword: (passwordData) => api.put('/users/password', passwordData),
  toggleFollow: (username) => api.post(`/users/${username}/follow`),
  getFollowers: (username) => api.get(`/users/${username}/followers`),
  getFollowing: (username) => api.get(`/users/${username}/following`),
};

export default api;