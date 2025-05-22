import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import MenuDashboard from '../components/MenuDashboard';
import AppHeader from '../components/AppHeader';
import api from '../config/apiConfig';
import { SketchPicker } from 'react-color';
import ImageUploader from '../components/editor/forms/ImageUploader';
import Card from '../components/Card';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingSlug, setEditingSlug] = useState(null);
  const [slugValue, setSlugValue] = useState('');
  const [slugError, setSlugError] = useState('');
  const navigate = useNavigate();
  
  // Novos estados para estilo da página
  const [pageStyles, setPageStyles] = useState({}); // Armazena estilos por ID da página
  const [showColorPicker, setShowColorPicker] = useState(null);
  
  // Re-add activePageId state
  const [activePageId, setActivePageId] = useState(null);
  
  // Lista de fontes disponíveis
  const availableFonts = [
    { name: 'Inter', value: 'Inter, sans-serif' },
    { name: 'Montserrat', value: 'Montserrat, sans-serif' },
    { name: 'Comic Neue', value: '"Comic Neue", cursive' },
    { name: 'PT Sans', value: '"PT Sans", sans-serif' },
    { name: 'Poppins', value: 'Poppins, sans-serif' },
    { name: 'Roboto Mono', value: '"Roboto Mono", monospace' },
    { name: 'Pacifico', value: 'Pacifico, cursive' },
    { name: 'Crimson Pro', value: '"Crimson Pro", serif' },
    { name: 'Playfair Display', value: '"Playfair Display", serif' },
    { name: 'Old Standard TT', value: '"Old Standard TT", serif' }
  ];

  // Adicione um novo estado para rastrear páginas com alterações não salvas
  const [unsavedChanges, setUnsavedChanges] = useState({});

  // Adicione esta propriedade a todos os objetos de estilo padrão
  // Modifique o estilo padrão em vários lugares no código
  const defaultStyle = {
    backgroundColor: '#ffffff',
    fontFamily: 'Inter, sans-serif',
    linkColor: '#3b82f6',
    textColor: '#333333',
    backgroundImage: null,
    logo: null,
    backgroundType: 'color', // 'color', 'image' ou 'gradient'
    gradientStartColor: '#4f46e5',
    gradientEndColor: '#818cf8',
    gradientDirection: 'to right' // direção padrão do gradiente
  };

  useEffect(() => {
    // Carregar fontes do Google
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Montserrat:wght@400;500;600&family=Comic+Neue:wght@400;700&family=PT+Sans:wght@400;700&family=Poppins:wght@400;500;600&family=Roboto+Mono:wght@400;500&family=Pacifico&family=Crimson+Pro:wght@400;600&family=Playfair+Display:wght@400;600&family=Old+Standard+TT:wght@400;700&display=swap';
    document.head.appendChild(link);
    
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    console.log('Dashboard: Iniciando carregamento de dados');
    console.log('Token presente:', token ? 'Sim' : 'Não');
    
    const fetchData = async () => {
      try {                
        const userResponse = await api.get('/api/me');        
        setUser(userResponse.data);        
        
        console.log('Buscando páginas do usuário...');
        const pagesResponse = await api.get('/api/pages');
        console.log(`${pagesResponse.data.length} páginas encontradas`);
        setPages(pagesResponse.data);
        
        // Definir a primeira página como ativa, se houver páginas
        if (pagesResponse.data.length > 0) {
          setActivePageId(pagesResponse.data[0].id);
        }
        
        // Carregar estilos para cada página
        if (pagesResponse.data.length > 0) {
          const stylesObj = {};
          for (const page of pagesResponse.data) {
            try {
              const styleResponse = await api.get(`/api/pages/${page.id}/style`);
              console.log('Estilo carregado para página', page.id, ':', styleResponse.data);
              
              if (styleResponse.data && styleResponse.data.style) {
                // Garantir que todas as propriedades necessárias estejam presentes
                stylesObj[page.id] = {
                  ...defaultStyle,
                  ...styleResponse.data.style
                };
              } else {
                // Estilo padrão
                stylesObj[page.id] = defaultStyle;
              }
            } catch (styleError) {
              console.error(`Erro ao carregar estilo da página ${page.id}:`, styleError);
              // Estilo padrão em caso de erro
              stylesObj[page.id] = defaultStyle;
            }
          }
          setPageStyles(stylesObj);
        }
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Função para iniciar a edição do slug
  const startEditingSlug = (page) => {
    setEditingSlug(page.id);
    setSlugValue(page.slug);
    setSlugError('');
  };

  // Função para salvar o novo slug
  const saveSlug = async (pageId) => {
    if (!slugValue.trim()) {
      setSlugError('A URL não pode estar vazia');
      return;
    }
    
    if (!/^[a-z0-9-]+$/.test(slugValue)) {
      setSlugError('A URL só pode conter letras minúsculas, números e hífens');
      return;
    }
    
    try {
      await api.put(`/api/pages/${pageId}`, { slug: slugValue });
      
      // Atualizar a página na lista
      setPages(pages.map(page => 
        page.id === pageId ? { ...page, slug: slugValue } : page
      ));
      
      // Sair do modo de edição
      setEditingSlug(null);
    } catch (error) {
      console.error('Erro ao atualizar URL:', error);
      if (error.response?.data?.message) {
        setSlugError(error.response.data.message);
      } else {
        setSlugError('Erro ao atualizar a URL');
      }
    }
  };

  // Função para salvar o estilo de uma página
  const savePageStyle = async (pageId) => {
    try {
      // Garantir que todas as propriedades necessárias estejam presentes
      const styleToSave = {
        ...defaultStyle,
        ...pageStyles[pageId]
      };
      
      console.log('Salvando estilo:', styleToSave);
      console.log('Estilo de fundo gerado:', getBackgroundStyle(pageId));
      
      await api.put(
        `/api/pages/${pageId}/style`,
        { style: styleToSave }
      );
      
      // Feedback visual
      const styleSection = document.getElementById(`style-section-${pageId}`);
      if (styleSection) {
        styleSection.classList.add('bg-green-50');
        setTimeout(() => {
          styleSection.classList.remove('bg-green-50');
        }, 1000);
      }
      
      // Limpar status de alterações não salvas para esta página
      const newUnsavedChanges = { ...unsavedChanges };
      delete newUnsavedChanges[pageId];
      setUnsavedChanges(newUnsavedChanges);
      
      // Feedback ao usuário
      alert('Alterações salvas com sucesso!');
      
    } catch (error) {
      console.error('Erro ao salvar estilo:', error);
      alert('Erro ao salvar estilo da página');
    }
  };
  
  // Função para lidar com a imagem de fundo enviada pelo ImageUploader
  const handleBackgroundImageUpload = async (pageId, imageUrl) => {
    try {
      // Atualizar o estilo com a nova imagem de fundo
      setPageStyles({
        ...pageStyles,
        [pageId]: {
          ...pageStyles[pageId],
          backgroundImage: imageUrl
        }
      });
      
      // Marcar esta página como tendo alterações não salvas
      setUnsavedChanges({
        ...unsavedChanges,
        [pageId]: true
      });
      
    } catch (error) {
      console.error('Erro ao atualizar imagem de fundo:', error);
      alert('Erro ao atualizar imagem de fundo');
    }
  };
  
  // Função para lidar com a logo enviada pelo ImageUploader
  const handleLogoUpload = async (pageId, imageUrl) => {
    try {
      // Atualizar o estilo com a nova logo
      setPageStyles({
        ...pageStyles,
        [pageId]: {
          ...pageStyles[pageId],
          logo: imageUrl
        }
      });
      
      // Marcar esta página como tendo alterações não salvas
      setUnsavedChanges({
        ...unsavedChanges,
        [pageId]: true
      });
      
    } catch (error) {
      console.error('Erro ao atualizar logo:', error);
      alert('Erro ao atualizar logo');
    }
  };
  
  // Função para atualizar um valor específico do estilo
  const updatePageStyle = (pageId, property, value) => {
    setPageStyles({
      ...pageStyles,
      [pageId]: {
        ...pageStyles[pageId],
        [property]: value
      }
    });
    
    // Marcar esta página como tendo alterações não salvas
    setUnsavedChanges({
      ...unsavedChanges,
      [pageId]: true
    });
  };

  // Função auxiliar para gerar o estilo de fundo com base no tipo
  const getBackgroundStyle = (pageId) => {
    const style = pageStyles[pageId] || defaultStyle;
    
    switch (style.backgroundType) {
      case 'gradient':
        return {
          background: `linear-gradient(${style.gradientDirection || 'to right'}, ${style.gradientStartColor || '#4f46e5'}, ${style.gradientEndColor || '#818cf8'})`
        };
      case 'image':
        return {
          backgroundImage: style.backgroundImage ? `url(${style.backgroundImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        };
      case 'color':
      default:
        return {
          backgroundColor: style.backgroundColor || '#ffffff'
        };
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-700">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-row min-h-screen">
      
        <MenuDashboard />

        <div className="min-h-screen bg-gray-50 bg-white w-full pl-[100px]">

          <AppHeader 
            user={user}
            pages={pages}
            unsavedChanges={unsavedChanges}
            savePageStyle={savePageStyle}            
          />

          <main className="py-10">
            <div className="mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-8 justify-between items-center">
                <h1 className="text-3xl font-bold text-violet-700">                
                  Personalize seu Perfil
                </h1>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                  {error}
                </div>
              )}
              
              {pages.length > 0 ? (
                <div className="space-y-4">
                  {pages.map((page) => (
                    <div key={page.id}>                      
                      
                      <Card title="Sua Marca" noPadding noShadow>                         
                        <ImageUploader 
                          onImageUpload={(imageUrl) => handleLogoUpload(page.id, imageUrl)}
                          currentImage={pageStyles[page.id]?.logo || ''}
                        />                        
                      </Card>                    

                      <Card title="Endereço da Página" noPadding noShadow>
                        
                        {editingSlug === page.id ? (
                          <>
                            <div className="flex items-center mt-4">
                              <span className="text-xl font-medium text-gray-500 mr-2">hublink.app/</span>
                              <input
                                type="text"
                                value={slugValue}
                                onChange={(e) => setSlugValue(e.target.value)}
                                className="max-w-xs flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="minha-pagina"
                              />
                            </div>
                            {slugError && (
                              <p className="mt-1 text-sm text-red-600">{slugError}</p>
                            )}
                            <div className="mt-2 flex space-x-2 mt-4">
                              <button
                                onClick={() => saveSlug(page.id)}
                                className="ml-2 text-violet-900 px-4 py-2 border-2 border-violet-900 rounded-md hover:text-blue-800 text-sm hover:bg-violet-900 hover:text-white"
                              >
                                Salvar
                              </button>
                              <button
                                onClick={() => setEditingSlug(null)}
                                className="px-3 py-1 bg-gray-200 px-4 py-2 text-gray-700 text-sm rounded hover:bg-gray-300"
                              >
                                Cancelar
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="flex items-center mt-4">
                            <h2 className="text-xl font-medium text-gray-500">
                              hublink.app/{page.slug}
                            </h2>
                            <button
                              onClick={() => startEditingSlug(page)}
                              className="ml-2 text-violet-900 px-4 py-2 border-2 border-violet-900 rounded-md hover:text-blue-800 text-sm hover:bg-violet-900 hover:text-white"
                            >
                              Alterar endereço
                            </button>
                          </div>
                        )}
                        
                      </Card>
                     
                      <Card title="Estilo de Fundo" noPadding noShadow>                        
                        <div className="flex space-x-2 mb-4">
                          <button
                            className={`px-4 py-2 rounded-md ${
                              (pageStyles[page.id]?.backgroundType === 'color' || !pageStyles[page.id]?.backgroundType) 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-200 text-gray-700'
                            }`}
                            onClick={() => updatePageStyle(page.id, 'backgroundType', 'color')}
                          >
                            Cor Sólida
                          </button>
                          <button
                            className={`px-4 py-2 rounded-md ${
                              pageStyles[page.id]?.backgroundType === 'gradient' 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-200 text-gray-700'
                            }`}
                            onClick={() => updatePageStyle(page.id, 'backgroundType', 'gradient')}
                          >
                            Degradê
                          </button>
                          <button
                            className={`px-4 py-2 rounded-md ${
                              pageStyles[page.id]?.backgroundType === 'image' 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-200 text-gray-700'
                            }`}
                            onClick={() => updatePageStyle(page.id, 'backgroundType', 'image')}
                          >
                            Imagem
                          </button>
                        </div>
                        
                        {/* Exibir o componente apropriado com base na seleção */}
                        {pageStyles[page.id]?.backgroundType === 'image' && (
                          <div className="mb-6">
                            <h4 className="font-medium text-gray-700 mb-2">Imagem de Fundo</h4>
                            <ImageUploader 
                              onImageUpload={(imageUrl) => handleBackgroundImageUpload(page.id, imageUrl)}
                              currentImage={pageStyles[page.id]?.backgroundImage || ''}
                            />
                          </div>
                        )}
                        
                        {pageStyles[page.id]?.backgroundType === 'gradient' && (
                          <div className="mb-6">
                            <h4 className="font-medium text-gray-700 mb-2">Degradê</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Cor Inicial
                                </label>
                                <div className="flex items-center gap-3">
                                  <div 
                                    className="h-10 w-10 rounded border cursor-pointer"
                                    style={{ backgroundColor: pageStyles[page.id]?.gradientStartColor || '#4f46e5' }}
                                    onClick={() => setShowColorPicker('gradientStart-' + page.id)}
                                  ></div>
                                  <input
                                    type="text"
                                    value={pageStyles[page.id]?.gradientStartColor || '#4f46e5'}
                                    onChange={(e) => updatePageStyle(page.id, 'gradientStartColor', e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded text-sm w-32"
                                  />
                                </div>
                                
                                {showColorPicker === 'gradientStart-' + page.id && (
                                  <div className="absolute z-10 mt-2">
                                    <div 
                                      className="fixed inset-0" 
                                      onClick={() => setShowColorPicker(null)}
                                    ></div>
                                    <SketchPicker 
                                      color={pageStyles[page.id]?.gradientStartColor || '#4f46e5'}
                                      onChange={(color) => {
                                        updatePageStyle(page.id, 'gradientStartColor', color.hex);
                                      }}
                                    />
                                  </div>
                                )}
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Cor Final
                                </label>
                                <div className="flex items-center gap-3">
                                  <div 
                                    className="h-10 w-10 rounded border cursor-pointer"
                                    style={{ backgroundColor: pageStyles[page.id]?.gradientEndColor || '#818cf8' }}
                                    onClick={() => setShowColorPicker('gradientEnd-' + page.id)}
                                  ></div>
                                  <input
                                    type="text"
                                    value={pageStyles[page.id]?.gradientEndColor || '#818cf8'}
                                    onChange={(e) => updatePageStyle(page.id, 'gradientEndColor', e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded text-sm w-32"
                                  />
                                </div>
                                
                                {showColorPicker === 'gradientEnd-' + page.id && (
                                  <div className="absolute z-10 mt-2">
                                    <div 
                                      className="fixed inset-0" 
                                      onClick={() => setShowColorPicker(null)}
                                    ></div>
                                    <SketchPicker 
                                      color={pageStyles[page.id]?.gradientEndColor || '#818cf8'}
                                      onChange={(color) => {
                                        updatePageStyle(page.id, 'gradientEndColor', color.hex);
                                      }}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="mt-4">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Direção do Degradê
                              </label>
                              <select
                                value={pageStyles[page.id]?.gradientDirection || 'to right'}
                                onChange={(e) => updatePageStyle(page.id, 'gradientDirection', e.target.value)}
                                className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded"
                              >
                                <option value="to right">Horizontal (Esquerda para Direita)</option>
                                <option value="to left">Horizontal (Direita para Esquerda)</option>
                                <option value="to bottom">Vertical (Cima para Baixo)</option>
                                <option value="to top">Vertical (Baixo para Cima)</option>
                                <option value="to bottom right">Diagonal (Canto Superior Esquerdo)</option>
                                <option value="to bottom left">Diagonal (Canto Superior Direito)</option>
                                <option value="to top right">Diagonal (Canto Inferior Esquerdo)</option>
                                <option value="to top left">Diagonal (Canto Inferior Direito)</option>
                              </select>
                            </div>
                            
                            <div 
                              className="mt-4 p-4 rounded border"
                              style={{ 
                                background: `linear-gradient(${pageStyles[page.id]?.gradientDirection || 'to right'}, ${pageStyles[page.id]?.gradientStartColor || '#4f46e5'}, ${pageStyles[page.id]?.gradientEndColor || '#818cf8'})`,
                                height: '80px'
                              }}
                            >
                            </div>
                          </div>
                        )}
                        
                        {(pageStyles[page.id]?.backgroundType === 'color' || !pageStyles[page.id]?.backgroundType) && (
                          <div className="mb-6">
                            <h4 className="font-medium text-gray-700 mb-2">Cor de Fundo</h4>
                            <div className="flex items-center gap-3">
                              <div 
                                className="h-10 w-10 rounded border cursor-pointer"
                                style={{ backgroundColor: pageStyles[page.id]?.backgroundColor || '#ffffff' }}
                                onClick={() => setShowColorPicker('color-' + page.id)}
                              ></div>
                              <input
                                type="text"
                                value={pageStyles[page.id]?.backgroundColor || '#ffffff'}
                                onChange={(e) => updatePageStyle(page.id, 'backgroundColor', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded text-sm w-32"
                              />
                            </div>
                            
                            {showColorPicker === 'color-' + page.id && (
                              <div className="absolute z-10 mt-2">
                                <div 
                                  className="fixed inset-0" 
                                  onClick={() => setShowColorPicker(null)}
                                ></div>
                                <SketchPicker 
                                  color={pageStyles[page.id]?.backgroundColor || '#ffffff'}
                                  onChange={(color) => {
                                    updatePageStyle(page.id, 'backgroundColor', color.hex);
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </Card>

                      {/* Card de Tipografia */}
                      <Card title="Tipografia" noPadding noShadow>
                        <div className="mb-6">
                          <h4 className="font-medium text-gray-700 mb-2">Fonte Principal</h4>
                          <div className="flex items-center gap-3">
                            <select
                              value={pageStyles[page.id]?.fontFamily || 'Inter, sans-serif'}
                              onChange={(e) => updatePageStyle(page.id, 'fontFamily', e.target.value)}
                              className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded"
                            >
                              {availableFonts.map(font => (
                                <option 
                                  key={font.value} 
                                  value={font.value}
                                  style={{ fontFamily: font.value }}
                                >
                                  {font.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          {/* Visualização da fonte */}
                          <div 
                            className="mt-3 p-3 border rounded"
                            style={{ fontFamily: pageStyles[page.id]?.fontFamily || 'Inter, sans-serif' }}
                          >
                            <p className="text-lg font-bold">Exemplo de título</p>
                            <p>Este é um exemplo de como seu texto vai aparecer.</p>
                          </div>
                        </div>
                      </Card>

                      {/* Card de Ações */}
                      <Card noPadding noShadow>
                        <div className="flex space-x-3">
                          <button
                            onClick={() => savePageStyle(page.id)}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            disabled={!unsavedChanges[page.id]}
                          >
                            Salvar Alterações
                          </button>                         
                        </div>
                      </Card>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white p-8 text-center rounded-lg shadow">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  </svg>
                  <p className="mt-2 text-gray-600">
                    Você ainda não criou nenhuma página.
                  </p>
                  <p className="mt-1 text-gray-600">
                    Clique no botão "Criar Nova Página" para começar.
                  </p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default Dashboard; 