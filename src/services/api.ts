import axios from 'axios';
import config from '../config';

const api = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach authentication token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('gf_auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Capture global errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred';

    if (status === 401) {
      // Clear local session storage
      localStorage.removeItem('gf_auth_token');
      localStorage.removeItem('gf_auth_user');
      // Dispatch standard logout event to notify AuthProvider
      window.dispatchEvent(new Event('gf-auth-logout'));
    }

    // Dispatch custom error event to trigger visual Toast notification
    window.dispatchEvent(
      new CustomEvent('gf-toast-error', {
        detail: { message: errorMessage, status },
      })
    );

    return Promise.reject(error);
  }
);

export default api;
