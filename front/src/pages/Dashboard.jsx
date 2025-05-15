import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import MenuDashboard from '../components/MenuDashboard';
import api from '../config/apiConfig';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { SketchPicker } from 'react-color';
import ImageUploader from '../components/ImageUploader';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewPageForm, setShowNewPageForm] = useState(false);
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleCreatePage = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!newPage.title || !newPage.slug) {
      setError('Preencha todos os campos');
      return;
    }
    
    try {
      const response = await api.post('/api/pages', newPage);
      
      // Adicionar a nova página à lista
      setPages([response.data, ...pages]);
      
      // Limpar o formulário e fechá-lo
      setNewPage({ title: '', slug: '' });
      setShowNewPageForm(false);
      
      // Redirecionar para o editor da nova página
      navigate(`/pages/${response.data.id}/edit`);
    } catch (error) {
      console.error('Erro ao criar página:', error);
      setError(error.response?.data?.message || 'Erro ao criar a página');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Se o campo for o título, gerar automaticamente um slug
    if (name === 'title') {
      const slug = value
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remover caracteres especiais
        .replace(/\s+/g, '-') // Substituir espaços por hífens
        .replace(/--+/g, '-') // Remover hífens duplicados
        .trim();
      
      setNewPage({
        ...newPage,
        title: value,
        slug
      });
    } else {
      setNewPage({
        ...newPage,
        [name]: value
      });
    }
  };

  const handleDeletePage = async (pageId) => {
    if (!confirm('Tem certeza que deseja excluir esta página?')) {
      return;
    }
    
    try {
      await api.delete(`/api/pages/${pageId}`);
      
      // Remover a página da lista
      setPages(pages.filter(page => page.id !== pageId));
    } catch (error) {
      console.error('Erro ao excluir página:', error);
      alert('Erro ao excluir a página');
    }
  };
  
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
    
    // Validar formato do slug
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

  // Função para expandir/recolher um item do acordeão
  const togglePageExpansion = (pageId) => {
    if (expandedPageId === pageId) {
      setExpandedPageId(null);
    } else {
      setExpandedPageId(pageId);
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

      <div className="min-h-screen bg-gray-100 w-11/12">
      <nav className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-gray-900">
                  Hub<span className="text-blue-600">Link</span>
                </h1>               

                <span className="text-gray-700 mr-4">Olá, {user?.name}</span>

                <button  onClick={handleLogout} className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    Sair
                  </button> 
              </div>
              
            </div>
          </div>
        </nav>

        <main className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Suas Páginas</h1>
              <button
                onClick={() => setShowNewPageForm(!showNewPageForm)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                {showNewPageForm ? 'Cancelar' : 'Criar Nova Página'}
              </button>
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}
            
            {showNewPageForm && (
              <div className="mb-6 bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-lg font-semibold mb-4">Criar Nova Página</h2>
                
                {error && (
                  <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                    {error}
                  </div>
                )}
                
                <form onSubmit={handleCreatePage}>
                  <div className="mb-4">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      Título da Página
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={newPage.title}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Minha Landing Page"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                      URL Personalizada
                    </label>
                    <div className="flex items-center">
                      <span className="text-gray-500 mr-2">hublink.app/</span>
                      <input
                        type="text"
                        id="slug"
                        name="slug"
                        value={newPage.slug}
                        onChange={handleInputChange}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="minha-landing-page"
                        required
                      />
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      Apenas letras minúsculas, números e hífens.
                    </p>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Criar e Editar
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {pages.length > 0 ? (
              <div className="space-y-4">
                {pages.map((page) => (
                  <div key={page.id} className="bg-white rounded-lg shadow overflow-hidden">
                    {/* Cabeçalho do acordeon */}
                    <div 
                      className="px-4 py-5 border-b border-gray-200 cursor-pointer hover:bg-gray-50"
                      onClick={() => togglePageExpansion(page.id)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-medium text-gray-900">{page.title}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${page.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {page.published ? 'Publicada' : 'Rascunho'}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                         
                          <Link 
                            to={`/editor/${page.id}`}
                            className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            Editar
                          </Link>
                          <Link 
                            to={`/analytics/${page.id}`}
                            className="inline-flex items-center px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Analytics
                          </Link>
                          
                          {page.published ? (
                            <a
                              href={`/${page.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                              Visualizar
                            </a>
                          ) : (
                            <button
                              onClick={async () => {
                                try {
                                  await api.put(
                                    `/api/pages/${page.id}/publish`,
                                    { published: true }
                                  );
                                  
                                  // Atualizar a página na lista
                                  setPages(pages.map(p => 
                                    p.id === page.id ? { ...p, published: true } : p
                                  ));
                                } catch (error) {
                                  console.error('Erro ao publicar página:', error);
                                  alert('Erro ao publicar a página');
                                }
                              }}
                              className="inline-flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Publicar
                            </button>
                          )}                          
                          <button
                            onClick={() => togglePageExpansion(page.id)}
                            className="inline-flex items-center px-2 py-1 text-gray-500 hover:text-gray-700"
                          >
                            {expandedPageId === page.id ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Conteúdo do acordeon */}
                    {expandedPageId === page.id && (
                      <div className="px-4 py-5 sm:p-6 space-y-6">
                        {/* NOVA SEÇÃO: Personalização da Página */}
                        <div 
                          id={`style-section-${page.id}`} 
                          className={`mt-6 p-4 ${unsavedChanges[page.id] ? 'bg-yellow-50' : 'bg-gray-50'} rounded-lg transition-colors duration-300`}
                        >
                          <h3 className="text-lg font-medium mb-4">Personalização da Página</h3>

                          <h4 className="font-medium text-gray-700 mb-2">URL</h4>
                          {editingSlug === page.id ? (
                              <div>
                                <div className="flex items-center">
                                  <span className="text-gray-500 mr-2">hublink.com/</span>
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
                            ) : null }
                          <div className="flex items-center">
                            <p className="text-gray-900">/{page.slug}</p>
                            <button
                              onClick={() => startEditingSlug(page)}
                              className="ml-2 text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Editar
                            </button>
                          </div>


                          {/* Seção de Logo */}
                          <div className="mb-6">
                            <h4 className="font-medium text-gray-700 mb-2">Sua Marca</h4>
                            <ImageUploader 
                              onImageUpload={(imageUrl) => handleLogoUpload(page.id, imageUrl)}
                              currentImage={pageStyles[page.id]?.logo || ''}
                            />
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
                          
                          {/* Botão único de salvar alterações */}
                          <div className="mt-6 flex justify-end">
                           
                            {page.published && (
                            <button
                              onClick={async () => {
                                try {
                                  await api.put(
                                    `/api/pages/${page.id}/publish`,
                                    { published: false }
                                  );
                                  
                                  // Atualizar a página na lista
                                  setPages(pages.map(p => 
                                    p.id === page.id ? { ...p, published: false } : p
                                  ));
                                } catch (error) {
                                  console.error('Erro ao despublicar página:', error);
                                  alert('Erro ao despublicar a página');
                                }
                              }}
                              className="inline-flex items-center px-3 py-1 bg-orange-600 text-white text-sm rounded hover:bg-orange-700"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                              </svg>
                              Despublicar
                            </button>
                          )}

                            <button
                              onClick={() => handleDeletePage(page.id)}
                              className="inline-flex items-center px-3 py-1 mx-4 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Excluir
                            </button>

                            <button
                              onClick={() => savePageStyle(page.id)}
                              className={`px-4 py-2 ${unsavedChanges[page.id] ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500`}
                              disabled={!unsavedChanges[page.id]}
                            >
                              {unsavedChanges[page.id] ? 'Salvar Alterações' : 'Alterações Salvas'}
                            </button>

                          </div>
                        </div>                      
                        
                      </div>
                    )}
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