import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import React from 'react';
import axios from 'axios';
import LinkRenderer from '../components/editor/renderers/LinkRenderer';
import IconRenderer from '../components/editor/renderers/IconRenderer';
import TextRenderer from '../components/editor/renderers/TextRenderer';
import CarouselRenderer from '../components/editor/renderers/CarouselRenderer';
import BannerRenderer from '../components/editor/renderers/BannerRenderer';
import SocialRenderer from '../components/editor/renderers/SocialRenderer';
import VideoRenderer from '../components/editor/renderers/VideoRenderer';
import AnalyticsTracker from '../components/AnalyticsTracker';

// Adicionar o defaultStyle no início do arquivo
const defaultStyle = {
  backgroundColor: '#ffffff',
  fontFamily: 'Inter, sans-serif',
  linkColor: '#3b82f6',
  linkBackgroundColor: '#3b82f6',
  linkTextColor: '#ffffff',
  linkShadowColor: '#000000',
  linkShadowIntensity: 4,
  linkShadowBlur: 4,
  linkShadowOpacity: 20,
  linkBorderRadius: 8,
  textColor: '#333333',
  backgroundImage: null,
  logo: null,
  backgroundType: 'color',
  gradientStartColor: '#4f46e5',
  gradientEndColor: '#818cf8',
  gradientDirection: 'to right'
};

// Reutilizando os mesmos componentes de renderização da página do editor
const componentRenderers = {
  text: ({ content, pageStyle }) => <TextRenderer content={content} pageStyle={pageStyle} />,
  
  link: ({ content, pageStyle }) => <LinkRenderer content={content} pageStyle={pageStyle} />,
  
  banner: ({ content, pageStyle }) => <BannerRenderer content={content} pageStyle={pageStyle} />,
  
  carousel: ({ content, pageStyle }) => <CarouselRenderer content={content} pageStyle={pageStyle} />,

  social: ({ content, pageStyle }) => <SocialRenderer content={content} pageStyle={pageStyle} />,

  icon: ({ content, pageStyle }) => <IconRenderer content={content} pageStyle={pageStyle} />,

  video: ({ content, pageStyle }) => <VideoRenderer content={content} pageStyle={pageStyle} />
};

const PublicPage = () => {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pageStyle, setPageStyle] = useState(defaultStyle);
  
  // Detectar se estamos em um dispositivo móvel
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
  
  // Log para diagnóstico
  useEffect(() => {
    console.log('PublicPage carregada:', {
      slug,
      isMobile,
      userAgent: navigator.userAgent,
      url: window.location.href,
      apiUrl: import.meta.env.VITE_API_URL || 'Não definido'
    });
  }, [slug]);

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        // Log da URL completa para diagnóstico
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002';
        const url = `${apiUrl}/api/public/pages/${slug}`;
        console.log(`Fazendo requisição GET para: ${url}`);
        
        const response = await axios.get(url);
        console.log('Resposta da API:', response.data);
        
        setPage(response.data);
        
        // Verificar e preparar componentes com IDs válidos para rastreamento
        const parsedComponents = response.data.components.map(comp => {
          const content = typeof comp.content === 'string' ? JSON.parse(comp.content) : comp.content;
          
          // Verificar se o componente tem ID válido
          if (!comp.id || isNaN(parseInt(comp.id, 10))) {
            console.warn('Componente sem ID válido:', comp);
          }
          
          return {
            ...comp,
            id: comp.id,  // Garantir que o ID está definido
            content: content
          };
        }).filter(comp => comp.type && comp.content); // Filtrar componentes inválidos
        
        setComponents(parsedComponents);
        
        // Carregar o estilo da página - combinando com defaultStyle
        const completeStyle = {
          ...defaultStyle,
          ...response.data.style
        };
        
        console.log('Estilo completo aplicado:', completeStyle);
        setPageStyle(completeStyle);
        
      } catch (error) {
        console.error('Erro ao buscar dados da página:', error);
        // Informação mais detalhada sobre o erro
        let errorMessage = 'Esta página não existe ou não está publicada.';
        
        if (error.response) {
          // O servidor respondeu com um código de status diferente de 2xx
          console.error('Detalhes do erro:', {
            status: error.response.status,
            statusText: error.response.statusText,
            data: error.response.data
          });
          
          if (error.response.status === 404) {
            errorMessage = `A página "${slug}" não foi encontrada.`;
          } else if (error.response.status === 403) {
            errorMessage = 'Esta página existe, mas não está publicada.';
          }
        } else if (error.request) {
          // A requisição foi feita mas não houve resposta
          console.error('Sem resposta do servidor:', error.request);
          errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão.';
        } else {
          // Algo aconteceu ao configurar a requisição
          console.error('Erro ao configurar requisição:', error.message);
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPageData();
  }, [slug]);

  // Aplicar estilo ao body quando o pageStyle mudar
  useEffect(() => {
    if (pageStyle) {
      // Aplicar a fonte e cor do texto
      document.body.style.color = pageStyle.textColor || '#333333';
      document.body.style.fontFamily = pageStyle.fontFamily || 'Inter, sans-serif';
      
      // Aplicar fundo com base no tipo selecionado
      if (pageStyle.backgroundType === 'image' && pageStyle.backgroundImage) {
        document.body.style.backgroundImage = `url(${pageStyle.backgroundImage})`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'fixed';
        document.body.style.backgroundRepeat = 'no-repeat';
        document.body.style.backgroundColor = ''; // Limpar a cor de fundo
      } else if (pageStyle.backgroundType === 'gradient') {
        // Aplicar o degradê
        const gradientDirection = pageStyle.gradientDirection || 'to right';
        const startColor = pageStyle.gradientStartColor || '#4f46e5';
        const endColor = pageStyle.gradientEndColor || '#818cf8';
        
        document.body.style.backgroundImage = `linear-gradient(${gradientDirection}, ${startColor}, ${endColor})`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundRepeat = 'no-repeat';
        document.body.style.backgroundColor = ''; // Limpar a cor de fundo
        
        console.log('Aplicando degradê:', `linear-gradient(${gradientDirection}, ${startColor}, ${endColor})`);
      } else {
        document.body.style.backgroundImage = ''; // Limpar a imagem de fundo
        document.body.style.backgroundColor = pageStyle.backgroundColor || '#ffffff';
      }
      
      // Criar variáveis CSS globais
      document.documentElement.style.setProperty('--link-color', pageStyle.linkColor || '#3b82f6');
      document.documentElement.style.setProperty('--text-color', pageStyle.textColor || '#333333');
      
      // Função de limpeza para restaurar os estilos padrão quando o componente for desmontado
      return () => {
        document.body.style.backgroundImage = '';
        document.body.style.backgroundColor = '';
        document.body.style.color = '';
        document.body.style.fontFamily = '';
        document.documentElement.style.removeProperty('--link-color');
        document.documentElement.style.removeProperty('--text-color');
      };
    }
  }, [pageStyle]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-700">Carregando...</p>
          <p className="text-xs text-gray-500 mt-2">Buscando: {slug}</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center max-w-md p-6 bg-gray-100 rounded-lg shadow-md">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Página não encontrada</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="text-xs text-gray-500 mb-4">
            Slug: {slug} | Dispositivo: {isMobile ? 'Mobile' : 'Desktop'}
          </div>
          <Link
            to="/"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Voltar para a página inicial
          </Link>
        </div>
      </div>
    );
  }
  
  console.log('Renderizando com estilo:', pageStyle);

  return (
    <div className="min-h-screen">
      {/* Adicionar o componente de rastreamento */}
      {page && <AnalyticsTracker pageId={page.id} gaId={page.user?.gaId} pageComponents={components} />}
      
      <div className="px-4 py-6 w-full sm:max-w-[65vw] md:max-w-[65vw] lg:max-w-[40vw] mx-auto">
        {/* Conteúdo da landing page */}
        <header className="text-center mb-6">
          {pageStyle.logo && (
            <div className="flex justify-center">
              <img 
                src={pageStyle.logo} 
                alt="Logo" 
                className="max-w-[24vw] sm:max-w-[15vw] lg:max-w-[10vw] object-contain rounded-full"
                onError={(e) => {
                  console.error(`Erro ao carregar logo: ${pageStyle.logo}`);
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}                    
        </header>
        
        <main>
          {(() => {
            const rows = [];
            let currentRow = [];
            let currentRowWidth = 0;

            components.forEach((component, index) => {
              const isLink = component.type === 'link';
              const width = isLink ? parseInt(component.content?.width || '100') : 100;

              if (width === 100 || !isLink) {
                // Finalizar linha atual se houver
                if (currentRow.length > 0) {
                  rows.push(currentRow);
                  currentRow = [];
                  currentRowWidth = 0;
                }
                // Adicionar componente em linha própria
                rows.push([component]);
              } else {
                // Verificar se cabe na linha atual
                if (currentRowWidth + width <= 100) {
                  currentRow.push(component);
                  currentRowWidth += width;
                  
                  // Se chegou a 100% ou é o último componente, finalizar linha
                  if (currentRowWidth === 100 || index === components.length - 1) {
                    rows.push(currentRow);
                    currentRow = [];
                    currentRowWidth = 0;
                  }
                } else {
                  // Não cabe, finalizar linha atual e começar nova
                  if (currentRow.length > 0) {
                    rows.push(currentRow);
                  }
                  currentRow = [component];
                  currentRowWidth = width;
                }
              }
            });

            // Finalizar última linha se houver
            if (currentRow.length > 0) {
              rows.push(currentRow);
            }

            return rows.map((row, rowIndex) => (
              <div key={rowIndex} className={row.length > 1 ? "mb-4 w-full" : "mb-4 w-full"}>
                {row.map((component) => 
                  componentRenderers[component.type]({ 
                    content: component.content, 
                    pageStyle: pageStyle 
                  })
                )}
              </div>
            ));
          })()}
        </main>
        
        <footer className="mt-16 pt-8 border-t border-gray-200 text-center text-white text-sm">
          <p>Criado com HubLink</p>
        </footer>
      </div>
    </div>
  );
};

export default PublicPage; 