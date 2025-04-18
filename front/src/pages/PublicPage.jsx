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
import AnalyticsTracker from '../components/AnalyticsTracker';

// Reutilizando os mesmos componentes de renderização da página do editor
const componentRenderers = {
  text: ({ content }) => <TextRenderer content={content} />,
  
  link: ({ content }) => <LinkRenderer content={content} />,
  
  banner: ({ content }) => <BannerRenderer content={content} />,
  
  carousel: ({ content }) => <CarouselRenderer content={content} />,

  social: ({ content }) => <SocialRenderer content={content} />,

  icon: ({ content }) => <IconRenderer content={content} />
};

const PublicPage = () => {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pageStyle, setPageStyle] = useState({
    backgroundColor: '#ffffff',
    fontFamily: 'Inter, sans-serif',
    linkColor: '#3b82f6',
    textColor: '#333333'
  });

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/public/pages/${slug}`);
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
        
        // Obter o estilo diretamente da resposta
        if (response.data.style) {
          console.log('Aplicando estilo:', response.data.style);
          setPageStyle(response.data.style);
        } else {
          console.log('Nenhum estilo encontrado na resposta');
        }
      } catch (error) {
        console.error('Erro ao buscar dados da página:', error);
        setError('Esta página não existe ou não está publicada.');
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
      
      <div className="px-4 py-6 w-full lg:max-w-[40vw] mx-auto">
        {/* Conteúdo da landing page */}
        <header className="text-center mb-6">
          {pageStyle.logo && (
            <div className="flex justify-center">
              <img 
                src={pageStyle.logo} 
                alt="Logo" 
                className="max-h-36 object-contain"
              />
            </div>
          )}                    
        </header>
        
        <main>
          <div className="flex flex-wrap -mx-2">
            {components.map((component) => {
              // Verificar se o componente é válido
              if (!component || !component.type || !component.id) {
                console.warn('Componente inválido:', component);
                return null;
              }
              
              const ComponentRenderer = componentRenderers[component.type];
              
              if (!ComponentRenderer) {
                console.warn(`Renderer não encontrado para o tipo: ${component.type}`);
                return null;
              }
              
              return (
                <React.Fragment key={component.id}>
                  <ComponentRenderer content={component.content || {}} />
                </React.Fragment>
              );
            })}
          </div>
        </main>
        
        <footer className="mt-16 pt-8 border-t border-gray-200 text-center text-gray-500 text-sm">
          <p>Criado com HubLink</p>
        </footer>
      </div>
    </div>
  );
};

export default PublicPage; 