
import axios from 'axios';

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach the admin token to API requests when one exists.
// The Spring Boot backend will validate this token.
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('sai_admin_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
