/**
 * Configuração centralizada para URL da API
 * Ordem de prioridade:
 * 1. localStorage (api_base_url) - permite sobrescrever configuração em runtime
 * 2. Variável de ambiente VITE_API_URL
 * 3. Fallback para localhost
 */

const getApiBaseUrl = () => {
  try {
    // Verificar localStorage primeiro (útil para testes em produção)
    const localStorageUrl = localStorage.getItem('api_base_url');
    if (localStorageUrl) {
      console.log(`Usando API URL do localStorage: ${localStorageUrl}`);
      return localStorageUrl;
    }
  } catch (e) {
    console.warn('Erro ao acessar localStorage:', e);
  }
  
  // Usar variável de ambiente ou fallback
  const envUrl = import.meta.env.VITE_API_URL;
  const baseUrl = envUrl || 'http://localhost:3002';
  
  // Log de diagnóstico
  console.log(`API URL configurada: ${baseUrl} (${envUrl ? 'de .env' : 'fallback default'})`);
  
  return baseUrl;
};

/**
 * Adiciona cabeçalhos de autenticação às requisições
 */
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  console.log(`Token disponível: ${token ? 'Sim' : 'Não'}`);
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

/**
 * Configuração para axios 
 */
export const getAxiosConfig = (includeAuth = true) => {
  const config = {
    baseURL: getApiBaseUrl(),
    headers: {
      'Content-Type': 'application/json',
      ...(includeAuth ? getAuthHeaders() : {})
    }
  };
  console.log('Configuração de requisição: ', config);
  return config;
};

/**
 * Opções para fetch API
 */
export const getFetchOptions = (method = 'GET', data = null, includeAuth = true) => {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(includeAuth ? getAuthHeaders() : {})
    },
    credentials: 'include', // Importante para cookies/CORS
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  return options;
};

/**
 * Configuração para axios e fetch
 * @deprecated Use getAxiosConfig ou getFetchOptions
 */
export const API_CONFIG = {
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  // Para CORS em fetch
  credentials: 'include',
};

export default getApiBaseUrl; 