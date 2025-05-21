import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Background from '../assets/bg-login.webp';
import axios from 'axios';

const Register = () => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const [registerError, setRegisterError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const password = watch('password', '');

  const onSubmit = async (data) => {
    setIsLoading(true);
    setRegisterError('');
    
    if (data.password !== data.confirmPassword) {
      setRegisterError('As senhas não correspondem');
      setIsLoading(false);
      return;
    }
    
    try {
      await axios.post('http://localhost:3002/api/register', {
        name: data.name,
        email: data.email,
        pageSlug: data.pageSlug,
        password: data.password
      });
      
      // Redirecionar para a página de login com mensagem de sucesso
      navigate('/', { state: { message: 'Cadastro realizado com sucesso! Faça login para continuar.' } });
    } catch (error) {
      setRegisterError(
        error.response?.data?.message || 
        'Ocorreu um erro ao criar sua conta. Tente novamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white overflow-hidden">
      <aside className="flex items-center justify-center h-screen w-6/12" style={{ backgroundImage: `url(${Background})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      
      </aside>
      <div className="flex min-h-screen items-center justify-center bg-gray-50 w-6/12">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gray-900">
              Hub<span className="text-blue-600">Link</span>
            </h1>
            <h2 className="mt-6 text-xl font-bold text-gray-900">Criar nova conta</h2>
          </div>
          
          {registerError && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {registerError}
            </div>
          )}
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 hidden">
                Nome completo
              </label>
              <input
                id="name"
                type="text"
                {...register('name', { required: 'Nome é obrigatório' })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nome"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="pageSlug" className="block text-sm font-medium text-gray-700 hidden">
                Endereço da sua página
              </label>
              <div className="flex items-center">
                <span className="text-gray-500 mr-2">hublink.app/</span>
                <input
                  id="pageSlug"
                  type="text"
                  {...register('pageSlug', { 
                    required: 'Endereço da página é obrigatório',
                    pattern: {
                      value: /^[a-z0-9-_.]+$/i,
                      message: 'Use apenas letras, números, hífens, pontos e underscores'
                    },
                    minLength: {
                      value: 3,
                      message: 'Endereço deve ter pelo menos 3 caracteres'
                    },
                    maxLength: {
                      value: 30,
                      message: 'Endereço deve ter no máximo 30 caracteres'
                    }
                  })}
                  className="flex-1 mt-1 block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="seu-endereco"
                />
              </div>
              {errors.pageSlug && (
                <p className="mt-1 text-sm text-red-600">{errors.pageSlug.message}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Este será o endereço da sua página principal.
              </p>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 hidden">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                {...register('email', { 
                  required: 'E-mail é obrigatório',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'E-mail inválido'
                  }
                })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="E-mail"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 hidden">
                Senha
              </label>
              <input
                id="password"
                type="password"
                {...register('password', { 
                  required: 'Senha é obrigatória',
                  minLength: {
                    value: 6,
                    message: 'A senha deve ter pelo menos 6 caracteres'
                  }
                })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Senha"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 hidden">
                Confirmar senha
              </label>
              <input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword', { 
                  required: 'Confirme sua senha',
                  validate: value => value === password || 'As senhas não correspondem'
                })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Confirmar senha"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? 'Processando...' : 'Criar conta'}
              </button>
            </div>
          </form>
          
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{' '}
              <Link to="/" className="font-medium text-blue-600 hover:text-blue-500">
                Entrar
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register; 