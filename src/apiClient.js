import axios from 'axios';
import { auth } from './firebase';

// Use HTTPS only - fallback is safe for local dev
const defaultBaseURL = 'https://admin-interview-backend.orangeplant-f4cd2fc4.southindia.azurecontainerapps.io';
const resolvedBaseURL = process.env.REACT_APP_API_URL || defaultBaseURL;

const apiClient = axios.create({
  baseURL: resolvedBaseURL,
});
// Log to verify environment variable and fallback
console.log("ENV REACT_APP_API_URL:", process.env.REACT_APP_API_URL);
console.log("Using Base URL:", apiClient.defaults.baseURL);

// Add Authorization header before each request
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

// Handle 401 errors and retry with refreshed token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        const user = auth.currentUser;
        if (user) {
          const newToken = await user.getIdToken(true);
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }

      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default apiClient;
