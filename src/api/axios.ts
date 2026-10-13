import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'https://ahorro-backend.jhonatan-ayala-leon.online';

const api = axios.create({
  baseURL: API_URL,
  // ⚠️ NO poner Content-Type por defecto aquí.
  // Axios lo detecta automáticamente:
  //   - JSON (objetos) → application/json
  //   - FormData (archivos) → multipart/form-data con boundary
});

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;