import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import MenuDashboard from '../components/MenuDashboard';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  BarElement
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import html2pdf from 'html2pdf.js';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Corrigir o problema de ícones no Leaflet
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const PageAnalytics = () => {
  const { id } = useParams();
  const [page, setPage] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d');
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('chart'); // 'chart' ou 'table'
  const [showAllComponents, setShowAllComponents] = useState(false);
  const reportRef = useRef(null);
  
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
  
  // Configurações do gráfico de tráfego
  const prepareChartData = () => {
    if (!analytics || !analytics.dailyStats || analytics.dailyStats.length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }
    
    // Ordenar os dados por data
    const sortedData = [...analytics.dailyStats].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Preparar labels (datas formatadas)
    const labels = sortedData.map(day => formatDate(day.date));
    
    // Dados de visitas e cliques
    const visitsData = sortedData.map(day => day.visits);
    const clicksData = sortedData.map(day => day.clicks);
    
    return {
      labels,
      datasets: [
        {
          label: 'Visitas',
          data: visitsData,
          borderColor: 'rgb(59, 130, 246)', // Azul
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 5,
          fill: true,
          tension: 0.3,
          yAxisID: 'y'
        },
        {
          label: 'Cliques',
          data: clicksData,
          borderColor: 'rgb(34, 197, 94)', // Verde
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          borderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 5,
          fill: true,
          tension: 0.3,
          yAxisID: 'y'
        }
      ]
    };
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          precision: 0, // Para garantir que só mostramos números inteiros
          font: {
            size: 11
          }
        },
        title: {
          display: true,
          text: 'Quantidade',
          font: {
            size: 12
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 10
          },
          maxRotation: 45,
          minRotation: 45
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 10,
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#333',
        bodyColor: '#333',
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        padding: 10,
        displayColors: true,
        usePointStyle: true,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            label += formatNumber(context.raw);
            return label;
          }
        }
      }
    },
    interaction: {
      mode: 'index',
      intersect: false
    },
    elements: {
      line: {
        tension: 0.3 // Suavização da linha
      }
    }
  };
  
  // Função para gerar e baixar o PDF
  const downloadAsPDF = () => {
    const element = reportRef.current;
    
    if (!element) return;
    
    // Criar um elemento de estilo para o PDF
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      @media print {
        body { font-family: Arial, sans-serif; }
        .pdf-full-width { width: 100% !important; margin-bottom: 20px !important; }
        .pdf-card { break-inside: avoid; }
        .pdf-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        .pdf-table th { background-color: #f3f4f6 !important; color: #374151; text-align: left; padding: 10px; }
        .pdf-table td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
        .pdf-section-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; color: #1f2937; padding-bottom: 5px; border-bottom: 1px solid #e5e7eb; }
        .pdf-card-content { padding: 15px; }
        .pdf-stats-container { display: flex; flex-wrap: wrap; justify-content: space-between; }
        .pdf-stat-card { width: 48%; margin-bottom: 15px; background: #fff; border-radius: 8px; padding: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .leaflet-container { display: none !important; } /* Esconder o mapa interativo */
        .location-image { max-width: 100%; height: auto; border: 1px solid #eaeaea; border-radius: 4px; }
      }
    `;
    document.head.appendChild(styleElement);
    
    // Adicionar um título temporário para o PDF
    const titleElement = document.createElement('div');
    titleElement.style.padding = '15px';
    titleElement.style.textAlign = 'center';
    titleElement.style.fontSize = '18px';
    titleElement.style.fontWeight = 'bold';
    titleElement.style.marginBottom = '30px';
    titleElement.style.borderBottom = '2px solid #2563eb';
    titleElement.style.color = '#1e40af';
    titleElement.innerHTML = `<div style="font-size: 28px; margin-bottom: 8px;">Relatório de Analytics</div>
                             <div style="font-size: 20px; color: #4b5563; margin-bottom: 5px;">${page.title}</div>
                             <div style="font-size: 14px; color: #6b7280; margin-top: 10px;">Período: ${period === '7d' ? 'Últimos 7 dias' : 
                                                          period === '30d' ? 'Últimos 30 dias' : 
                                                          period === '90d' ? 'Últimos 90 dias' : 
                                                          'Todo o período'}</div>
                             <div style="font-size: 14px; color: #6b7280; margin-top: 5px;">Gerado em: ${new Date().toLocaleDateString('pt-BR')}</div>`;
    
    element.prepend(titleElement);
    
    // Substituir o mapa interativo por uma imagem estática para o PDF
    if (analytics?.geoData && analytics.geoData.length > 0) {
      const mapContainerElement = element.querySelector('.leaflet-container');
      if (mapContainerElement) {
        // Criar uma imagem para o mapa no PDF
        const mapImageContainer = document.createElement('div');
        mapImageContainer.className = 'location-image-container';
        
        // Gerar URL da imagem estática baseada nas coordenadas
        // Limitamos a 10 localizações para não sobrecarregar a URL
        const markers = analytics.geoData.slice(0, 10).map(loc => 
          `markers=color:red%7C${loc.latitude},${loc.longitude}`
        ).join('&');
        
        const mapImageUrl = `https://maps.googleapis.com/maps/api/staticmap?center=0,0&zoom=1&size=800x400&maptype=roadmap&${markers}&key=AIzaSyD-9tSrke72PouQMnMX-a7eZSW0jkFMBWY`;
        
        const mapImage = document.createElement('img');
        mapImage.src = mapImageUrl;
        mapImage.alt = 'Mapa de localizações dos visitantes';
        mapImage.className = 'location-image';
        mapImage.style.width = '100%';
        mapImage.style.height = 'auto';
        
        mapImageContainer.appendChild(mapImage);
        
        // Adicionar a nota sobre os dados de localização
        const mapNote = document.createElement('div');
        mapNote.className = 'text-sm text-gray-600 italic text-center mt-2';
        mapNote.textContent = 'Os dados de localização são aproximados e baseados no endereço IP dos visitantes.';
        mapImageContainer.appendChild(mapNote);
        
        // Esconder o mapa original (em vez de substituir, para manter o estado React)
        mapContainerElement.style.display = 'none';
        mapContainerElement.parentNode.insertBefore(mapImageContainer, mapContainerElement.nextSibling);
      }
    }
    
    // Opções de configuração do PDF
    const options = {
      margin: [15, 15],
      filename: `analytics-${page.slug}-${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    // Notificação temporária
    const notifyElement = document.createElement('div');
    notifyElement.style.position = 'fixed';
    notifyElement.style.bottom = '20px';
    notifyElement.style.left = '50%';
    notifyElement.style.transform = 'translateX(-50%)';
    notifyElement.style.padding = '10px 20px';
    notifyElement.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    notifyElement.style.color = 'white';
    notifyElement.style.borderRadius = '5px';
    notifyElement.style.zIndex = '9999';
    notifyElement.textContent = 'Gerando PDF, aguarde...';
    document.body.appendChild(notifyElement);
    
    // Salvar estado atual
    const currentViewMode = viewMode;
    const currentShowAllComponents = showAllComponents;
    
    // Aplicar configurações específicas para PDF
    setViewMode('table');
    setShowAllComponents(true);
    
    // Guardar elementos para restaurar depois
    const headerButtons = document.querySelector('.mb-6 .flex.space-x-2');
    const googleAnalyticsSection = document.querySelector('.bg-white.rounded-lg.shadow.mb-8');
    const deviceSection = document.querySelector('.grid.grid-cols-1.lg\\:grid-cols-2');
    const graphViewControls = document.querySelectorAll('.px-6.py-5.border-b.border-gray-200.flex.justify-between.items-center .flex.space-x-2');
    const componentsToggleButton = document.querySelector('.bg-white.rounded-lg.shadow.mb-6 .flex.justify-between.items-center button');
    const showMoreButton = document.querySelector('.mt-4.text-center');
    const mapImageContainer = document.querySelector('.location-image-container');
    
    // Esconder elementos desnecessários
    if (headerButtons) headerButtons.style.display = 'none';
    if (googleAnalyticsSection) googleAnalyticsSection.style.display = 'none';
    if (graphViewControls && graphViewControls.length > 0) graphViewControls[0].style.display = 'none';
    if (componentsToggleButton) componentsToggleButton.style.display = 'none';
    if (showMoreButton) showMoreButton.style.display = 'none';
    
    // Ajustar layout para exibir seções em 100% da largura
    if (deviceSection) {
      deviceSection.classList.remove('grid-cols-1', 'lg:grid-cols-2');
      deviceSection.classList.add('grid-cols-1');
      
      // Adicionar classe para melhor formatação
      const deviceCards = deviceSection.querySelectorAll('.bg-white.rounded-lg.shadow');
      deviceCards.forEach(card => {
        card.classList.add('pdf-full-width', 'pdf-card');
        
        // Adicionar classe ao conteúdo interno
        const cardContent = card.querySelector('.p-6');
        if (cardContent) {
          cardContent.classList.add('pdf-card-content');
        }
      });
    }
    
    // Adicionar classes para melhorar tabelas no PDF
    const tables = element.querySelectorAll('table');
    tables.forEach(table => {
      table.classList.add('pdf-table');
    });
    
    // Adicionar classes aos headers das seções
    const sectionHeaders = element.querySelectorAll('.px-6.py-5.border-b.border-gray-200, .px-6.py-5.border-b.border-gray-200.flex.justify-between.items-center');
    sectionHeaders.forEach(header => {
      const title = header.querySelector('h2');
      if (title) {
        title.classList.add('pdf-section-title');
      }
    });

    // Aguardar renderização da tabela
    setTimeout(() => {
      // Gerar e baixar o PDF
      html2pdf().set(options).from(element).save().then(() => {
        // Restaurar estado anterior
        setViewMode(currentViewMode);
        setShowAllComponents(currentShowAllComponents);
        
        // Restaurar elementos escondidos
        if (headerButtons) headerButtons.style.display = '';
        if (googleAnalyticsSection) googleAnalyticsSection.style.display = '';
        if (graphViewControls && graphViewControls.length > 0) graphViewControls[0].style.display = '';
        if (componentsToggleButton) componentsToggleButton.style.display = '';
        if (showMoreButton) showMoreButton.style.display = '';
        
        // Remover a imagem estática do mapa
        if (mapImageContainer) {
          mapImageContainer.parentNode.removeChild(mapImageContainer);
        }
        
        // Restaurar o mapa interativo
        const mapContainerElement = element.querySelector('.leaflet-container');
        if (mapContainerElement) {
          mapContainerElement.style.display = '';
        }
        
        // Restaurar layout
        if (deviceSection) {
          deviceSection.classList.add('grid-cols-1', 'lg:grid-cols-2');
          deviceSection.classList.remove('grid-cols-1');
          
          // Remover classes temporárias
          const deviceCards = deviceSection.querySelectorAll('.bg-white.rounded-lg.shadow');
          deviceCards.forEach(card => {
            card.classList.remove('pdf-full-width', 'pdf-card');
            
            // Remover classe do conteúdo interno
            const cardContent = card.querySelector('.p-6');
            if (cardContent) {
              cardContent.classList.remove('pdf-card-content');
            }
          });
        }
        
        // Remover classes temporárias
        tables.forEach(table => {
          table.classList.remove('pdf-table');
        });
        
        // Remover classes dos headers
        sectionHeaders.forEach(header => {
          const title = header.querySelector('h2');
          if (title) {
            title.classList.remove('pdf-section-title');
          }
        });
        
        // Remover título temporário
        if (element.contains(titleElement)) {
          element.removeChild(titleElement);
        }
        
        // Remover estilos temporários
        if (document.head.contains(styleElement)) {
          document.head.removeChild(styleElement);
        }
        
        // Remover notificação após 3 segundos
        setTimeout(() => {
          document.body.removeChild(notifyElement);
        }, 3000);
      });
    }, 150);
  };
  
  // Mapa de tradução para países
  const countryTranslations = {
    'US': 'Estados Unidos',
    'BR': 'Brasil',
    'UK': 'Reino Unido',
    'GB': 'Reino Unido',
    'FR': 'França',
    'DE': 'Alemanha',
    'IT': 'Itália',
    'ES': 'Espanha',
    'PT': 'Portugal',
    'JP': 'Japão',
    'CN': 'China',
    'CA': 'Canadá',
    'AU': 'Austrália',
    'MX': 'México',
    'AR': 'Argentina',
    'CL': 'Chile',
  };
  
  // Função para traduzir código de país
  const translateCountry = (countryCode) => {
    return countryTranslations[countryCode] || countryCode;
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <MenuDashboard />
      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={reportRef}>
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
              
              <button
                onClick={downloadAsPDF}
                className="bg-blue-50 border border-blue-300 text-blue-700 py-2 px-4 rounded-md shadow-sm hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
                title="Baixar como PDF"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                </svg>
                Baixar PDF
              </button>
              
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
            <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Tráfego por Dia</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setViewMode('chart')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                    viewMode === 'chart' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                  Gráfico
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                    viewMode === 'table' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z" clipRule="evenodd" />
                  </svg>
                  Tabela
                </button>
              </div>
            </div>
            <div className="p-6">
              {analytics.dailyStats.length > 0 ? (
                <div className={`transition-opacity duration-300 ${viewMode === 'chart' ? 'opacity-100' : 'opacity-0 hidden'}`}>
                  <div className="w-full h-72">
                    <Line data={prepareChartData()} options={chartOptions} />
                  </div>
                </div>
              ) : null}
              
              <div className={`transition-opacity duration-300 ${viewMode === 'table' ? 'opacity-100' : 'opacity-0 hidden'}`}>
                {analytics.dailyStats.length > 0 ? (
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
                        {analytics.dailyStats
                          .sort((a, b) => new Date(b.date) - new Date(a.date)) // Ordenar do mais recente para o mais antigo
                          .map((day, i) => (
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
                        }
                      </tbody>
                    </table>
                  </div>
                ) : null}
              </div>
              
              {analytics.dailyStats.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  Sem dados para este período
                </p>
              )}
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
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">Componentes mais clicados</h2>
                {analytics.componentClicks.length > 3 && (
                  <button
                    onClick={() => setShowAllComponents(!showAllComponents)}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium focus:outline-none flex items-center"
                  >
                    {showAllComponents ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        Ver top 3
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        Ver todos
                      </>
                    )}
                  </button>
                )}
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
                          .slice(0, showAllComponents ? undefined : 3)
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
                    {!showAllComponents && analytics.componentClicks.length > 3 && (
                      <div className="mt-4 text-center">
                        <button
                          onClick={() => setShowAllComponents(true)}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium focus:outline-none"
                        >
                          Mostrar todos os {analytics.componentClicks.length} componentes
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-4">
                    Nenhum clique registrado neste período
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {/* Mapa de Visitantes */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Mapa de Visitantes</h2>
            </div>
            <div className="p-6">
              {analytics?.geoData && analytics.geoData.length > 0 ? (
                <>
                  <div className="h-96 w-full rounded-lg overflow-hidden mb-4">
                    <MapContainer 
                      center={[0, 0]} 
                      zoom={2} 
                      scrollWheelZoom={false}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      {analytics.geoData.map((location, index) => (
                        <Marker 
                          key={index} 
                          position={[location.latitude, location.longitude]}
                        >
                          <Popup>
                            <div className="text-sm">
                              <div className="font-medium">{location.city || 'Cidade desconhecida'}</div>
                              <div>{translateCountry(location.country) || 'País desconhecido'}</div>
                            </div>
                          </Popup>
                        </Marker>
                      ))}
                    </MapContainer>
                  </div>
                  <div className="text-sm text-gray-600 italic text-center">
                    Os dados de localização são aproximados e baseados no endereço IP dos visitantes.
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>Nenhum dado de localização disponível para este período</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Estatísticas de Localização */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Países */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Principais Países</h2>
              </div>
              <div className="p-6">
                {analytics?.locationStats && analytics.locationStats.length > 0 ? (
                  <div className="space-y-4">
                    {analytics.locationStats.map((item, index) => {
                      const percentage = analytics.summary.totalVisits > 0 
                        ? (item.count / analytics.summary.totalVisits) * 100 
                        : 0;
                      
                      // Cores para os diferentes países (primeiros 5)
                      const colors = [
                        'bg-blue-500',
                        'bg-green-500',
                        'bg-purple-500',
                        'bg-yellow-500',
                        'bg-red-500',
                        'bg-indigo-500',
                        'bg-pink-500'
                      ];
                      
                      return (
                        <div key={index}>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700">
                              {translateCountry(item.country)}
                            </span>
                            <span className="text-sm font-medium text-gray-700">
                              {Math.round(percentage)}% ({item.count})
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className={`${colors[index % colors.length]} h-2.5 rounded-full`} 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">Sem dados para este período</p>
                )}
              </div>
            </div>
            
            {/* Cidades */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Principais Cidades</h2>
              </div>
              <div className="p-6">
                {analytics?.cityStats && analytics.cityStats.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Cidade
                          </th>
                          <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            País
                          </th>
                          <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Visitas
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {analytics.cityStats.map((city, i) => (
                          <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {city.city}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {translateCountry(city.country)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                              {formatNumber(city.count)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">Sem dados para este período</p>
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