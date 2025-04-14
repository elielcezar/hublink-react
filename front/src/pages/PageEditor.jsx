import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import React from 'react';
import axios from 'axios';
import ImageUploader from '../components/ImageUploader';
import CarouselComponent from '../components/__DELETE__CarouselComponent';
import { FaInstagram, FaTwitter, FaYoutube, FaTiktok, FaSpotify } from 'react-icons/fa';
import LinkForm from '../components/editor/forms/LinkForm';
import LinkRenderer from '../components/editor/renderers/LinkRenderer';
import MenuDashboard from '../components/MenuDashboard';
import { SketchPicker } from 'react-color';

// Componentes para renderização na prévia
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
              className="flex justify-center items-center"
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

// Formulários para edição dos componentes
const componentForms = {
  text: ({ content, onChange }) => (
    <>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Conteúdo HTML
        </label>
        <textarea
          value={content.text}
          onChange={(e) => onChange({ ...content, text: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          rows={6}
          placeholder="<p>Seu texto aqui...</p>"
        />
        <p className="mt-1 text-xs text-gray-500">
          Você pode usar tags HTML para formatar o texto.
        </p>
      </div>
    </>
  ),
  
  link: ({ content, onChange }) => (
    <LinkForm content={content} onChange={onChange} />
  ),
  
  banner: ({ content, onChange }) => (
    <>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Imagem do Banner
        </label>
        <ImageUploader 
          currentImageUrl={content.imageUrl} 
          onImageUpload={(imageUrl) => onChange({ ...content, imageUrl })}
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Texto Alternativo
        </label>
        <input
          type="text"
          value={content.altText || ''}
          onChange={(e) => onChange({ ...content, altText: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Descrição da imagem"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Legenda
        </label>
        <input
          type="text"
          value={content.caption || ''}
          onChange={(e) => onChange({ ...content, caption: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Legenda opcional para a imagem"
        />
      </div>
    </>
  ),
  
  carousel: ({ content, onChange }) => {
    const handleConfigChange = (key, value) => {
      onChange({
        ...content,
        config: {
          ...content.config,
          [key]: value
        }
      });
    };

    const addImage = () => {
      const newImages = [...(content.images || []), { url: '', link: '' }];
      onChange({ ...content, images: newImages });
    };

    const updateImage = (index, field, value) => {
      const newImages = [...content.images];
      newImages[index] = { ...newImages[index], [field]: value };
      onChange({ ...content, images: newImages });
    };

    const removeImage = (index) => {
      const newImages = content.images.filter((_, i) => i !== index);
      onChange({ ...content, images: newImages });
    };

    return (
      <div className="space-y-4">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Slides por visualização
          </label>
          <input
            type="number"
            min="1"
            max="5"
            value={content.config?.slidesPerView || 1}
            onChange={(e) => handleConfigChange('slidesPerView', parseInt(e.target.value))}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Espaçamento entre slides
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={content.config?.spaceBetween || 30}
            onChange={(e) => handleConfigChange('spaceBetween', parseInt(e.target.value))}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="showNavigation"
            checked={content.config?.showNavigation ?? true}
            onChange={(e) => handleConfigChange('showNavigation', e.target.checked)}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="showNavigation" className="ml-2 block text-sm text-gray-700">
            Mostrar setas de navegação
          </label>
        </div>

        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="showPagination"
            checked={content.config?.showPagination ?? true}
            onChange={(e) => handleConfigChange('showPagination', e.target.checked)}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="showPagination" className="ml-2 block text-sm text-gray-700">
            Mostrar paginação
          </label>
        </div>

        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="loop"
            checked={content.config?.loop ?? true}
            onChange={(e) => handleConfigChange('loop', e.target.checked)}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="loop" className="ml-2 block text-sm text-gray-700">
            Loop infinito
          </label>
        </div>

        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="autoplay"
            checked={content.config?.autoplay ?? false}
            onChange={(e) => handleConfigChange('autoplay', e.target.checked)}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="autoplay" className="ml-2 block text-sm text-gray-700">
            Reprodução automática
          </label>
        </div>

        {content.config?.autoplay && (
          <div className="ml-6 space-y-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tempo entre slides (ms)
              </label>
              <input
                type="number"
                min="1000"
                max="10000"
                step="500"
                value={content.config?.autoplayDelay || 3000}
                onChange={(e) => handleConfigChange('autoplayDelay', parseInt(e.target.value))}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Tempo em milissegundos (3000 = 3 segundos)
              </p>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="pauseOnHover"
                checked={content.config?.pauseOnHover ?? true}
                onChange={(e) => handleConfigChange('pauseOnHover', e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="pauseOnHover" className="ml-2 block text-sm text-gray-700">
                Pausar ao passar o mouse
              </label>
            </div>
          </div>
        )}

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Imagens do Carrossel
            </label>
            <button
              type="button"
              onClick={addImage}
              className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Adicionar Imagem
            </button>
          </div>

          {content.images?.map((image, index) => (
            <div key={index} className="mt-4 p-3 border border-gray-200 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-sm">Imagem {index + 1}</h4>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="text-red-600 hover:text-red-800 text-xs"
                >
                  Remover
                </button>
              </div>
              
              <ImageUploader
                currentImage={image.url}
                onImageUpload={(url) => updateImage(index, 'url', url)}
              />
              
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link (opcional)
                </label>
                <input
                  type="url"
                  value={image.link || ''}
                  onChange={(e) => updateImage(index, 'link', e.target.value)}
                  placeholder="https://exemplo.com"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Se fornecido, a imagem será clicável e direcionará para este link.
                </p>
              </div>
            </div>
          ))}

          {(!content.images || content.images.length === 0) && (
            <p className="mt-2 text-sm text-gray-500">
              Nenhuma imagem adicionada. Clique em "Adicionar Imagem" para começar.
            </p>
          )}
        </div>
      </div>
    );
  },

  social: ({ content, onChange }) => {
    const handleChange = (key, value) => {
      onChange({
        ...content,
        [key]: value
      });
    };

    const socialNetworks = [
      { key: 'instagram', label: 'Instagram', icon: <FaInstagram className="text-pink-600" /> },
      { key: 'x', label: 'X (Twitter)', icon: <FaTwitter className="text-blue-400" /> },
      { key: 'youtube', label: 'YouTube', icon: <FaYoutube className="text-red-600" /> },
      { key: 'tiktok', label: 'TikTok', icon: <FaTiktok className="text-black" /> },
      { key: 'spotify', label: 'Spotify', icon: <FaSpotify className="text-green-600" /> }
    ];

    return (
      <div className="space-y-4">
        {socialNetworks.map(({ key, label, icon }) => (
          <div key={key} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center space-x-2">
                <span className="text-xl">{icon}</span>
                <span>{label}</span>
              </div>
            </label>
            <input
              type="text"
              value={content[key] || ''}
              onChange={(e) => handleChange(key, e.target.value)}
              placeholder={`URL do ${label}`}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        ))}
      </div>
    );
  }
};

// Valores padrão para novos componentes
const defaultComponentValues = {
  text: { text: '<p>Digite seu texto aqui</p>' },
  link: { 
    text: 'Clique aqui', 
    url: 'https://', 
    style: 'primary',
    styleType: 'button',
    width: '100',
    imageUrl: '',
    imagePosition: 'left'
  },
  banner: { imageUrl: '', altText: '', caption: '' },
  carousel: {
    images: [],
    config: {
      slidesPerView: 1,
      showNavigation: true,
      showPagination: true,
      spaceBetween: 30,
      loop: true,
      autoplay: false,
      autoplayDelay: 3000,
      pauseOnHover: true
    }
  },
  social: {
    instagram: '',
    x: '',
    youtube: '',
    tiktok: '',
    spotify: ''
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
  const [pageStyle, setPageStyle] = useState({
    backgroundColor: '#ffffff',
    fontFamily: 'Inter, sans-serif',
    linkColor: '#3b82f6',
    textColor: '#333333'
  });
  const [showColorPicker, setShowColorPicker] = useState(null);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    
    const fetchPageData = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/pages/${pageId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setPage(response.data);
        
        // Converter os componentes para objetos com content parseado
        const parsedComponents = response.data.components.map(comp => ({
          ...comp,
          content: typeof comp.content === 'string' ? JSON.parse(comp.content) : comp.content
        }));
        
        setComponents(parsedComponents);
        
        // Carregar os estilos
        await loadPageStyle();
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
  
  // Função de debounce para o auto-save
  const debouncedSave = useCallback(
    debounce(async (componentId, newContent) => {
      try {
        setSaving(true);
        const token = localStorage.getItem('token');
        
        await axios.put(
          `http://localhost:3001/api/components/${componentId}`,
          { content: newContent },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        setLastSaved(new Date());
      } catch (error) {
        console.error('Erro ao salvar componente:', error);
        setError('Erro ao salvar alterações. Tente novamente.');
      } finally {
        setSaving(false);
      }
    }, 1000), // 1 segundo de delay
    []
  );

  const handleContentChange = (componentId, newContent) => {
    // Atualizar o conteúdo localmente para uma UI responsiva
    setComponents(components.map(c => 
      c.id === componentId ? { ...c, content: newContent } : c
    ));
    
    // Disparar o auto-save
    debouncedSave(componentId, newContent);
  };
  
  // Função para carregar os estilos da página do banco de dados
  const loadPageStyle = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/pages/${pageId}/style`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data && response.data.style) {
        setPageStyle(response.data.style);
      }
    } catch (error) {
      console.error('Erro ao carregar estilo da página:', error);
    }
  }, [pageId]);

  // Função para salvar os estilos
  const savePageStyle = useCallback(debounce(async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_API_URL}/api/pages/${pageId}/style`, {
        style: pageStyle
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setSaving(false);
    } catch (error) {
      console.error('Erro ao salvar estilo da página:', error);
      setSaving(false);
      setError('Erro ao salvar estilo da página');
    }
  }, 1000), [pageId, pageStyle]);

  // Atualizar estilo e salvar quando houver mudanças
  useEffect(() => {
    if (page) {
      savePageStyle();
    }
  }, [pageStyle, savePageStyle, page]);
  
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
                  {saving && (
                    <span className="text-sm text-gray-500 flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Salvando...
                    </span>
                  )}
                  {lastSaved && !saving && (
                    <span className="text-sm text-gray-500">
                      Último salvamento: {lastSaved.toLocaleTimeString()}
                    </span>
                  )}
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
              {/* Configurações de estilo da página */}
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h2 className="text-lg font-medium text-gray-800 mb-4">Estilo da Página</h2>
                
                <div className="space-y-4">
                  {/* Cor de fundo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cor de Fundo
                    </label>
                    <div className="flex items-center">
                      <div 
                        className="w-10 h-10 rounded border cursor-pointer"
                        style={{ backgroundColor: pageStyle.backgroundColor }}
                        onClick={() => setShowColorPicker(showColorPicker === 'background' ? null : 'background')}
                      />
                      <input
                        type="text"
                        value={pageStyle.backgroundColor}
                        onChange={(e) => setPageStyle({...pageStyle, backgroundColor: e.target.value})}
                        className="ml-2 w-28 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    {showColorPicker === 'background' && (
                      <div className="absolute z-10 mt-2">
                        <div className="fixed inset-0" onClick={() => setShowColorPicker(null)} />
                        <SketchPicker
                          color={pageStyle.backgroundColor}
                          onChange={(color) => setPageStyle({...pageStyle, backgroundColor: color.hex})}
                        />
                      </div>
                    )}
                  </div>

                  {/* Fonte principal */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fonte Principal
                    </label>
                    <select
                      value={pageStyle.fontFamily}
                      onChange={(e) => setPageStyle({...pageStyle, fontFamily: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Inter, sans-serif">Inter</option>
                      <option value="'Roboto', sans-serif">Roboto</option>
                      <option value="'Montserrat', sans-serif">Montserrat</option>
                      <option value="'Open Sans', sans-serif">Open Sans</option>
                      <option value="'Lato', sans-serif">Lato</option>
                      <option value="'Poppins', sans-serif">Poppins</option>
                    </select>
                  </div>

                  {/* Cor dos links */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cor dos Links
                    </label>
                    <div className="flex items-center">
                      <div 
                        className="w-10 h-10 rounded border cursor-pointer"
                        style={{ backgroundColor: pageStyle.linkColor }}
                        onClick={() => setShowColorPicker(showColorPicker === 'link' ? null : 'link')}
                      />
                      <input
                        type="text"
                        value={pageStyle.linkColor}
                        onChange={(e) => setPageStyle({...pageStyle, linkColor: e.target.value})}
                        className="ml-2 w-28 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    {showColorPicker === 'link' && (
                      <div className="absolute z-10 mt-2">
                        <div className="fixed inset-0" onClick={() => setShowColorPicker(null)} />
                        <SketchPicker
                          color={pageStyle.linkColor}
                          onChange={(color) => setPageStyle({...pageStyle, linkColor: color.hex})}
                        />
                      </div>
                    )}
                  </div>

                  {/* Cor do Texto */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cor do Texto
                    </label>
                    <div className="flex items-center">
                      <div 
                        className="w-10 h-10 rounded border cursor-pointer"
                        style={{ backgroundColor: pageStyle.textColor }}
                        onClick={() => setShowColorPicker(showColorPicker === 'text' ? null : 'text')}
                      />
                      <input
                        type="text"
                        value={pageStyle.textColor}
                        onChange={(e) => setPageStyle({...pageStyle, textColor: e.target.value})}
                        className="ml-2 w-28 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    {showColorPicker === 'text' && (
                      <div className="absolute z-10 mt-2">
                        <div className="fixed inset-0" onClick={() => setShowColorPicker(null)} />
                        <SketchPicker
                          color={pageStyle.textColor}
                          onChange={(color) => setPageStyle({...pageStyle, textColor: color.hex})}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-md">
                <h2 className="text-lg font-medium text-gray-800 mb-4">Componentes Disponíveis</h2>
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
                            {component.type}
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
                            onChange: (newContent) => handleContentChange(component.id, newContent)
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
                  className="bg-gray-50 border-[15px] border-black rounded-[60px] p-4 min-h-[400px]"
                  style={{ 
                    backgroundColor: pageStyle.backgroundColor,
                    fontFamily: pageStyle.fontFamily,
                    "--link-color": pageStyle.linkColor,
                    "--text-color": pageStyle.textColor,
                    color: pageStyle.textColor
                  }}
                >
                  {components.length > 0 ? (
                    <div>                      
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

export default PageEditor; 