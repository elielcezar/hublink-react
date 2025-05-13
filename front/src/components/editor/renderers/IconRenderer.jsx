import React from 'react';

const IconRenderer = ({ content }) => {
  // Configuração de largura
  const width = content.width || '100';
  
  // Define corretamente a classe de largura
  let widthClass;
  if (width === '100') {
    widthClass = 'w-full'; // Ocupa toda a largura
  } else if (width === '50') {
    widthClass = 'w-1/2'; // Metade da largura em telas médias e grandes
  } else {
    widthClass = 'w-1/3'; // Um terço da largura em telas médias e grandes
  }
  
  // Determinar a altura do ícone
  let heightClass;
  if (content.height === 'small') {
    heightClass = 'h-24'; // 96px
  } else if (content.height === 'large') {
    heightClass = 'h-48'; // 192px
  } else {
    heightClass = 'h-36'; // 144px (médio - padrão)
  }
  
  return (
    <div className={`icon-renderer ${widthClass} px-2 mb-4`}>
      <a 
        href={content.url} 
        target="_blank" 
        rel="noopener noreferrer"
        className={`block overflow-hidden relative w-full ${heightClass} rounded-lg shadow-md transition-transform hover:scale-105`}
        style={{
          background: content.imageUrl 
            ? `url(${content.imageUrl}) center/cover no-repeat` 
            : 'linear-gradient(to right, #4f46e5, #6366f1)'
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <span 
            className="text-lg font-medium px-6 py-3 text-center rounded"
            style={{ 
              backgroundColor: content.overlayColor || 'rgba(0, 0, 0, 0.4)',
              color: content.textColor || '#ffffff'
            }}
          >
            {content.text}
          </span>
        </div>
      </a>
    </div>
  );
};

export default IconRenderer; 