import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MenuDashboard from '../components/MenuDashboard';
import AppHeader from '../components/AppHeader';
import api from '../config/apiConfig';
import { SketchPicker } from 'react-color';
import ImageUploader from '../components/editor/forms/ImageUploader';
import Card from '../components/Card';
import PagePreview from '../components/PagePreview';
import { IoIosColorFilter } from "react-icons/io";
import { FaRegImage } from "react-icons/fa";
import { IoColorFillOutline } from "react-icons/io5";
import { FaRegSave } from "react-icons/fa";

// Mova o defaultStyle para fora do componente (pode ficar no escopo do módulo)
const defaultStyle = {
  backgroundColor: '#ffffff',
  fontFamily: 'Inter, sans-serif',
  linkColor: '#3b82f6',
  linkBackgroundColor: '#3b82f6',
  linkTextColor: '#ffffff',
  linkShadowColor: '#000000',
  linkShadowIntensity: 4,
  linkShadowBlur: 4,
  linkShadowOpacity: 20,
  linkBorderRadius: 8,
  textColor: '#333333',
  backgroundImage: null,
  logo: null,
  backgroundType: 'color',
  gradientStartColor: '#4f46e5',
  gradientEndColor: '#818cf8',
  gradientDirection: 'to right'
}; 

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingSlug, setEditingSlug] = useState(null);
  const [slugValue, setSlugValue] = useState('');
  const [slugError, setSlugError] = useState('');
  const [pageStyle, setPageStyle] = useState(defaultStyle);
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

  const [components, setComponents] = useState([]);

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

  useEffect(() => {
    if (!activePageId) {
      setComponents([]);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    const fetchPageData = async () => {
      try {
        const userResponse = await api.get('/api/me');
        setUser(userResponse.data);

        const response = await api.get(`/api/pages/${activePageId}`);

        // Carregar o estilo da página
        const styleResponse = await api.get(`/api/pages/${activePageId}/style`);
        const loadedPageStyle = styleResponse.data?.style || defaultStyle;
        
        // Garantir que todas as propriedades necessárias estejam presentes
        const completeStyle = {
          ...defaultStyle,
          ...loadedPageStyle
        };
        
        setPageStyle(completeStyle);
        setComponents(response.data.components.map(comp => ({
          ...comp,
          content: typeof comp.content === 'string' ? JSON.parse(comp.content) : comp.content
        })));
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
  }, [activePageId, navigate]);

  // Sincronizar pageStyle com pageStyles[activePageId] para atualizar o preview em tempo real
  useEffect(() => {
    if (activePageId && pageStyles[activePageId]) {
      const completeStyle = {
        ...defaultStyle,
        ...pageStyles[activePageId]
      };
      setPageStyle(completeStyle);
    }
  }, [activePageId, pageStyles]);

  // Aplicar estilos diretamente ao elemento de preview (similar ao PageEditor)
  useEffect(() => {
    if (pageStyle) {
      // Buscar o elemento de preview 
      const previewElement = document.getElementById('page-preview-container');
      
      if (previewElement) {
        // Aplicar cor de fundo ou imagem de fundo
        if (pageStyle.backgroundType === 'image' && pageStyle.backgroundImage) {
          previewElement.style.backgroundImage = `url(${pageStyle.backgroundImage})`;
          previewElement.style.backgroundSize = 'cover';
          previewElement.style.backgroundPosition = 'center';
          previewElement.style.backgroundRepeat = 'no-repeat';
          previewElement.style.backgroundColor = '';
        } else if (pageStyle.backgroundType === 'gradient') {
          previewElement.style.backgroundImage = '';
          previewElement.style.background = `linear-gradient(${pageStyle.gradientDirection || 'to right'}, ${pageStyle.gradientStartColor || '#4f46e5'}, ${pageStyle.gradientEndColor || '#818cf8'})`;
        } else {
          previewElement.style.backgroundImage = '';
          previewElement.style.background = '';
          previewElement.style.backgroundColor = pageStyle.backgroundColor || '#ffffff';
        }
        
        // Aplicar fonte e cor do texto
        previewElement.style.fontFamily = pageStyle.fontFamily || 'Inter, sans-serif';
        //previewElement.style.color = pageStyle.textColor || '#333333';        
        //previewElement.style.color = '#333333';        
        
        // Forçar re-render dos componentes
        console.log('PageStyle atualizado no Dashboard:', pageStyle);
      }
    }
  }, [pageStyle]);

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
      
      await api.put(
        `/api/pages/${pageId}/style`,
        { style: styleToSave }
      );
      
      // Recarregar os componentes para atualizar o preview
      if (activePageId === pageId) {
        const response = await api.get(`/api/pages/${activePageId}`);
        const parsedComponents = response.data.components.map(comp => ({
          ...comp,
          content: typeof comp.content === 'string' ? JSON.parse(comp.content) : comp.content
        }));
        setComponents(parsedComponents);
      }
      
      // Feedback visual
      const styleSection = document.getElementById(`style-section-${pageId}`);
      if (styleSection) {
        styleSection.classList.add('bg-green-50');
        setTimeout(() => {
          styleSection.classList.remove('bg-green-50');
        }, 2000);
      }
      
      // Limpar o estado de alterações não salvas
      setUnsavedChanges(prev => ({
        ...prev,
        [pageId]: false
      }));
      
    } catch (error) {
      console.error('Erro ao salvar estilo:', error);
      alert('Erro ao salvar as alterações. Tente novamente.');
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

        <div className="min-h-screen w-full pl-[100px]">

          <AppHeader 
            user={user}
            pages={pages}
            unsavedChanges={unsavedChanges}
            savePageStyle={savePageStyle}               
          />

          <main className="flex flex-col md:flex-row">

            {/* Coluna de edição - Esquerda */}
            <div className="md:w-8/12 space-y-4 pt-8 px-8 h-[calc(100vh-70px)] border-r border-gray-200 overflow-y-scroll">
              
              <div className="mb-8 justify-between items-center">
                <h1 className="text-2xl font-bold text-violet-700">                
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
                      
                      <Card noShadow noPadding noBorder>
                        <div className="flex justify-center">
                          <div className="w-1/2">
                            <ImageUploader 
                              onImageUpload={(imageUrl) => handleLogoUpload(page.id, imageUrl)}
                              currentImage={pageStyles[page.id]?.logo || ''}
                            />  
                          </div>                
                          <div className="w-1/2 flex flex-col justify-center items-start">
                            {editingSlug === page.id ? (
                              <div className="flex items-center flex-col items-start">
                                <div className="flex items-center">
                                  <span className="text-2xl font-medium text-gray-500 mr-2">hublink.app/</span>
                                  <input
                                    type="text"
                                    value={slugValue}
                                    onChange={(e) => setSlugValue(e.target.value)}
                                    className="max-w-[200px] flex-1 px-3 py-1 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="minha-pagina"
                                  />
                                </div>
                                {slugError && (
                                  <p className="mt-1 text-sm text-red-600">{slugError}</p>
                                )}
                                <div className="flex w-full mt-2">
                                  <button
                                    onClick={() => saveSlug(page.id)}
                                    className="mr-2 text-violet-900 px-4 py-1 border-2 border-violet-900 rounded-md hover:text-blue-800 text-sm hover:bg-violet-900 hover:text-white"
                                  >
                                    Salvar
                                  </button>
                                  <button
                                    onClick={() => setEditingSlug(null)}
                                    className="px-3 py-1 bg-gray-200 px-4 py-1 text-gray-700 text-sm rounded hover:bg-gray-300"
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-start flex-col">
                                <h2 className="text-2xl font-medium text-gray-500">
                                  hublink.app/{page.slug}
                                </h2>
                                <button
                                  onClick={() => startEditingSlug(page)}
                                  className="mt-2 text-violet-900 px-4 py-1 border-2 border-violet-900 rounded-md hover:text-blue-800 text-sm hover:bg-violet-900 hover:text-white"
                                >
                                  Alterar endereço
                                </button>
                              </div>
                            )}
                          </div>
                        </div>                      
                      </Card>                       
                     
                      <Card title="Estilo de Background" noShadow>                        
                        <div className="flex gap-4">
                          <div className="w-1/4 flex flex-col gap-8 pr-8">
                            
                            <button
                              className={`flex flex-col items-center gap-2 justify-center px-4 py-2 rounded-md text-md font-medium border-2  hover:bg-violet-700 hover:text-white ${
                                (pageStyles[page.id]?.backgroundType === 'color' || !pageStyles[page.id]?.backgroundType) 
                                  ? 'bg-violet-700 text-white' 
                                  : 'bg-white text-violet-700 '
                              }`}
                              onClick={() => updatePageStyle(page.id, 'backgroundType', 'color')}
                            >
                              <IoColorFillOutline size={40}/>
                              <span>Cor Sólida</span>
                            </button>
                            
                            <button
                              className={`flex flex-col items-center gap-2 justify-center px-4 py-2 rounded-md text-md font-medium border-2 border-violet-700 hover:bg-violet-700 hover:text-white  ${
                                pageStyles[page.id]?.backgroundType === 'gradient' 
                                  ? 'bg-violet-700 text-white' 
                                  : 'bg-white text-violet-700'
                              }`}
                              onClick={() => updatePageStyle(page.id, 'backgroundType', 'gradient')}
                            >
                              <IoIosColorFilter size={40}/>
                              <span>Degradê</span>
                            </button>
                            
                            <button
                              className={`flex flex-col items-center gap-2 justify-center px-4 py-2 rounded-md text-md font-medium border-2 hover:bg-violet-700 hover:text-white ${
                                pageStyles[page.id]?.backgroundType === 'image' 
                                  ? 'bg-violet-700 text-white' 
                                  : 'bg-white text-violet-700'
                              }`}
                              onClick={() => updatePageStyle(page.id, 'backgroundType', 'image')}
                            >
                              <FaRegImage size={40}/>
                              <span>Imagem</span>
                            </button>

                          </div> 

                        <div className="w-3/4 flex items-center justify-center">                            
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
                              <div className="w-full flex gap-8">                                
                                
                                <div className="flex flex-col gap-8 w-1/2">                               
                                    
                                    <div>
                                      <label className="block text-md font-medium text-gray-700 mb-1">                                      
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
                                    
                                    <label className="block text-md font-medium text-gray-700 mt-4 mb-1">
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
                                
                                    <div className="mt-4">
                                      <label className="block text-md font-medium text-gray-700 mb-1">
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
                                <div className="w-1/2  rounded border-2"
                                  style={{ 
                                    background: `linear-gradient(${pageStyles[page.id]?.gradientDirection || 'to right'}, 
                                    ${pageStyles[page.id]?.gradientStartColor || '#4f46e5'}, 
                                    ${pageStyles[page.id]?.gradientEndColor || '#818cf8'})`
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
                          </div>
                        </div>                        
                      </Card>

                      {/* Card para Fonte e Texto */}
                      <Card title="Configuração de Fonte e Texto" noShadow>
                        <div className="flex gap-8">
                          
                          <div className="w-1/3">
                            <h4 className="font-medium text-gray-700 mb-2">Família da Fonte</h4>
                            <select
                              value={pageStyles[page.id]?.fontFamily || defaultStyle.fontFamily}
                              onChange={(e) => updatePageStyle(page.id, 'fontFamily', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-violet-700 focus:border-transparent"
                            >
                              {availableFonts.map((font) => (
                                <option key={font.value} value={font.value}>
                                  {font.name}
                                </option>
                              ))}
                            </select>
                          </div>
                                                
                          <div className="w-1/3">
                            <h4 className="font-medium text-gray-700 mb-2">
                              Tamanho da Fonte: {pageStyles[page.id]?.fontSize || 16}px
                            </h4>                            
                            <input
                              type="range"
                              min="12"
                              max="24"
                              value={pageStyles[page.id]?.fontSize || 16}
                              onChange={(e) => updatePageStyle(page.id, 'fontSize', parseInt(e.target.value))}
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <span>12px</span>
                              <span>24px</span>
                            </div>
                          </div>
                          
                          <div className="w-1/3">
                            <h4 className="font-medium text-gray-700 mb-2">Peso da Fonte</h4>
                            <select
                              value={pageStyles[page.id]?.fontWeight || 'normal'}
                              onChange={(e) => updatePageStyle(page.id, 'fontWeight', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-violet-700 focus:border-transparent"
                            >
                              <option value="normal">Normal</option>
                              <option value="bold">Negrito</option>
                            </select>
                          </div>
                        </div>
                      </Card>

                      {/* Card para Configuração dos Links */}
                      <Card title="Configuração dos Links" noShadow>
                        <div className="flex flex-col gap-8">
                          
                          <div className="flex gap-8 w-full">
                            
                            <div className="w-1/3">
                              <h4 className="font-medium text-gray-700 mb-2">Cor de Fundo dos Links</h4>
                              <div className="flex items-center gap-3">
                                <div 
                                  className="h-10 w-10 rounded border cursor-pointer"
                                  style={{ backgroundColor: pageStyles[page.id]?.linkBackgroundColor || '#3b82f6' }}
                                  onClick={() => setShowColorPicker('linkBackground-' + page.id)}
                                ></div>
                                <input
                                  type="text"
                                  value={pageStyles[page.id]?.linkBackgroundColor || '#3b82f6'}
                                  onChange={(e) => updatePageStyle(page.id, 'linkBackgroundColor', e.target.value)}
                                  className="px-3 py-2 border border-gray-300 rounded text-sm w-32"
                                />
                              </div>
                              {showColorPicker === 'linkBackground-' + page.id && (
                                <div className="absolute z-10 mt-2">
                                  <div 
                                    className="fixed inset-0" 
                                    onClick={() => setShowColorPicker(null)}
                                  ></div>
                                  <SketchPicker 
                                    color={pageStyles[page.id]?.linkBackgroundColor || '#3b82f6'}
                                    onChange={(color) => {
                                      updatePageStyle(page.id, 'linkBackgroundColor', color.hex);
                                    }}
                                  />
                                </div>
                              )}
                            </div>{/* cor de fundo*/}

                            <div className="w-1/3">
                              <h4 className="font-medium text-gray-700 mb-2">Cor do Texto dos Links</h4>
                              <div className="flex items-center gap-3">
                                <div 
                                  className="h-10 w-10 rounded border cursor-pointer"
                                  style={{ backgroundColor: pageStyles[page.id]?.linkTextColor || '#ffffff' }}
                                  onClick={() => setShowColorPicker('linkText-' + page.id)}
                                ></div>
                                <input
                                  type="text"
                                  value={pageStyles[page.id]?.linkTextColor || '#ffffff'}
                                  onChange={(e) => updatePageStyle(page.id, 'linkTextColor', e.target.value)}
                                  className="px-3 py-2 border border-gray-300 rounded text-sm w-32"
                                />
                              </div>
                              
                              {showColorPicker === 'linkText-' + page.id && (
                                <div className="absolute z-10 mt-2">
                                  <div 
                                    className="fixed inset-0" 
                                    onClick={() => setShowColorPicker(null)}
                                  ></div>
                                  <SketchPicker 
                                    color={pageStyles[page.id]?.linkTextColor || '#ffffff'}
                                    onChange={(color) => {
                                      updatePageStyle(page.id, 'linkTextColor', color.hex);
                                    }}
                                  />
                                </div>
                              )}
                            </div>{/* cor de texto*/}    
                            
                            <div className="w-1/3">
                              <h4 className="font-medium text-gray-700 mb-4">
                                Raio das Bordas: {pageStyles[page.id]?.linkBorderRadius || 8}px
                              </h4>                              
                              <input
                                type="range"
                                min="0"
                                max="20"
                                value={pageStyles[page.id]?.linkBorderRadius || 8}
                                onChange={(e) => updatePageStyle(page.id, 'linkBorderRadius', parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                              />
                              <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>Bordas retas</span>
                                <span>Muito arredondado</span>
                              </div>                              
                            </div>{/* Configuração de Bordas */}
                            
                          </div>
                          
                          
                        </div>
                        
                        {/* Configurações de Sombra */}
                        <h4 className="font-medium text-gray-700 mb-4 mt-8">Configuração da Sombra</h4>
                        <div className="flex gap-8">                                                    
                          <div className="w-full flex gap-8">
                            
                            <div className="w-1/4">
                              <label className="block text-sm text-gray-600 mb-2">Cor da Sombra</label>
                              <div className="flex items-center gap-3">
                                <div 
                                  className="h-8 w-8 rounded border cursor-pointer"
                                  style={{ backgroundColor: pageStyles[page.id]?.linkShadowColor || '#000000' }}
                                  onClick={() => setShowColorPicker('linkShadow-' + page.id)}
                                ></div>
                                <input
                                  type="text"
                                  value={pageStyles[page.id]?.linkShadowColor || '#000000'}
                                  onChange={(e) => updatePageStyle(page.id, 'linkShadowColor', e.target.value)}
                                  className="px-3 py-2 border border-gray-300 rounded text-sm w-[135px]"
                                />
                              </div>                              
                              {showColorPicker === 'linkShadow-' + page.id && (
                                <div className="absolute z-10 mt-2">
                                  <div 
                                    className="fixed inset-0" 
                                    onClick={() => setShowColorPicker(null)}
                                  ></div>
                                  <SketchPicker 
                                    color={pageStyles[page.id]?.linkShadowColor || '#000000'}
                                    onChange={(color) => {
                                      updatePageStyle(page.id, 'linkShadowColor', color.hex);
                                    }}
                                  />
                                </div>
                              )}
                            </div>{/* cor da sombra*/}
                            
                            <div className="w-1/4">
                              <label className="block text-sm text-gray-600 mb-2">
                                Intensidade: {pageStyles[page.id]?.linkShadowIntensity || 4}
                              </label>
                              <input
                                type="range"
                                min="0"
                                max="10"
                                value={pageStyles[page.id]?.linkShadowIntensity || 4}
                                onChange={(e) => updatePageStyle(page.id, 'linkShadowIntensity', parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                              />
                              <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>0</span>
                                <span>10</span>
                              </div>
                            </div>
                            
                            <div className="w-1/4">
                              <label className="block text-sm text-gray-600 mb-2">
                                Desfoque: {pageStyles[page.id]?.linkShadowBlur || 4}
                              </label>
                              <input
                                type="range"
                                min="0"
                                max="20"
                                value={pageStyles[page.id]?.linkShadowBlur || 4}
                                onChange={(e) => updatePageStyle(page.id, 'linkShadowBlur', parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                              />
                              <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>Dura</span>
                                <span>Suave</span>
                              </div>
                            </div>{/* desfoque*/}
                            
                            <div className="w-1/4">
                              <label className="block text-sm text-gray-600 mb-2">
                                Opacidade: {pageStyles[page.id]?.linkShadowOpacity || 20}%
                              </label>
                              <input
                                type="range"
                                min="10"
                                max="100"
                                step="5"
                                value={pageStyles[page.id]?.linkShadowOpacity || 20}
                                onChange={(e) => updatePageStyle(page.id, 'linkShadowOpacity', parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                              />
                              <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>Sutil</span>
                                <span>Forte</span>
                              </div>
                            </div>{/* opacidade*/}

                          </div>
                        </div>

                      </Card>

                      {/* Card de Ações */}
                      <Card noPadding noShadow noBorder>
                        <div className="flex space-x-3">
                          <button
                            onClick={() => savePageStyle(page.id)}
                            className="flex items-center px-4 py-2 font-medium text-white rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2 cursor-pointer text-md bg-violet-700 hover:bg-violet-900"
                            disabled={!unsavedChanges[page.id]}
                          >
                            <FaRegSave className="mr-2" size={19}/>
                            <span>Salvar Alterações</span>
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

            {/* Prévia */}
            <div className="w-full md:w-4/12 flex flex-col justify-center items-center h-[calc(100vh-70px)] border border-gray-200">
              <PagePreview 
                components={components} 
                pageStyle={pageStyle || defaultStyle} 
              />
            </div>
            

          </main>
        </div>
      </div>
    </>
  );
};



export default Dashboard; 