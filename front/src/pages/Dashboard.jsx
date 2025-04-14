import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import MenuDashboard from '../components/MenuDashboard';
import axios from 'axios';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewPageForm, setShowNewPageForm] = useState(false);
  const [newPage, setNewPage] = useState({ title: '', slug: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        // Buscar dados do usuário
        const userResponse = await axios.get('http://localhost:3001/api/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(userResponse.data);
        
        // Buscar páginas do usuário
        const pagesResponse = await axios.get('http://localhost:3001/api/pages', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPages(pagesResponse.data);
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
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:3001/api/pages',
        newPage,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Adicionar a nova página à lista
      setPages([response.data, ...pages]);
      
      // Limpar o formulário e fechá-lo
      setNewPage({ title: '', slug: '' });
      setShowNewPageForm(false);
      
      // Redirecionar para o editor da nova página
      navigate(`/editor/${response.data.id}`);
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
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3001/api/pages/${pageId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Remover a página da lista
      setPages(pages.filter(page => page.id !== pageId));
    } catch (error) {
      console.error('Erro ao excluir página:', error);
      alert('Erro ao excluir a página');
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

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Suas Landing Pages</h2>
              
              <button
                onClick={() => setShowNewPageForm(!showNewPageForm)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {showNewPageForm ? 'Cancelar' : 'Criar Nova Landing Page'}
              </button>
            </div>
            
            {showNewPageForm && (
              <div className="mb-8 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Nova Landing Page</h3>
                
                {error && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
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
                      <span className="text-gray-500 mr-2">hublink.com/</span>
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
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Título
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        URL
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Status
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Criada em
                      </th>
                      <th scope="col" className="relative py-3.5 px-3">
                        <span className="sr-only">Ações</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {pages.map((page) => (
                      <tr key={page.id}>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                          {page.title}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          /{page.slug}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          {page.published ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Publicada
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Rascunho
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {new Date(page.createdAt).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-right space-x-2">
                          <Link
                            to={`/editor/${page.id}`}
                            className="text-blue-600 hover:text-blue-900 mr-2"
                          >
                            Editar
                          </Link>
                          {page.published && (
                            <a
                              href={`/${page.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-600 hover:text-green-900 mr-2"
                            >
                              Visualizar
                            </a>
                          )}
                          <button
                            onClick={() => handleDeletePage(page.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Excluir
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-gray-100 p-8 text-center rounded-lg">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
                <p className="mt-2 text-gray-600">
                  Você ainda não criou nenhuma landing page.
                </p>
                <p className="mt-1 text-gray-600">
                  Clique no botão "Criar Nova Landing Page" para começar.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default Dashboard; 