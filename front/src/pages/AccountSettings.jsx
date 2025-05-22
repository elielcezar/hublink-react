import { useState, useEffect } from 'react';
import MenuDashboard from '../components/MenuDashboard';
import AppHeader from '../components/AppHeader';
import api from '../config/apiConfig';
import { useNavigate } from 'react-router-dom';

const AccountSettings = () => {
  const [user, setUser] = useState({ name: '', email: '' });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/auth/user/details');
        setUser(response.data);
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
        if (error.response?.status === 401) {
          navigate('/');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [navigate]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setSuccessMessage('');
      setErrorMessage('');
      
      // Validações
      if (newPassword && newPassword !== confirmPassword) {
        setErrorMessage('As senhas não coincidem');
        setSaving(false);
        return;
      }
      
      // Dados para atualização
      const updateData = {
        name: user.name,
        email: user.email
      };
      
      // Adicionar nova senha se fornecida
      if (newPassword) {
        updateData.newPassword = newPassword;
      }
      
      // Enviar solicitação
      const response = await api.put('/api/auth/user/update', updateData);
      
      setSuccessMessage(response.data.message || 'Dados atualizados com sucesso!');
      
      // Limpar campos de senha
      setNewPassword('');
      setConfirmPassword('');
      
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
      
      if (error.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('Ocorreu um erro ao atualizar seus dados. Tente novamente.');
      }
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <>
      <div className="flex min-h-screen bg-gray-100">
        <MenuDashboard />
        
        <div className="flex-1 pl-[100px]">
            
          {user && <AppHeader user={user} />}
          
          <main className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">
                  Configurações da Conta
                </h1>
              </div>
              
              {loading ? (
                <div className="bg-white p-8 rounded-lg shadow-md text-center">
                  <p className="text-gray-600">Carregando dados...</p>
                </div>
              ) : (
                <div className="bg-white p-8 rounded-lg shadow-md">
                  {successMessage && (
                    <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                      {successMessage}
                    </div>
                  )}
                  
                  {errorMessage && (
                    <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                      {errorMessage}
                    </div>
                  )}
                  
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Informações Pessoais</h2>
                        
                        <div className="mb-4">
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Nome
                          </label>
                          <input
                            id="name"
                            type="text"
                            value={user.name}
                            onChange={(e) => setUser({ ...user, name: e.target.value })}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        
                        <div className="mb-4">
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            E-mail
                          </label>
                          <input
                            id="email"
                            type="email"
                            value={user.email}
                            onChange={(e) => setUser({ ...user, email: e.target.value })}
                            required                                                       
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                      
                      <div className="pt-6 border-t border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Alterar Senha</h2>
                        <p className="text-sm text-gray-500 mb-4">
                          Deixe os campos em branco se não deseja alterar sua senha.
                        </p>
                        
                        <div className="mb-4">
                          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                            Nova Senha
                          </label>
                          <input
                            id="newPassword"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        
                        <div className="mb-4">
                          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                            Confirmar Nova Senha
                          </label>
                          <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                      
                      <div className="pt-6">
                        <button
                          type="submit"
                          disabled={saving}
                          className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                          {saving ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default AccountSettings; 