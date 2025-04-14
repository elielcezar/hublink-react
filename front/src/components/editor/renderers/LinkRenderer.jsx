import React from 'react';

const LinkRenderer = ({ content }) => {
  // Configuração de largura comum para ambos os estilos
  const width = content.width || '100';
  
  // Define corretamente a classe de largura
  let widthClass;
  if (width === '100') {
    widthClass = 'w-full'; // Ocupa toda a largura
  } else if (width === '50') {
    widthClass = 'w-full md:w-1/2'; // Metade da largura em telas médias e grandes
  } else {
    widthClass = 'w-full md:w-1/3'; // Um terço da largura em telas médias e grandes
  }
  
  // Verificar se é um ícone ou botão
  if (content.styleType === 'icon') {
    // Estilo de ícone com imagem de fundo
    return (
      <div className={`${widthClass} px-2 mb-4`}>
        <a 
          href={content.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block overflow-hidden relative w-full h-32 rounded-lg shadow-md transition-transform hover:scale-105"
          style={{
            background: content.imageUrl ? `url(${content.imageUrl}) center/cover no-repeat` : 'linear-gradient(to right, #4f46e5, #6366f1)'
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <span className=" text-lg font-medium px-6 py-2 text-center">
              {content.text}
            </span>
          </div>
        </a>
      </div>
    );
  }
  
  // Estilo de botão (original)
  // Verificar se há imagem
  const hasImage = content.imageUrl && content.imageUrl.trim() !== '';
  const imagePosition = content.imagePosition || 'left';
  
  // Determinar a cor do texto para botão secundário (usar a cor do texto geral da página)
  const secondaryTextColor = { color: 'var(--text-color, #333333)' };
  
  return (
    <div className={`${widthClass} px-2 mb-4`}>
      <div 
        className={`h-full flex ${hasImage && imagePosition === 'top' ? 'flex-col' : 'items-center'} 
          ${hasImage && imagePosition === 'right' ? 'flex-row-reverse' : 'flex-row'} 
          border border-gray-200 rounded-lg p-4 transition-all hover:shadow-md`}
        style={content.style === 'primary' ? { backgroundColor: 'var(--link-color, #3b82f6)' } : {}}
      >
        
        {hasImage && (
          <div className={`
            ${imagePosition === 'top' ? 'w-full mb-3' : 'w-1/3 flex-shrink-0 mx-3'} 
          `}>
            <img 
              src={content.imageUrl} 
              alt="" 
              className="w-full h-auto rounded-lg"
            />
          </div>
        )}
        
        <div className={`${hasImage && imagePosition !== 'top' ? 'w-2/3' : 'w-full'}`}>
          <a 
            href={content.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className={`inline-block px-4 py-2 rounded ${
              content.style === 'primary' 
                ? ' hover:opacity-90' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
            style={content.style === 'primary' ? {} : secondaryTextColor}
          >
            {content.text}
          </a>
        </div>
      </div>
    </div>
  );
};

export default LinkRenderer; 