import React from 'react';

export default function Header() {
    const [user, setUser] = useState(null);
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);


    return (
        <nav className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-gray-900">
                  Hub<span className="text-blue-600">Link</span>
                </h1>
                <span className="ml-4 text-gray-600 truncate max-w-xs">
                  {page?.title}
                </span>

                <span className="text-gray-700 mr-4">Olá, {user?.name}</span>

                <div className="flex items-center space-x-4">
                  {saving && (
                    <span className="text-sm text-gray-500 flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Salvando...
                    </span>
                  )}
                  {lastSaved && !saving && (
                    <span className="text-sm text-gray-500">
                      Último salvamento: {lastSaved.toLocaleTimeString()}
                    </span>
                  )}
                  <button
                    onClick={togglePublish}
                    disabled={saving}
                    className={`px-4 py-2 text-sm rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                      page?.published
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {page?.published ? 'Despublicar' : 'Publicar'}
                  </button>
                                
                </div>
              </div>
              
            </div>
          </div>
        </nav>
    )
}
