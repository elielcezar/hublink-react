import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import React from 'react';
import axios from 'axios';
import CarouselComponent from '../components/CarouselComponent';
import { FaInstagram, FaTwitter, FaYoutube, FaTiktok, FaSpotify } from 'react-icons/fa';

// Reutilizando os mesmos componentes de renderização da página do editor
const componentRenderers = {
  text: ({ content }) => (
    <div className="prose max-w-none mb-4" dangerouslySetInnerHTML={{ __html: content.text }} />
  ),
  
  link: ({ content }) => {
    const width = content.width || '100';
    
    // Define corretamente a classe de largura
    let widthClass;
    if (width === '100') {
      widthClass = 'w-full'; // Ocupa toda a largura
    } else if (width === '50') {
      widthClass = 'w-full md:w-1/2'; // Metade da largura em telas médias e grandes
    } else {
      widthClass = 'w-full md:w-1/3'; // Um terço da largura em telas médias e grandes
    }
    
    // Verificar se há imagem
    const hasImage = content.imageUrl && content.imageUrl.trim() !== '';
    const imagePosition = content.imagePosition || 'left';
    
    return (
      <div className={`${widthClass} px-2 mb-4`}>
        <div className={`h-full flex ${hasImage && imagePosition === 'top' ? 'flex-col' : 'items-center'} 
          ${hasImage && imagePosition === 'right' ? 'flex-row-reverse' : 'flex-row'} 
          border border-gray-200 rounded-lg p-4 transition-all hover:shadow-md`}>
          
          {hasImage && (
            <div className={`
              ${imagePosition === 'top' ? 'w-full mb-3' : 'w-1/3 flex-shrink-0 mx-3'} 
            `}>
              <img 
                src={content.imageUrl} 
                alt="" 
                className="w-full h-auto rounded-lg"
              />
            </div>
          )}
          
          <div className={`${hasImage && imagePosition !== 'top' ? 'w-2/3' : 'w-full'}`}>
            <a 
              href={content.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className={`inline-block px-4 py-2 rounded ${
                content.style === 'primary' 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {content.text}
            </a>
          </div>
        </div>
      </div>
    );
  },
  
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
              <span className="text-gray-700">
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </span>
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

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/public/pages/${slug}`);
        setPage(response.data);
        
        // Verificar se os componentes já estão formatados corretamente
        const parsedComponents = response.data.components.map(comp => ({
          ...comp,
          content: typeof comp.content === 'string' ? JSON.parse(comp.content) : comp.content
        }));
        
        setComponents(parsedComponents);
      } catch (error) {
        console.error('Erro ao buscar dados da página:', error);
        setError('Esta página não existe ou não está publicada.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPageData();
  }, [slug]);

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
  
  return (
    <div className="min-h-screen bg-white">
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