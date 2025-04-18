import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import Background from '../assets/bg-login.webp';

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [diagnosticInfo, setDiagnosticInfo] = useState(null);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setIsLoading(true);
    setLoginError('');
    setDiagnosticInfo(null);
    
    try {
      // Usar a URL da API definida no ambiente ou localhost como fallback
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
      console.log(`Tentando login em: ${API_URL}/api/login`);
      
      // Salvar diagnóstico temporário
      const diagnostics = {
        apiUrl: API_URL,
        timestamp: new Date().toISOString(),
        email: data.email.length > 3 ? data.email.substring(0, 3) + '...' : '...',
        hasPassword: !!data.password
      };
      
      const response = await axios.post(`${API_URL}/api/login`, data);
      
      // Adicionar informações de diagnóstico
      diagnostics.status = response.status;
      diagnostics.success = true;
      diagnostics.hasToken = !!response.data.token;
      setDiagnosticInfo(diagnostics);
      
      console.log('Login bem-sucedido:', {
        status: response.status,
        hasToken: !!response.data.token,
        hasUser: !!response.data.user
      });
      
      // Salvar token no localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Redirecionar para o dashboard
      navigate('/dashboard');
    } catch (error) {
      const diagnostics = {
        status: error.response?.status || 'sem resposta',
        message: error.response?.data?.message || error.message,
        timestamp: new Date().toISOString()
      };
      setDiagnosticInfo(diagnostics);
      
      console.error('Erro de login:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        url: error.config?.url
      });
      
      setLoginError(
        error.response?.data?.message || 
        'Ocorreu um erro ao fazer login. Tente novamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white overflow-hidden">
      {/* Seção de fundo/imagem */}
      <div 
        className="hidden md:block md:w-1/2 bg-cover bg-center"
        style={{ backgroundImage: `url(${Background})` }}
      >
        <div className="h-full bg-blue-600 bg-opacity-70 flex items-center justify-center">
          <div className="text-center p-10">
            <h1 className="text-4xl font-bold text-white mb-4">HubLink</h1>
            <p className="text-white text-lg">
              Conectando pessoas através de páginas
            </p>
          </div>
        </div>
      </div>
      
      {/* Formulário de login */}
      <div className="md:w-1/2 flex items-center justify-center p-10">
        <div className="w-full max-w-md">
          <div className="md:hidden text-center mb-8">
            <h1 className="text-3xl font-bold text-blue-600">HubLink</h1>
            <p className="text-gray-600">
              Conectando pessoas através de páginas
            </p>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Login</h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                {...register('email', { 
                  required: 'Email é obrigatório',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email inválido'
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 
                           focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="seu@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Senha
              </label>
              <input
                id="password"
                type="password"
                {...register('password', { required: 'Senha é obrigatória' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 
                           focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Sua senha"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
            
            {loginError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{loginError}</p>
                {diagnosticInfo && (
                  <details className="mt-2 text-xs text-gray-500">
                    <summary>Informações de diagnóstico</summary>
                    <pre className="mt-1 p-2 bg-gray-100 rounded overflow-auto">
                      {JSON.stringify(diagnosticInfo, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            )}
            
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm
                           text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none
                           focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Entrando...
                  </span>
                ) : 'Entrar'}
              </button>
            </div>
          </form>
          
          <div className="mt-6">
            <Link to="/register" className="text-sm text-blue-600 hover:text-blue-500">
              Ainda não tem uma conta? Registre-se
            </Link>
          </div>
          
          <div className="mt-10 text-center text-xs text-gray-500">
            <p>© 2023 HubLink. Todos os direitos reservados.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 