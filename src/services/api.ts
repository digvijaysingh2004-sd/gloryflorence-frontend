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

// Response Interceptor: Automatically unwrap .NET 8 ApiResponse<T> envelopes & capture global errors
api.interceptors.response.use(
  (response) => {
    // Check if response has standard backend envelope: { success, message, data, errors }
    if (
      response.data &&
      typeof response.data === 'object' &&
      'success' in response.data &&
      'data' in response.data
    ) {
      const payload = response.data.data;
      // Preserve full envelope on response object for callers needing metadata/pagination
      (response as any).envelope = response.data;
      if (payload !== undefined && payload !== null) {
        response.data = payload;
      }
    }
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const errorData = error.response?.data;
    let errorMessage = '';

    if (errorData) {
      if (Array.isArray(errorData.errors) && errorData.errors.length > 0) {
        errorMessage = errorData.errors.join('; ');
      } else if (errorData.message) {
        errorMessage = errorData.message;
      } else if (errorData.error) {
        errorMessage = errorData.error;
      }
    }

    if (!errorMessage) {
      errorMessage = error.message || 'An unexpected error occurred';
    }

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
