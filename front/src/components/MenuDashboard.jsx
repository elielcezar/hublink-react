import React, { useState, useEffect } from 'react'
import logo from '../assets/logo.png';
import { MdOutlineDesignServices } from "react-icons/md";
import { GoGear } from "react-icons/go";
import { FaChartBar } from "react-icons/fa";
import { TbLogout } from "react-icons/tb";
import { FiEdit3 } from "react-icons/fi";
import { useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../config/apiConfig';

export default function MenuDashboard() {
    const [_user, setUser] = useState(null);
    const [userPage, setUserPage] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    
    // Estado para controlar qual tooltip está visível
    const [activeTooltip, setActiveTooltip] = useState(null);
    
    useEffect(() => {
        const fetchUserAndPage = async () => {
            try {
                // Recuperar o usuário do localStorage
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    const parsedUser = JSON.parse(storedUser);
                    setUser(parsedUser);
                    
                    // Buscar a página única do usuário
                    const pagesResponse = await api.get('/api/pages');
                    if (pagesResponse.data && pagesResponse.data.length > 0) {
                        // Como o usuário só tem uma página, pegamos a primeira
                        setUserPage(pagesResponse.data[0]);
                    }
                }
            } catch (error) {
                console.error('Erro ao buscar dados do usuário e página:', error);
            }
        };
        
        fetchUserAndPage();
    }, []);

    const handleLogout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/');
    };
    
    // Verifica se o caminho atual corresponde ao link para destacá-lo
    const isActive = (path) => {
      if (path === '/dashboard') {
        return location.pathname === path;
      }
      return location.pathname.includes(path);
    };
  
    return (
      <aside className="flex flex-col items-center justify-start min-h-screen w-1/12 max-w-[100px] bg-violet-700 relative">
          <div className="text-xl font-bold text-gray-900 mt-5 mb-10">
              <img src={logo} alt="logo" className="w-12 h-12" />
          </div>        

          {/* Menu Item - Personalizar */}
          <div 
            className="relative"
            onMouseEnter={() => setActiveTooltip('personalizar')}
            onMouseLeave={() => setActiveTooltip(null)}
          >
            <Link 
              to="/dashboard" 
              className={`text-white p-2 my-2 hover:bg-violet-800 rounded-full flex items-center justify-center ${
                isActive('/dashboard') ? 'bg-violet-800' : ''
              }`}
            >
              <MdOutlineDesignServices size={36} />
            </Link>
            {activeTooltip === 'personalizar' && (
              <div className="absolute left-full ml-2 px-3 py-2 bg-gray-800 text-white text-sm rounded whitespace-nowrap z-50 -translate-y-12">
                Personalizar Perfil
                <div className="absolute top-1/2 right-full -translate-y-1/2 border-8 border-transparent border-r-gray-800"></div>
              </div>
            )}
          </div>

          {/* Menu Item - Editor */}
          {userPage && (
            <div 
              className="relative"
              onMouseEnter={() => setActiveTooltip('editor')}
              onMouseLeave={() => setActiveTooltip(null)}
            >
              <Link 
                to={`/editor/${userPage.id}`} 
                className={`text-white p-2 my-2 hover:bg-violet-800 rounded-full flex items-center justify-center ${
                  isActive('/editor') ? 'bg-violet-800' : ''
                }`}
              >
                <FiEdit3 size={36} />
              </Link>
              {activeTooltip === 'editor' && (
                <div className="absolute left-full ml-2 px-3 py-2 bg-gray-800 text-white text-sm rounded whitespace-nowrap z-50 -translate-y-12">
                  Editar Página
                  <div className="absolute top-1/2 right-full -translate-y-1/2 border-8 border-transparent border-r-gray-800"></div>
                </div>
              )}
            </div>
          )}

          {/* Menu Item - Analytics */}
          {userPage && (
            <div 
              className="relative"
              onMouseEnter={() => setActiveTooltip('analytics')}
              onMouseLeave={() => setActiveTooltip(null)}
            >
              <Link 
                to={`/analytics/${userPage.id}`} 
                className={`text-white p-2 my-2 hover:bg-violet-800 rounded-full flex items-center justify-center ${
                  isActive('/analytics') ? 'bg-violet-800' : ''
                }`}
              >
                <FaChartBar size={36} />
              </Link>
              {activeTooltip === 'analytics' && (
                <div className="absolute left-full ml-2 px-3 py-2 bg-gray-800 text-white text-sm rounded whitespace-nowrap z-50 -translate-y-12">
                  Analytics
                  <div className="absolute top-1/2 right-full -translate-y-1/2 border-8 border-transparent border-r-gray-800"></div>
                </div>
              )}
            </div>
          )}

          {/* Menu Item - Configurações */}
          <div 
            className="relative"
            onMouseEnter={() => setActiveTooltip('config')}
            onMouseLeave={() => setActiveTooltip(null)}
          >
            <Link 
              to="/config" 
              className={`text-white p-2 my-2 hover:bg-violet-800 rounded-full flex items-center justify-center ${
                isActive('/config') ? 'bg-violet-800' : ''
              }`}
            >
              <GoGear size={36} />
            </Link>
            {activeTooltip === 'config' && (
                <div className="absolute left-full ml-2 px-3 py-2 bg-gray-800 text-white text-sm rounded whitespace-nowrap z-50 -translate-y-12">
                  Configurações
                  <div className="absolute top-1/2 right-full -translate-y-1/2 border-8 border-transparent border-r-gray-800"></div>
                </div>
            )}
          </div>

          {/* Menu Item - Logout */}
          <div 
            className="relative mt-auto mb-8"
            onMouseEnter={() => setActiveTooltip('logout')}
            onMouseLeave={() => setActiveTooltip(null)}
          >
            <button 
              onClick={handleLogout} 
              className="text-white p-2 my-2 hover:bg-violet-800 rounded-full flex items-center justify-center"
            >
              <TbLogout size={36} />
            </button>
            {activeTooltip === 'logout' && (
              <div className="absolute left-full ml-2 px-3 py-2 bg-gray-800 text-white text-sm rounded whitespace-nowrap z-50 -translate-y-10">
                Sair
                <div className="absolute top-1/2 right-full -translate-y-1/2 border-8 border-transparent border-r-gray-800"></div>
              </div>
            )}
          </div>
      </aside>
    );
}


