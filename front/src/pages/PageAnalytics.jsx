import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import MenuDashboard from '../components/MenuDashboard';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const PageAnalytics = () => {
  const { id } = useParams();
  const [page, setPage] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d');
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Sessão expirada. Faça login novamente.');
          return;
        }
        
        // Buscar informações da página
        const pageResponse = await axios.get(`${API_BASE_URL}/api/pages/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPage(pageResponse.data);
        
        // Buscar dados de analytics
        const analyticsResponse = await axios.get(`${API_BASE_URL}/api/pages/${id}/analytics`, {
          params: { period },
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('Dados de analytics recebidos:', analyticsResponse.data);
        
        // Processar e garantir datas corretas
        const processedData = {
          ...analyticsResponse.data,
          dailyStats: analyticsResponse.data.dailyStats.map(day => ({
            ...day,
            date: new Date(day.date) // Garantir que é um objeto Date
          }))
        };
        
        setAnalytics(processedData);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        if (error.response?.status === 401 || error.response?.status === 403) {
          setError('Sessão expirada ou acesso não autorizado.');
        } else {
          setError('Não foi possível carregar os dados de analytics.');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, period]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <MenuDashboard />
        <div className="pt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-700">Carregando dados de analytics...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <MenuDashboard />
        <div className="pt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center">
              <div className="text-center max-w-md p-6 bg-white rounded-lg shadow">
                <div className="text-red-600 text-5xl mb-4">⚠️</div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Erro</h2>
                <p className="text-gray-600 mb-4">{error}</p>
                <Link
                  to="/dashboard"
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Voltar para o Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Formatar data para exibição
  const formatDate = (date) => {
    if (!date) return '-';
    
    try {
      // Garantir que temos um objeto Date
      const dateObj = date instanceof Date ? date : new Date(date);
      return dateObj.toLocaleDateString('pt-BR');
    } catch (e) {
      console.error('Erro ao formatar data:', e, date);
      return '-';
    }
  };
  
  // Função para formatar números com separador de milhar
  const formatNumber = (num) => {
    return new Intl.NumberFormat('pt-BR').format(num);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <MenuDashboard />
      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics: {page.title}</h1>
              <p className="text-sm text-gray-500">
                <span className="font-medium">URL:</span> {window.location.origin}/{page.slug}
              </p>
            </div>
            
            <div className="mt-4 sm:mt-0 flex space-x-2">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="bg-white border border-gray-300 text-gray-700 py-2 px-3 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="7d">Últimos 7 dias</option>
                <option value="30d">Últimos 30 dias</option>
                <option value="90d">Últimos 90 dias</option>
                <option value="all">Todo o período</option>
              </select>
              
              <Link
                to="/dashboard"
                className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Voltar
              </Link>
            </div>
          </div>          
          
          {/* Cards com resumo */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Total de Visitas</h3>
              <p className="text-3xl font-bold text-blue-600">{formatNumber(analytics.summary.totalVisits)}</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Total de Cliques</h3>
              <p className="text-3xl font-bold text-green-600">{formatNumber(analytics.summary.totalClicks)}</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Tempo Médio</h3>
              <p className="text-3xl font-bold text-orange-600">
                {Math.round(analytics.summary.avgTimeSpent)}s
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Taxa de Rejeição</h3>
              <p className="text-3xl font-bold text-red-600">
                {Math.round(analytics.summary.bounceRate)}%
              </p>
            </div>
          </div>
          
          {/* Tráfego por Dias */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Tráfego por Dia</h2>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Visitas
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliques
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {analytics.dailyStats.length > 0 ? (
                      analytics.dailyStats.map((day, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(day.date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatNumber(day.visits)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatNumber(day.clicks)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                          Sem dados para este período
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Dispositivos */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Dispositivos</h2>
              </div>
              <div className="p-6">
                {analytics.deviceStats.length > 0 ? (
                  <div className="space-y-4">
                    {analytics.deviceStats.map((item, index) => {
                      const percentage = analytics.summary.totalVisits > 0 
                        ? (item.count / analytics.summary.totalVisits) * 100 
                        : 0;
                      
                      // Cores para os diferentes tipos de dispositivos
                      const colors = {
                        desktop: 'bg-blue-500',
                        mobile: 'bg-green-500',
                        tablet: 'bg-purple-500',
                        desconhecido: 'bg-gray-500'
                      };
                      
                      // Nomes em português
                      const deviceNames = {
                        desktop: 'Desktop',
                        mobile: 'Celular',
                        tablet: 'Tablet',
                        desconhecido: 'Desconhecido'
                      };
                      
                      return (
                        <div key={index}>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700">
                              {deviceNames[item.device] || item.device}
                            </span>
                            <span className="text-sm font-medium text-gray-700">
                              {Math.round(percentage)}% ({item.count})
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className={`${colors[item.device] || 'bg-gray-500'} h-2.5 rounded-full`} 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-gray-500">Sem dados para este período</p>
                )}
              </div>
            </div>
            
            {/* Componentes mais clicados */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Componentes mais clicados</h2>
              </div>
              <div className="p-6">
                {analytics.componentClicks.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Componente
                          </th>
                          <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tipo
                          </th>
                          <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Cliques
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {analytics.componentClicks
                          .sort((a, b) => b.clicks - a.clicks)
                          .map((component, i) => {
                            // Tradução dos tipos de componentes
                            const typeTranslations = {
                              link: 'Link',
                              text: 'Texto',
                              banner: 'Banner',
                              carousel: 'Carrossel',
                              social: 'Redes Sociais',
                              icon: 'Ícone'
                            };
                            
                            return (
                              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                  {component.title || `Componente ${component.id}`}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                  {typeTranslations[component.type] || component.type}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900 text-right">
                                  {formatNumber(component.clicks)}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-4">
                    Nenhum clique registrado neste período
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {/* Seção para Configurar Google Analytics */}
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Integração com Google Analytics</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Além do analytics interno do HubLink, você também pode integrar sua página com o Google Analytics para obter métricas mais detalhadas e avançadas.
              </p>
              
              <Link
                to="/settings/analytics"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                Configurar Google Analytics
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageAnalytics; 