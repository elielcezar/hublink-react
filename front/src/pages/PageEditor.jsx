import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import React from 'react';
import axios from 'axios';
import ImageUploader from '../components/ImageUploader';
import CarouselComponent from '../components/CarouselComponent';
import { FaInstagram, FaTwitter, FaYoutube, FaTiktok, FaSpotify } from 'react-icons/fa';

// Componentes para renderização na prévia
const componentRenderers = {
  text: ({ content }) => (
    <div className="prose max-w-none mb-4" dangerouslySetInnerHTML={{ __html: content.text }} />
  ),
  
  link: ({ content }) => {
    // Configuração de largura comum para ambos os estilos
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
    
    // Verificar se é um ícone ou botão
    if (content.styleType === 'icon') {
      // Estilo de ícone com imagem de fundo
      return (
        <div className={`${widthClass} px-2 mb-4`}>
          <a 
            href={content.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block overflow-hidden relative w-full h-32 rounded-lg shadow-md transition-transform hover:scale-105"
            style={{
              background: content.imageUrl ? `url(${content.imageUrl}) center/cover no-repeat` : 'linear-gradient(to right, #4f46e5, #6366f1)'
            }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <span className="text-white text-lg font-medium px-6 py-2 text-center">
                {content.text}
              </span>
            </div>
          </a>
        </div>
      );
    }
    
    // Estilo de botão (original)
    
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
    <>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Estilo
        </label>
        <select
          value={content.styleType || 'button'}
          onChange={(e) => onChange({ ...content, styleType: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="button">Botão</option>
          <option value="icon">Ícone</option>
        </select>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Texto do Link
        </label>
        <input
          type="text"
          value={content.text}
          onChange={(e) => onChange({ ...content, text: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Clique aqui"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          URL
        </label>
        <input
          type="url"
          value={content.url}
          onChange={(e) => onChange({ ...content, url: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="https://exemplo.com"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Largura
        </label>
        <select
          value={content.width || '100'}
          onChange={(e) => onChange({ ...content, width: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="100">100% (Ocupar linha inteira)</option>
          <option value="50">50% (Metade da linha)</option>
          <option value="33">33% (Um terço da linha)</option>
        </select>
      </div>
      
      {content.styleType !== 'icon' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cor do Botão
          </label>
          <select
            value={content.style}
            onChange={(e) => onChange({ ...content, style: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="primary">Primário</option>
            <option value="secondary">Secundário</option>
          </select>
        </div>
      )}
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Imagem
        </label>
        <ImageUploader 
          currentImage={content.imageUrl} 
          onImageUpload={(imageUrl) => onChange({ ...content, imageUrl })}
        />
        {content.styleType === 'icon' && content.imageUrl && (
          <p className="mt-1 text-xs text-gray-500">
            Esta imagem será usada como fundo do ícone.
          </p>
        )}
      </div>
      
      {content.imageUrl && content.styleType !== 'icon' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Posição da Imagem
          </label>
          <select
            value={content.imagePosition || 'left'}
            onChange={(e) => onChange({ ...content, imagePosition: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="left">Esquerda</option>
            <option value="right">Direita</option>
            <option value="top">Topo</option>
          </select>
        </div>
      )}
    </>
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
  
  const [page, setPage] = useState(null);
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [error, setError] = useState('');
  const [expandedComponent, setExpandedComponent] = useState(null);
  
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
  
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                Hub<span className="text-blue-600">Link</span>
              </h1>
              <span className="ml-4 text-gray-600 truncate max-w-xs">
                {page?.title}
              </span>
            </div>
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
              
              {page?.published && (
                <a
                  href={`/p/${page.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 text-sm text-blue-600 border border-blue-300 rounded hover:bg-blue-50"
                >
                  Visualizar
                </a>
              )}
              
              <Link
                to="/dashboard"
                className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
              >
                Voltar
              </Link>
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
        <div className="flex flex-col md:flex-row gap-6">
          {/* Coluna de edição - Esquerda */}
          <div className="md:w-1/2 space-y-4">
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
          <div className="md:w-1/2">
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-medium text-gray-800 mb-2">Prévia</h2>
              <p className="text-sm text-gray-500 mb-4">
                Veja como sua landing page ficará para os visitantes.
              </p>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 min-h-[400px]">
                {components.length > 0 ? (
                  <div>
                    <h1 className="text-2xl font-bold text-center mb-6">{page?.title}</h1>
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