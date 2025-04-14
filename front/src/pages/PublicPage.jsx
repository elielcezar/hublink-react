import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import React from 'react';
import axios from 'axios';
import CarouselComponent from '../components/__DELETE__CarouselComponent';
import { FaInstagram, FaTwitter, FaYoutube, FaTiktok, FaSpotify } from 'react-icons/fa';
import LinkRenderer from '../components/editor/renderers/LinkRenderer';

// Reutilizando os mesmos componentes de renderização da página do editor
const componentRenderers = {
  text: ({ content }) => (
    <div className="prose max-w-none mb-4" dangerouslySetInnerHTML={{ __html: content.text }} />
  ),
  
  link: ({ content }) => (
    <LinkRenderer content={content} />
  ),
  
  banner: ({ content }) => (
    <div className="mb-4">
      <img 
        src={content.imageUrl} 
        alt={content.altText || ''} 
        className="w-full h-auto rounded-lg shadow-md"
      />
      {content.caption && (
        <p className="mt-2 text-sm text-gray-600 text-center">{content.caption}</p>
      )}
    </div>
  ),
  
  carousel: ({ content }) => (
    <div className="w-full mb-6">
      <CarouselComponent
        images={content.images || []}
        config={content.config || {
          slidesPerView: 1,
          showNavigation: true,
          showPagination: true,
          spaceBetween: 30,
          loop: true
        }}
      />
    </div>
  ),

  social: ({ content }) => (
    <div className="w-full mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(content).map(([key, value]) => {
          if (!value) return null;
          
          const icons = {
            instagram: <FaInstagram className="text-pink-600" />,
            x: <FaTwitter className="text-blue-400" />,
            youtube: <FaYoutube className="text-red-600" />,
            tiktok: <FaTiktok className="text-black" />,
            spotify: <FaSpotify className="text-green-600" />
          };

          return (
            <a
              key={key}
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-2xl">
                {icons[key]}
              </div>             
            </a>
          );
        })}
      </div>
    </div>
  )
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