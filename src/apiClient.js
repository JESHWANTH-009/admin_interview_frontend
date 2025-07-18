import axios from 'axios';
import { auth } from './firebase';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '',
});

// Request interceptor to add Authorization header
apiClient.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 and refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // Prevent infinite loop
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        // Force refresh the token
        const user = auth.currentUser;
        if (user) {
          const newToken = await user.getIdToken(true);
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Token refresh failed, redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
      // If no user, redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient; 