import React, { useState, useEffect } from 'react'
import logo from '../assets/logo.png';
import { IoHomeSharp } from "react-icons/io5";
import editor from '../assets/editor.png';
import aparencia from '../assets/aparencia.png';
import { MdDesignServices } from "react-icons/md";
import { MdOutlineDesignServices } from "react-icons/md";
import { GoGear } from "react-icons/go";
import { FaChartBar } from "react-icons/fa";
import { TbLogout } from "react-icons/tb";
import config from '../assets/config.png';
import { FiEdit3, FiBarChart2 } from "react-icons/fi";
import { useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../config/apiConfig';

export default function MenuDashboard() {
    const [user, setUser] = useState(null);
    const [userPage, setUserPage] = useState(null);
    const navigate = useNavigate();
    
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
  
    return (
      <aside className="flex flex-col items-center justify-start min-h-screen w-1/12 max-w-[100px] bg-violet-700">
          <h1 className="text-xl font-bold text-gray-900">
              <img src={logo} alt="logo" className="w-12 h-12 my-5" />
          </h1>        

          <Link 
            to="/dashboard" 
            className="text-white p-2 my-2 hover:bg-violet-800 rounded-full"
            title="Personalizar Página"
          >
            <MdOutlineDesignServices size={36} />
          </Link>

          {userPage && (
            <Link 
              to={`/editor/${userPage.id}`} 
              className="text-white p-2 my-2 hover:bg-violet-800 rounded-full"
              title="Editar Página"
            >
              <FiEdit3 size={36} />
            </Link>
          )}

          {userPage && (
            <Link 
              to={`/analytics/${userPage.id}`} 
              className="text-white p-2 my-2 hover:bg-violet-800 rounded-full"
              title="Analytics"
            >
              <FaChartBar size={36} />
            </Link>
          )}

          <Link 
            to="/config" 
            className="text-white p-2 my-2 hover:bg-violet-800 rounded-full"
            title="Configurações"
          >
            <GoGear size={36} />
          </Link>

          <div className="mt-auto mb-8">
            <button 
              onClick={handleLogout} 
              className="text-white p-2 my-2 hover:bg-violet-800 rounded-full"
              title="Sair"
            >
              <TbLogout size={36} />
            </button>
          </div>
      </aside>
    );
}


