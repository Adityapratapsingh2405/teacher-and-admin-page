import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

export interface RestResponse<T> {
  data: T;
  message: string;
  status: number;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Include schoolId automatically if available in localStorage
    const schoolId = localStorage.getItem('schoolId');
    if (schoolId) {
      // backend expects schoolId as a header or request attribute; using header 'X-School-Id'
      config.headers['X-School-Id'] = schoolId;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or unauthorized
      const errorMessage = error.response?.data?.message || '';
      const isTokenExpired = errorMessage.includes('JWT expired') || errorMessage.includes('expired');
      
      if (isTokenExpired) {
        // Clear all auth data
        localStorage.removeItem('authToken');
        localStorage.removeItem('tokenType');
        localStorage.removeItem('expiresIn');
        localStorage.removeItem('tokenIssuedAt');
        localStorage.removeItem('tokenExpiresAt');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userType');
        localStorage.removeItem('adminActiveTab');
        
        // Show alert
        alert('Your session has expired. Please login again.');
        
        // Redirect to appropriate login page based on current location
        const currentPath = window.location.pathname;
        if (currentPath.includes('/teacher')) {
          window.location.href = '/';
        } else if (currentPath.includes('/admin')) {
          window.location.href = '/';
        } else if (currentPath.includes('/student')) {
          window.location.href = '/';
        } else {
          window.location.href = '/';
        }
      }
    }
    return Promise.reject(error);
  }
);

export { api, API_BASE_URL };
export default api;
