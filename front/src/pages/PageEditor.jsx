import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import React from 'react';
import axios from 'axios';
import CarouselRenderer from '../components/editor/renderers/CarouselRenderer';
import LinkForm from '../components/editor/forms/LinkForm';
import LinkRenderer from '../components/editor/renderers/LinkRenderer';
import MenuDashboard from '../components/MenuDashboard';
import SocialRenderer from '../components/editor/renderers/SocialRenderer';
import BannerRenderer from '../components/editor/renderers/BannerRenderer';
import IconForm from '../components/editor/forms/IconForm';
import IconRenderer from '../components/editor/renderers/IconRenderer';
import TextForm from '../components/editor/forms/TextForm';
import TextRenderer from '../components/editor/renderers/TextRenderer';
import BannerForm from '../components/editor/forms/BannerForm';
import CarouselForm from '../components/editor/forms/CarouselForm';
import SocialForm from '../components/editor/forms/SocialForm';

// Componentes para renderização na prévia
const componentRenderers = {
  text: ({ content }) => <TextRenderer content={content} />,
  link: ({ content }) => <LinkRenderer content={content} />,
  banner: ({ content }) => <BannerRenderer content={content} />,
  carousel: ({ content }) => <CarouselRenderer content={content} />,
  social: ({ content }) => <SocialRenderer content={content} />,
  icon: ({ content }) => <IconRenderer content={content} />
};

// Formulários para edição dos componentes
const componentForms = {
  text: ({ content, onChange }) => <TextForm content={content} onChange={onChange} />,
  link: ({ content, onChange }) => <LinkForm content={content} onChange={onChange} />,
  banner: ({ content, onChange }) => <BannerForm content={content} onChange={onChange} />,
  carousel: ({ content, onChange }) => <CarouselForm content={content} onChange={onChange} />,
  social: ({ content, onChange }) => <SocialForm content={content} onChange={onChange} />,
  icon: ({ content, onChange }) => <IconForm content={content} onChange={onChange} />
};

// Valores padrão para novos componentes
const defaultComponentValues = {
  text: { 
    title: 'Bloco de Texto',
    text: '<p>Digite seu texto aqui</p>' 
  },
  link: { 
    title: 'Link',
    text: 'Clique aqui', 
    url: 'https://', 
    style: 'primary',
    width: '100',
    imageUrl: '',
    imagePosition: 'left',
    backgroundColor: '',
    textColor: ''
  },
  banner: { 
    title: 'Banner',
    imageUrl: '', 
    altText: '', 
    caption: '' 
  },
  carousel: {
    title: 'Carrossel',
    images: [],
    config: {
      slidesPerView: 1,
      showNavigation: true,
      showPagination: true,
      spaceBetween: 30,
      loop: true,
      autoplay: false,
      autoplayDelay: 3000,
      pauseOnHover: true,
      controlsColor: '#000000'
    }
  },
  social: {
    title: 'Redes Sociais',
    instagram: '',
    x: '',
    youtube: '',
    tiktok: '',
    kwai: '',
    spotify: '',
    iconColor: '#0077B5'
  },
  icon: {
    title: 'Ícone',
    text: 'Texto do Ícone', 
    url: 'https://', 
    imageUrl: '',
    height: 'medium',
    width: '100',
    overlayColor: 'rgba(0, 0, 0, 0.4)',
    textColor: '#ffffff'
  }
};

const PageEditor = () => {
  const { pageId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);  
  const [page, setPage] = useState(null);
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [error, setError] = useState('');
  const [expandedComponent, setExpandedComponent] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    
    const fetchPageData = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/pages/${pageId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Garantir que a página tenha um objeto style, mesmo que vazio
        setPage({
          ...response.data,
          style: response.data.style || {
            backgroundColor: '#ffffff',
            fontFamily: 'Inter, sans-serif',
            linkColor: '#3b82f6',
            textColor: '#333333'
          }
        });
        
        // Converter os componentes para objetos com content parseado
        const parsedComponents = response.data.components.map(comp => ({
          ...comp,
          content: typeof comp.content === 'string' ? JSON.parse(comp.content) : comp.content
        }));
        
        setComponents(parsedComponents);
      } catch (error) {
        console.error('Erro ao buscar dados da página:', error);
        setError('Erro ao carregar a página. Verifique se você tem permissão para editá-la.');
        
        if (error.response?.status === 401 || error.response?.status === 403) {
          navigate('/dashboard');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchPageData();
  }, [pageId, navigate]);
  
  useEffect(() => {
    if (page?.style) {
      // Buscar o elemento de preview 
      const previewElement = document.getElementById('page-preview-container');
      
      if (previewElement) {
        // Aplicar cor de fundo ou imagem de fundo
        if (page.style.backgroundType === 'image' && page.style.backgroundImage) {
          previewElement.style.backgroundImage = `url(${page.style.backgroundImage})`;
          previewElement.style.backgroundSize = 'cover';
          previewElement.style.backgroundPosition = 'center';
          previewElement.style.backgroundRepeat = 'no-repeat';
          previewElement.style.backgroundColor = '';
        } else {
          previewElement.style.backgroundImage = '';
          previewElement.style.backgroundColor = page.style.backgroundColor || '#ffffff';
        }
        
        // Aplicar fonte e cor do texto
        previewElement.style.fontFamily = page.style.fontFamily || 'Inter, sans-serif';
        previewElement.style.color = page.style.textColor || '#333333';
      }
    }
  }, [page?.style]);
  
  const addComponent = async (type) => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `http://localhost:3001/api/pages/${pageId}/components`,
        {
          type,
          content: defaultComponentValues[type]
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Adicionar o novo componente à lista
      setComponents([...components, response.data]);
      
      // Expandir o componente recém-adicionado para edição
      setExpandedComponent(response.data.id);
      setHasUnsavedChanges(true);
    } catch (error) {
      console.error('Erro ao adicionar componente:', error);
      setError('Erro ao adicionar componente. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };
  
  const deleteComponent = async (componentId) => {
    if (!confirm('Tem certeza que deseja excluir este componente?')) {
      return;
    }
    
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      await axios.delete(`http://localhost:3001/api/components/${componentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Remover o componente da lista
      setComponents(components.filter(c => c.id !== componentId));
      
      // Se o componente excluído estava expandido, colapsar
      if (expandedComponent === componentId) {
        setExpandedComponent(null);
      }
      setHasUnsavedChanges(true);
    } catch (error) {
      console.error('Erro ao excluir componente:', error);
      setError('Erro ao excluir componente. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };
  
  const moveComponent = async (componentId, direction) => {
    // Encontrar o índice atual
    const currentIndex = components.findIndex(c => c.id === componentId);
    if (currentIndex === -1) return;
    
    // Calcular novo índice
    const newIndex = direction === 'up' 
      ? Math.max(0, currentIndex - 1)
      : Math.min(components.length - 1, currentIndex + 1);
    
    // Se não houver mudança, sair
    if (newIndex === currentIndex) return;
    
    // Criar nova ordem de componentes
    const newComponents = [...components];
    const [movedItem] = newComponents.splice(currentIndex, 1);
    newComponents.splice(newIndex, 0, movedItem);
    
    // Atualizar estado local imediatamente para UI responsiva
    setComponents(newComponents);
    
    // Preparar array de IDs para enviar ao backend
    const componentIds = newComponents.map(c => c.id);
    
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      await axios.put(
        `http://localhost:3001/api/pages/${pageId}/reorder`,
        { componentIds },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error('Erro ao reordenar componentes:', error);
      setError('Erro ao salvar a nova ordem. Tente novamente.');
    } finally {
      setSaving(false);
    }
    setHasUnsavedChanges(true);
  };
  
  const togglePublish = async () => {
    if (!page) return;
    
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.put(
        `http://localhost:3001/api/pages/${pageId}`,
        {
          title: page.title,
          slug: page.slug,
          published: !page.published
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setPage(response.data);
    } catch (error) {
      console.error('Erro ao publicar/despublicar página:', error);
      setError('Erro ao alterar status de publicação. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };
  
  const handleComponentUpdate = (componentId, newContent) => {
    setComponents(components.map(component => 
      component.id === componentId 
        ? { ...component, content: newContent } 
        : component
    ));
    setHasUnsavedChanges(true);
  };
  
  const saveComponents = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 
        Authorization: `Bearer ${token}` 
      };
      
      // Para cada componente, fazer uma requisição separada
      for (const component of components) {
        // Normalizar o conteúdo para garantir que seja uma string JSON
        const contentToSave = typeof component.content === 'object' 
          ? component.content
          : JSON.parse(component.content);
        
        if (component.id && !isNaN(component.id)) {
          // Se o componente já existe, atualize-o
          await axios.put(
            `${import.meta.env.VITE_API_URL}/api/components/${component.id}`,
            {
              type: component.type,
              content: contentToSave
            },
            { headers }
          );
        } else {
          // Se é um componente novo, crie-o
          await axios.post(
            `${import.meta.env.VITE_API_URL}/api/pages/${pageId}/components`,
            {
              type: component.type,
              content: contentToSave
            },
            { headers }
          );
        }
      }
      
      setSaving(false);
      setHasUnsavedChanges(false);
      alert('Alterações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar componentes:', error);
      setSaving(false);
      setError('Erro ao salvar. Por favor, tente novamente.');
    }
  };
  
  const fetchPageStyle = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/pages/${pageId}/style`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Atualizar apenas o estilo, mantendo os outros dados da página
      setPage(prevPage => ({
        ...prevPage,
        style: response.data.style || {
          backgroundColor: '#ffffff',
          fontFamily: 'Inter, sans-serif',
          linkColor: '#3b82f6',
          textColor: '#333333'
        }
      }));
    } catch (error) {
      console.error('Erro ao buscar estilo da página:', error);
    }
  };
  
  useEffect(() => {
    // Adicione um event listener para quando a janela recebe foco novamente
    const handleFocus = () => {
      // Recarregar o estilo da página quando a janela recebe foco
      fetchPageStyle();
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [pageId]);
  
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-700">Carregando editor...</p>
        </div>
      </div>
    );
  }
  
  if (error && !page) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-md">
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
    );
  }

  const handleLogout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/');
  };
  
  return (
    <>
    <div className="flex flex-row min-h-screen">
    
      <MenuDashboard />

      <div className="min-h-screen bg-gray-100 w-11/12">
        
        <nav className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-gray-900">
                  Hub<span className="text-blue-600">Link</span>
                </h1>

                <h2 className="text-xl font-bold text-gray-900">
                  {page?.title}
                </h2>

                <span className="text-gray-700 mr-4">Olá, {user?.name}</span>

                <div className="flex items-center space-x-4">
                  <button
                      onClick={saveComponents}
                      disabled={saving || !hasUnsavedChanges}
                      className={`px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center ${
                        hasUnsavedChanges
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {saving ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Salvando...
                        </>
                      ) : hasUnsavedChanges ? (
                        'Salvar Alterações'
                      ) : (
                        'Alterações Salvas'
                      )}
                    </button>
                                    
                  <button
                    onClick={togglePublish}
                    disabled={saving}
                    className={`px-4 py-2 text-sm rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                      page?.published
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {page?.published ? 'Despublicar' : 'Publicar'}
                  </button>
                                
                </div>

                <button  onClick={handleLogout} className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    Sair
                  </button> 
              </div>
              
            </div>
          </div>
        </nav>

        {error && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          </div>
        )}

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row gap-x-12">
            {/* Coluna de edição - Esquerda */}
            <div className="md:w-8/12 space-y-4">
              <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Editor de Componentes
                  </h2>
                  
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => addComponent('text')}
                    disabled={saving}
                    className="px-4 py-3 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Texto
                  </button>
                  <button
                    onClick={() => addComponent('link')}
                    disabled={saving}
                    className="px-4 py-3 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Link
                  </button>
                  <button
                    onClick={() => addComponent('banner')}
                    disabled={saving}
                    className="px-4 py-3 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Banner
                  </button>
                  <button
                    onClick={() => addComponent('carousel')}
                    disabled={saving}
                    className="px-4 py-3 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Carrossel
                  </button>
                  <button
                    onClick={() => addComponent('social')}
                    disabled={saving}
                    className="px-4 py-3 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Redes Sociais
                  </button>
                  <button
                    onClick={() => addComponent('icon')}
                    disabled={saving}
                    className="px-4 py-3 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Ícone
                  </button>
                </div>
              </div>
              
              {components.length > 0 ? (
                <div className="space-y-4">
                  {components.map((component, index) => (
                    <div
                      key={component.id}
                      className="bg-white rounded-lg shadow-md overflow-hidden"
                    >
                      <div
                        onClick={() => setExpandedComponent(
                          expandedComponent === component.id ? null : component.id
                        )}
                        className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50"
                      >
                        <div className="flex items-center">
                          <span className="text-gray-500 mr-2">
                            {index + 1}.
                          </span>
                          <h3 className="font-medium capitalize">
                            {component.content.title || getComponentDefaultTitle(component.type)}
                          </h3>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              moveComponent(component.id, 'up');
                            }}
                            disabled={index === 0 || saving}
                            className={`text-gray-500 hover:text-gray-700 ${index === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              moveComponent(component.id, 'down');
                            }}
                            disabled={index === components.length - 1 || saving}
                            className={`text-gray-500 hover:text-gray-700 ${index === components.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            ▼
                          </button>
                          <span className="mx-1 text-gray-300">|</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteComponent(component.id);
                            }}
                            disabled={saving}
                            className="text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                      
                      {expandedComponent === component.id && (
                        <div className="border-t border-gray-200 p-4">
                          {componentForms[component.type]({
                            content: component.content,
                            onChange: (newContent) => handleComponentUpdate(component.id, newContent)
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white p-8 rounded-lg shadow-md text-center">
                  <p className="text-gray-600">
                    Esta página ainda não tem componentes.
                  </p>
                  <p className="mt-2 text-gray-600">
                    Use os botões acima para adicionar conteúdo à sua landing page.
                  </p>
                </div>
              )}
            </div>
            
            {/* Prévia - Direita */}
            <div className="md:w-4/12">
              <div className="p-4">
              
                
              {page?.published && (
                <p className="text-sm text-gray-500 mb-4 text-center">                  
                  <a
                    href={`/${page.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    hublink.app/{page.slug} 
                  </a>
                </p>
                )}
                
                <div 
                  id="page-preview-container"
                  className="bg-gray-50 border-[15px] border-black rounded-[60px] h-[75vh] overflow-hidden"
                >
                  {components.length > 0 ? (
                    <div className="h-[75vh] p-6 overflow-y-scroll overflow-x-hidden">
                      {/* Adicionar o logo aqui, similar ao PublicPage */}
                      {page?.style?.logo && (
                        <header className="text-center mb-6">
                          <div className="flex justify-center">
                            <img 
                              src={page.style.logo} 
                              alt="Logo" 
                              className="max-h-36 object-contain"
                            />
                          </div>
                        </header>
                      )}
                      
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
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-gray-400 text-center">
                        Adicione componentes para ver a prévia aqui
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      </div>
    </>
    
  );
};

// Função de debounce
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Adicionar esta função para determinar o título padrão para cada tipo de componente
const getComponentDefaultTitle = (type) => {
  const defaults = {
    text: 'Bloco de Texto',
    link: 'Link',
    banner: 'Banner',
    carousel: 'Carrossel',
    social: 'Redes Sociais',
    icon: 'Ícone'
  };
  return defaults[type] || 'Componente';
};

// Função para obter o rótulo de cada tipo de componente
const getComponentLabel = (type) => {
  const labels = {
    text: 'Texto',
    link: 'Link',
    banner: 'Banner',
    carousel: 'Carrossel',
    social: 'Redes Sociais',
    icon: 'Ícone'
  };
  return labels[type] || 'Componente';
};

export default PageEditor; 