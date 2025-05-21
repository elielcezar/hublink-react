import React from 'react';
import { Link } from 'react-router-dom';
import api from '../config/apiConfig';

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
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center w-full justify-between">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                Hub<span className="text-blue-600">Link</span>
              </h1>              
            </div>

            {pages.map((page) => (
              <div key={`controls-${page.id}`}>
                <span className="text-gray-700 mr-4">Olá, {user?.name}</span>
                
                {showEditButton && (
                  <Link 
                    to={`/editor/${page.id}`}
                    className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 mr-2"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Editar
                  </Link>
                )}
                
                {showAnalyticsButton && (
                  <Link 
                    to={`/analytics/${page.id}`}
                    className="inline-flex items-center px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 mr-2"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Analytics
                  </Link>
                )}
                
                {showSaveButton && (savePageStyle || onSave) && (
                  <button
                    onClick={() => {
                      if (savePageStyle) {
                        savePageStyle(page.id);
                      } else if (onSave) {
                        onSave();
                      }
                    }}
                    className={`px-4 py-2 ${
                      unsavedChanges[page.id] || hasChanges 
                        ? 'bg-yellow-600 hover:bg-yellow-700' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    } text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2`}
                    disabled={!(unsavedChanges[page.id] || hasChanges)}
                  >
                    {saving ? 'Salvando...' : (unsavedChanges[page.id] || hasChanges) ? 'Salvar Alterações' : 'Alterações Salvas'}
                  </button>
                )}

                {showPreviewButton && (
                  <a
                    href={`/${page.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Visualize sua Página
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AppHeader; 