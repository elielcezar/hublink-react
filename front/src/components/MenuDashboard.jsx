import React, { useState, useEffect } from 'react'
import logo from '../assets/logo.png';
import { IoHomeSharp } from "react-icons/io5";
import editor from '../assets/editor.png';
import aparencia from '../assets/aparencia.png';
import config from '../assets/config.png';
import { useNavigate, Link } from 'react-router-dom';

export default function MenuDashboard() {

    const [user, setUser] = useState(null);

    useEffect(() => {
        const user = localStorage.getItem('user');
        setUser(JSON.parse(user));
    }, []);

    const navigate = useNavigate();

    
  
  return (
    <aside className="flex flex-col items-center justify-start h-screen w-1/12 bg-violet-700">
        <h1 className="text-xl font-bold text-gray-900">
            <img src={logo} alt="logo" className="w-12 h-12 my-5" />
        </h1>        

        <Link to="/dashboard" className="text-white w-[30px] h-[30px] text-3xl my-4"><IoHomeSharp /></Link> 
        <Link to="/editor" className="text-white"><img src={editor} alt="editor" className="w-8 my-4" /></Link>
        <Link to="/aparencia" className="text-white"><img src={aparencia} alt="aparencia" className="w-7 my-4" /></Link>
        <Link to="/config" className="text-white"><img src={config} alt="config" className="w-8 my-4" /></Link>
        
      </aside>
  )
}


