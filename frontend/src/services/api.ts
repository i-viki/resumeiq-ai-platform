import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      const storedUser = localStorage.getItem('user');
      
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          if (user.refreshToken) {
            const response = await axios.post('/api/auth/refresh', { refreshToken: user.refreshToken });
            const { token, refreshToken } = response.data;
            
            // Update local storage with new tokens
            localStorage.setItem('token', token);
            user.token = token;
            user.refreshToken = refreshToken;
            localStorage.setItem('user', JSON.stringify(user));
            
            // Retry the original request
            if (originalRequest.headers) {
               originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          }
        } catch (refreshError) {
          // If refresh fails, purge and log out
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
      
      // No refresh token available
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
