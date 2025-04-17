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

  console.log(content);

  //Verificar se há texto
  const hasText = content.text && content.text.trim() !== '';
  
  // Verificar se há imagem
  const hasImage = content.imageUrl && content.imageUrl.trim() !== '';
  const imagePosition = content.imagePosition || 'left';
  
  // Determinar as cores a serem usadas
  const backgroundColor = content.backgroundColor || 
    (content.style === 'primary' ? 'var(--link-color, #3b82f6)' : '#f3f4f6');
  
  const textColor = content.textColor || 
    (content.style === 'primary' ? '#ffffff' : 'var(--text-color, #333333)');
  
  return (
    <div className={`${widthClass} mb-4 px-1`}>
      <div 
        className={`h-full flex 
          ${hasImage && imagePosition === 'top' ? 'flex-col' : 'items-center'} 
          ${hasImage && imagePosition === 'right' ? 'flex-row-reverse' : 'flex-row'} 
          ${!hasText ? 'flex items-center justify-center' : null}
          rounded-lg transition-all hover:shadow-md p-1`}
        style={{ backgroundColor }}
      >
        
        {hasImage && (
          <div className={`
            ${imagePosition === 'top' ? 'w-full' : 'flex-shrink-0'} 
          `}>
            <img 
              src={content.imageUrl} 
              alt="" 
              className={`${imagePosition === 'left' ? 'w-[5vw]' : null} w-full h-auto rounded-lg`}
            />
          </div>
        )}



        {hasText && (
          <div className={`text-center w-full ${imagePosition === 'top' ? 'mt-2 mb-1' : null} `}>
            <a 
              href={content.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block hover:opacity-90 font-bold"
              style={{ 
                color: textColor,
                backgroundColor: backgroundColor
              }}
            >
              {content.text}
            </a>
          </div>          
        )}

      </div>
    </div>
  );
};

export default LinkRenderer; 