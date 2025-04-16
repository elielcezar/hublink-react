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
  
  // Verificar se há imagem
  const hasImage = content.imageUrl && content.imageUrl.trim() !== '';
  const imagePosition = content.imagePosition || 'left';
  
  // Determinar as cores a serem usadas
  const backgroundColor = content.backgroundColor || 
    (content.style === 'primary' ? 'var(--link-color, #3b82f6)' : '#f3f4f6');
  
  const textColor = content.textColor || 
    (content.style === 'primary' ? '#ffffff' : 'var(--text-color, #333333)');
  
  return (
    <div className={`${widthClass} px-2 mb-4`}>
      <div 
        className={`h-full flex ${hasImage && imagePosition === 'top' ? 'flex-col' : 'items-center'} 
          ${hasImage && imagePosition === 'right' ? 'flex-row-reverse' : 'flex-row'} 
          border border-gray-200 rounded-lg p-4 transition-all hover:shadow-md`}
        style={{ backgroundColor }}
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
            className="inline-block px-4 py-2 rounded hover:opacity-90"
            style={{ 
              color: textColor,
              backgroundColor: backgroundColor
            }}
          >
            {content.text}
          </a>
        </div>
      </div>
    </div>
  );
};

export default LinkRenderer; 