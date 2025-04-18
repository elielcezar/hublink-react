import axios from 'axios';

console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);

// Criar instância do axios com URL base do ambiente
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3002',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptador para adicionar o token de autenticação a cada requisição
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;