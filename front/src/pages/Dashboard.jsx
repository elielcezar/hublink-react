import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import MenuDashboard from '../components/MenuDashboard';
import AppHeader from '../components/AppHeader';
import api from '../config/apiConfig';
import { SketchPicker } from 'react-color';
import ImageUploader from '../components/editor/forms/ImageUploader';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [setShowNewPageForm] = useState(false);
  const [newPage, setNewPage] = useState({ title: '', slug: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  // Estados para o acordeão e edição de URL
  const [expandedPageId, setExpandedPageId] = useState(null);
  const [editingSlug, setEditingSlug] = useState(null);
  const [slugValue, setSlugValue] = useState('');
  const [slugError, setSlugError] = useState('');
  
  // Novos estados para estilo da página
  const [pageStyles, setPageStyles] = useState({}); // Armazena estilos por ID da página
  const [showColorPicker, setShowColorPicker] = useState(null);
  
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

  // Adicione este estado para controlar a página selecionada
  const [activePageId, setActivePageId] = useState(null);

  // Adicione esta propriedade a todos os objetos de estilo padrão
  // Modifique o estilo padrão em vários lugares no código
  const defaultStyle = {
    backgroundColor: '#ffffff',
    fontFamily: 'Inter, sans-serif',
    linkColor: '#3b82f6',
    textColor: '#333333',
    backgroundImage: null,
    logo: null,
    backgroundType: 'color' // Novo campo: 'color' ou 'image'
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
        console.log('Buscando dados do usuário...');
        const userResponse = await api.get('/api/me');
        console.log('Dados do usuário recebidos com sucesso');
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
              
              if (styleResponse.data && styleResponse.data.style) {
                stylesObj[page.id] = {
                  ...styleResponse.data.style,
                  backgroundType: styleResponse.data.style.backgroundType || 'color'
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
      await api.put(
        `/api/pages/${pageId}/style`,
        { style: pageStyles[pageId] }
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

        <div className="min-h-screen bg-gray-100 w-full max-w-[calc(100%-100px)]">
          <AppHeader 
            user={user}
            pages={pages}
            unsavedChanges={unsavedChanges}
            savePageStyle={savePageStyle}            
          />

          <main className="py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-8 justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">                
                  Personalize sua Página
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
                    <div key={page.id} className="bg-white rounded-lg shadow overflow-hidden">
                      <div className="px-4 py-5 sm:p-6 space-y-6">                       
                        <div id={`style-section-${page.id}`}>    
                          {/* Seção de Logo */}
                          <div className="mb-6">
                            <h4 className="font-medium text-gray-700 mb-2">Sua Marca</h4>
                            <ImageUploader 
                              onImageUpload={(imageUrl) => handleLogoUpload(page.id, imageUrl)}
                              currentImage={pageStyles[page.id]?.logo || ''}
                            />
                          </div>  

                          {/* Seção de edição de URL/Slug */}
                          <div className="mb-6">
                            <h4 className="font-medium text-gray-700 mb-2">Endereço da Página</h4>
                            {editingSlug === page.id ? (
                              <div>
                                <div className="flex items-center">
                                  <span className="text-gray-500 mr-2">hublink.app/</span>
                                  <input
                                    type="text"
                                    value={slugValue}
                                    onChange={(e) => setSlugValue(e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="minha-pagina"
                                  />
                                </div>
                                {slugError && (
                                  <p className="mt-1 text-sm text-red-600">{slugError}</p>
                                )}
                                <div className="mt-2 flex space-x-2">
                                  <button
                                    onClick={() => saveSlug(page.id)}
                                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                                  >
                                    Salvar
                                  </button>
                                  <button
                                    onClick={() => setEditingSlug(null)}
                                    className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <h2 className="text-lg font-medium text-gray-800">
                                  hublink.app/{page.slug}
                                </h2>
                                <button
                                  onClick={() => startEditingSlug(page)}
                                  className="ml-2 text-blue-600 hover:text-blue-800 text-sm"
                                >
                                  Alterar endereço
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Seção de Fundo de Tela */}
                          <div className="mb-6">
                            <h4 className="font-medium text-gray-700 mb-2">Fundo de Tela</h4>
                            <select
                              value={pageStyles[page.id]?.backgroundType || 'color'}
                              onChange={(e) => updatePageStyle(page.id, 'backgroundType', e.target.value)}
                              className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded mb-4"
                            >
                              <option value="color">Cor de Fundo</option>
                              <option value="image">Imagem de Fundo</option>
                            </select>
                            
                            {/* Exibir o componente apropriado com base na seleção */}
                            {(pageStyles[page.id]?.backgroundType === 'image' || !pageStyles[page.id]?.backgroundType) && (
                              <div className="mb-6">
                                <h4 className="font-medium text-gray-700 mb-2">Imagem de Fundo</h4>
                                <ImageUploader 
                                  onImageUpload={(imageUrl) => handleBackgroundImageUpload(page.id, imageUrl)}
                                  currentImage={pageStyles[page.id]?.backgroundImage || ''}
                                />
                              </div>
                            )}
                            
                            {(pageStyles[page.id]?.backgroundType === 'color' || !pageStyles[page.id]?.backgroundType) && (
                              <div className="mb-6">
                                <h4 className="font-medium text-gray-700 mb-2">Cor de Fundo</h4>
                                <div className="flex items-center gap-3">
                                  <div 
                                    className="h-10 w-10 rounded border cursor-pointer"
                                    style={{ backgroundColor: pageStyles[page.id]?.backgroundColor || '#ffffff' }}
                                    onClick={() => setShowColorPicker(page.id)}
                                  ></div>
                                  <input
                                    type="text"
                                    value={pageStyles[page.id]?.backgroundColor || '#ffffff'}
                                    onChange={(e) => updatePageStyle(page.id, 'backgroundColor', e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded text-sm w-32"
                                  />
                                </div>
                                
                                {showColorPicker === page.id && (
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
                                      onChangeComplete={(color) => {
                                        updatePageStyle(page.id, 'backgroundColor', color.hex);
                                        // Não salvar automaticamente
                                      }}
                                    />
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          
                          {/* Seção de Fonte */}
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
                        </div>                      
                      </div>
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