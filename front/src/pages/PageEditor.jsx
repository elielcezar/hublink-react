import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

// Componentes para renderização na prévia
const componentRenderers = {
  text: ({ content }) => (
    <div className="prose max-w-none mb-4" dangerouslySetInnerHTML={{ __html: content.text }} />
  ),
  
  link: ({ content }) => (
    <div className="mb-4">
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
    <div className="mb-6 relative overflow-hidden rounded-lg">
      {/* Na versão real, seria implementado um carrossel interativo */}
      <div className="flex overflow-x-auto pb-4 space-x-4">
        {content.images.map((image, index) => (
          <div key={index} className="flex-shrink-0 w-64">
            <img 
              src={image.url} 
              alt={image.altText || ''} 
              className="w-full h-40 object-cover rounded-lg shadow-sm"
            />
            {image.caption && (
              <p className="mt-1 text-sm text-gray-600">{image.caption}</p>
            )}
          </div>
        ))}
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
          Estilo
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
    </>
  ),
  
  banner: ({ content, onChange }) => (
    <>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          URL da Imagem
        </label>
        <input
          type="url"
          value={content.imageUrl}
          onChange={(e) => onChange({ ...content, imageUrl: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="https://exemplo.com/imagem.jpg"
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
    const addImage = () => {
      const newImages = [...content.images, { url: '', altText: '', caption: '' }];
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
      <>
        <div className="mb-4">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-gray-700">
              Imagens
            </label>
            <button
              type="button"
              onClick={addImage}
              className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Adicionar Imagem
            </button>
          </div>
          
          {content.images.map((image, index) => (
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
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-700 mb-1">
                    URL da Imagem
                  </label>
                  <input
                    type="url"
                    value={image.url}
                    onChange={(e) => updateImage(index, 'url', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-gray-700 mb-1">
                    Texto Alternativo
                  </label>
                  <input
                    type="text"
                    value={image.altText || ''}
                    onChange={(e) => updateImage(index, 'altText', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Descrição da imagem"
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-gray-700 mb-1">
                    Legenda
                  </label>
                  <input
                    type="text"
                    value={image.caption || ''}
                    onChange={(e) => updateImage(index, 'caption', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Legenda opcional"
                  />
                </div>
              </div>
            </div>
          ))}
          
          {content.images.length === 0 && (
            <p className="mt-2 text-sm text-gray-500">
              Nenhuma imagem adicionada. Clique em "Adicionar Imagem" para começar.
            </p>
          )}
        </div>
      </>
    );
  }
};

// Valores padrão para novos componentes
const defaultComponentValues = {
  text: { text: '<p>Digite seu texto aqui</p>' },
  link: { text: 'Clique aqui', url: 'https://', style: 'primary' },
  banner: { imageUrl: '', altText: '', caption: '' },
  carousel: { images: [] }
};

const PageEditor = () => {
  const { pageId } = useParams();
  const navigate = useNavigate();
  
  const [page, setPage] = useState(null);
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
  
  const updateComponent = async (componentId, updatedContent) => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.put(
        `http://localhost:3001/api/components/${componentId}`,
        { content: updatedContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Atualizar o componente na lista
      setComponents(components.map(c => 
        c.id === componentId ? { ...response.data } : c
      ));
    } catch (error) {
      console.error('Erro ao atualizar componente:', error);
      setError('Erro ao salvar alterações. Tente novamente.');
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
  
  const handleContentChange = (componentId, newContent) => {
    // Atualizar o conteúdo localmente para uma UI responsiva
    setComponents(components.map(c => 
      c.id === componentId ? { ...c, content: newContent } : c
    ));
  };
  
  const saveChanges = async (componentId) => {
    const component = components.find(c => c.id === componentId);
    if (!component) return;
    
    await updateComponent(componentId, component.content);
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
                        
                        <div className="mt-4 flex justify-end">
                          <button
                            type="button"
                            onClick={() => saveChanges(component.id)}
                            disabled={saving}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                          >
                            {saving ? 'Salvando...' : 'Salvar Alterações'}
                          </button>
                        </div>
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
                    {components.map((component) => {
                      const ComponentRenderer = componentRenderers[component.type];
                      return ComponentRenderer ? (
                        <div key={component.id}>
                          <ComponentRenderer content={component.content} />
                        </div>
                      ) : null;
                    })}
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

export default PageEditor; 