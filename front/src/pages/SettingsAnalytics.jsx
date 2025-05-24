import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import MenuDashboard from '../components/MenuDashboard';
import AppHeader from '../components/AppHeader';
import api from '../config/apiConfig';

// Use a constant API base URL instead of a Promise
const API_BASE_URL = 'http://localhost:3002'; // Replace with your actual API base URL

const SettingsAnalytics = () => {
  const [gaId, setGaId] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState(null);
  const [userPage, setUserPage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;        
        }

        const userResponse = await api.get('/api/me');        
        setUser(userResponse.data);
        
        const pagesResponse = await api.get('/api/pages');
        if (pagesResponse.data && pagesResponse.data.length > 0) {            
            setUserPage(pagesResponse.data[0].id);            
        }

        const userDetailResponse = await axios.get(`${API_BASE_URL}/api/user/details`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (userDetailResponse.data && userDetailResponse.data.gaId) {
          setGaId(userDetailResponse.data.gaId);
        }
      } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };

    fetchUser();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    
    try {
      setIsUpdating(true);
      const token = localStorage.getItem('token');
      
      await axios.put(
        `${API_BASE_URL}/api/user/ga-config`,
        { gaId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSuccess(true);
      
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
      
      if (error.response) {
        console.error('Resposta do servidor:', error.response.data);
        console.error('Status do erro:', error.response.status);
        setError(`Erro (${error.response.status}): ${error.response.data.message || 'Não foi possível salvar as configurações'}`);
      } else if (error.request) {
        console.error('Sem resposta do servidor:', error.request);
        setError('Servidor não respondeu. Verifique sua conexão e tente novamente.');
      } else {
        console.error('Erro na configuração da requisição:', error.message);
        setError(`Erro na requisição: ${error.message}`);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <MenuDashboard />
      
      <div className="flex-1 pl-[100px]">

          <AppHeader user={user} />

        <div className="w-full mx-auto mt-10 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Configurações de Analytics</h1>
            <Link
              to={`/analytics/${userPage}`}
              className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md shadow-sm hover:bg-gray-50"
            >
              Voltar para o Analytics
            </Link>
          </div>
          
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Google Analytics</h2>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label htmlFor="gaId" className="block text-sm font-medium text-gray-700 mb-1">
                    ID de Medição do Google Analytics
                  </label>
                  <input
                    type="text"
                    id="gaId"
                    value={gaId}
                    onChange={(e) => setGaId(e.target.value)}
                    placeholder="G-XXXXXXXXXX"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Insira o ID de medição do Google Analytics 4 (formato G-XXXXXXXXXX).
                  </p>
                </div>
                
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
                    {error}
                  </div>
                )}
                
                {success && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded">
                    Configurações atualizadas com sucesso!
                  </div>
                )}
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {isUpdating ? 'Salvando...' : 'Salvar Configurações'}
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Como configurar o Google Analytics</h2>
            </div>
            <div className="p-6">
              <div className="prose max-w-none">
                <ol className="list-decimal pl-5 space-y-3">
                  <li>Acesse <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Analytics</a> e faça login com sua conta Google.</li>
                  <li>Clique em "Admin" no canto inferior esquerdo da tela.</li>
                  <li>Na coluna "Propriedade", clique em "Criar propriedade".</li>
                  <li>Selecione "Web" como plataforma.</li>
                  <li>Dê um nome para seu site (ex: "Minha HubLink Page").</li>
                  <li>Configure o fuso horário e a moeda conforme sua preferência.</li>
                  <li>Clique em "Criar".</li>
                  <li>Você receberá um ID de medição do Google Analytics 4 no formato "G-XXXXXXXXXX".</li>
                  <li>Copie esse ID e cole no campo acima.</li>
                  <li>Clique em "Salvar Configurações".</li>
                </ol>
                
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
                  <h3 className="text-sm font-medium text-blue-800 mb-2">Benefícios do Google Analytics</h3>
                  <ul className="list-disc pl-5 text-sm text-blue-700 space-y-1">
                    <li>Análise de tráfego detalhada</li>
                    <li>Dados demográficos dos visitantes</li>
                    <li>Taxas de conversão</li>
                    <li>Tempo na página</li>
                    <li>Relatórios personalizados</li>
                    <li>Integração com outras ferramentas do Google</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsAnalytics; 