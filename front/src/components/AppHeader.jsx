import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import UserName from '../components/UserName';
import { FaRegSave } from "react-icons/fa";
import { FaExternalLinkAlt } from "react-icons/fa";

const AppHeader = ({
  user,
  pages = [],
  unsavedChanges = {},
  savePageStyle,
  showEditButton = false,
  showAnalyticsButton = false,
  showPreviewButton = true,
  showSaveButton = true,
  onSave,
  hasChanges,
  saving
}) => {
  
  return (
    <nav className="bg-white border-b border-gray-200 mx-full px-4 sm:px-6 lg:px-8 flex justify-between h-16 z-50">      
        
          <div className="flex items-center w-full justify-between">
            
            <div className="flex items-center">
              <Logo />
              <UserName user={user} />                            
            </div>

            {pages.map((page) => (
              <div key={`controls-${page.id}`} className="flex items-center">         
                
                {showSaveButton && (savePageStyle || onSave) && (                  
                  <button                    
                    onClick={() => {
                      if (savePageStyle) {
                        savePageStyle(page.id);
                      } else if (onSave) {
                        onSave();
                      }
                    }}
                    className={`flex items-center px-4 py-2 text-white font-medium rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2 cursor-pointer text-md
                      ${unsavedChanges[page.id] || hasChanges 
                        ? 'bg-violet-700 hover:bg-violet-900' 
                        : 'bg-gray-400 hover:bg-gray-400'
                    }`}
                    disabled={!(unsavedChanges[page.id] || hasChanges)}
                  >
                    <FaRegSave  className="mr-2" size={19}/>
                    {saving ? 'Salvando...' : (unsavedChanges[page.id] || hasChanges) ? 'Salvar Alterações' : 'Alterações Salvas'}
                  </button>
                )}

                {showPreviewButton && (                  
                  <Link 
                      to={`/${page.slug}`}
                      className={`flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-3xl hover:bg-green-700 mr-2 cursor-pointer text-md`}
                      target="_blank"
                  >
                    <FaExternalLinkAlt className="mr-2" size={16}/>
                      Visualize sua Página
                  </Link>
                )}
              </div>
            ))}
          </div>      
    </nav>
  );
};

export default AppHeader; 