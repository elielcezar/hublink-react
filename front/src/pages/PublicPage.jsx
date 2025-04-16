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
        console.log('Estilo recebido:', response.data.style);
        
        setPage(response.data);
        
        // Verificar se os componentes já estão formatados corretamente
        const parsedComponents = response.data.components.map(comp => ({
          ...comp,
          content: typeof comp.content === 'string' ? JSON.parse(comp.content) : comp.content
        }));
        
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
      // Aplicar a cor de fundo ao body
      document.body.style.backgroundColor = pageStyle.backgroundColor || '#ffffff';
      document.body.style.color = pageStyle.textColor || '#333333';
      document.body.style.fontFamily = pageStyle.fontFamily || 'Inter, sans-serif';
      
      // Criar variáveis CSS globais
      document.documentElement.style.setProperty('--link-color', pageStyle.linkColor || '#3b82f6');
      document.documentElement.style.setProperty('--text-color', pageStyle.textColor || '#333333');
      
      // Função de limpeza para restaurar os estilos padrão quando o componente for desmontado
      return () => {
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
    <div 
      className="min-h-screen"
      style={{ 
        "--link-color": pageStyle?.linkColor || '#3b82f6',
        "--text-color": pageStyle?.textColor || '#333333',
      }}
    >
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Conteúdo da landing page */}
        <header className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{page?.title}</h1>
          <div className="w-16 h-1 bg-blue-600 mx-auto"></div>
        </header>
        
        <main>
          <div className="flex flex-wrap -mx-2">
            {components.map((component) => {
              const ComponentRenderer = componentRenderers[component.type];
              return ComponentRenderer ? (
                <React.Fragment key={component.id}>
                  <ComponentRenderer content={component.content} />
                </React.Fragment>
              ) : null;
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