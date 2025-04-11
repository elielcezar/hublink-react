import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom';

export default function MenuDashboard() {

    const [user, setUser] = useState(null);

    useEffect(() => {
        const user = localStorage.getItem('user');
        setUser(JSON.parse(user));
    }, []);

    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };
  
  return (
    <aside className="flex flex-col items-center justify-start h-screen w-1/12">
        <h1 className="text-xl font-bold text-gray-900">
          Hub<span className="text-blue-600">Link</span>
        </h1> 
        <span className="text-gray-700 mr-4">Olá, {user?.name}</span>

        <Link
                  to="/dashboard"
                  className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Voltar
                </Link>


        <button  onClick={handleLogout} className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
          Sair
        </button>     
        <nav className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                
              </div>
              <div className="flex items-center">
                
              </div>
            </div>
          </div>
        </nav>
      </aside>
  )
}


