import axios from 'axios';

// Cria uma instância do axios com configurações base
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3002',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Adiciona interceptor para incluir o token de autenticação em todas as requisições
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

export default api;