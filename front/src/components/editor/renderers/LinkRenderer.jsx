import React from 'react';

const LinkRenderer = ({ content, pageStyle }) => {
  if (!content) return null;

  const {
    text = 'Link',
    url = '#',
    imageUrl,
    imagePosition = 'left',
    width = '100'
  } = content;

  // PRIORIZAR cores globais do pageStyle sobre cores específicas do content
  const backgroundColor = pageStyle?.linkBackgroundColor || content.backgroundColor || '#3b82f6';
  
  // Para a cor do texto: usar linkTextColor se definida, senão usar textColor geral, senão usar branco como fallback
  const textColor = pageStyle?.linkTextColor || pageStyle?.textColor || content.textColor || '#ffffff';
  
  // Propriedades de design mais avançadas
  const shadowColor = pageStyle?.linkShadowColor || '#000000';
  const shadowIntensity = pageStyle?.linkShadowIntensity !== undefined ? pageStyle.linkShadowIntensity : 5;
  const shadowBlur = pageStyle?.linkShadowBlur !== undefined ? pageStyle.linkShadowBlur : 5;
  const shadowOpacity = pageStyle?.linkShadowOpacity !== undefined ? pageStyle.linkShadowOpacity : 20;
  const borderRadius = pageStyle?.linkBorderRadius !== undefined ? pageStyle.linkBorderRadius : 5;

  // Propriedades de texto do pageStyle
  const fontFamily = pageStyle?.fontFamily || 'Inter, sans-serif';
  const fontSize = pageStyle?.fontSize !== undefined ? pageStyle.fontSize : 16;
  
  // Converter fontWeight para valores numéricos
  const getFontWeight = () => {
    const weight = pageStyle?.fontWeight || 'normal';
    if (weight === 'bold') return '700';
    if (weight === 'normal') return '400';
    return weight; // Se já for um número, manter como está
  };
  const fontWeight = getFontWeight();

  // Estilos do container baseado na largura
  const containerStyle = {
    width: width === '100' ? '100%' : width === '50' ? '50%' : width === '33' ? '33.33%' : '100%',
    display: 'inline-block',
    verticalAlign: 'top',
    paddingLeft: width !== '100' ? '4px' : '0',
    paddingRight: width !== '100' ? '4px' : '0'
  };

  // Função para renderizar o conteúdo do link
  const renderLinkContent = () => {

    const textElement = (
      <p className="w-full leading-tight min-h-10 flex items-center justify-center">
        {text}
      </p>
    );

    if (!imageUrl) {
      return (
        <>
          {textElement}
        </>
      );
    }   

    if (imagePosition === 'top') {
      return (
        <div className="flex flex-col items-center space-y-2 px-4">
          <img 
            src={imageUrl} 
            alt={text}
            className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
          />
          <p className="w-full leading-tight min-h-14 sm:min-h-10 flex items-center justify-center">
            {text}
          </p>
        </div>
      );
    } else if (imagePosition === 'right') {
      return (
        <div className="flex items-center justify-between space-x-3">
          <img 
            src={imageUrl} 
            alt={text}
            className="w-10 h-10 object-cover rounded-lg flex-shrink-0"
          />
          {textElement}
        </div>
      );
    } else {
      // Default: left
      return (
        <div className="flex items-center space-x-3">
          <img 
            src={imageUrl} 
            alt={text}
            className="w-10 h-10 object-cover rounded-lg flex-shrink-0"
          />
          <p className="w-[calc(100%-7rem)] leading-tight min-h-10 flex items-center justify-center">
            {text}
          </p>
        </div>
      );
    }
  };

  // Criar o estilo da sombra dinamicamente com controle de blur e opacidade
  const getShadowStyle = () => {
    if (shadowIntensity === 0) return 'none';
    
    const offsetY = Math.ceil(shadowIntensity / 2);
    const opacity = shadowOpacity / 100;
    
    const hex = shadowColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    return `0 ${offsetY}px ${shadowBlur}px rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  return (
    <div style={containerStyle} className={`link-renderer width-${width}`}>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="min-h-14 block w-full p-2 text-center transition-all duration-200 hover:opacity-90 active:scale-95"
        style={{
          backgroundColor: backgroundColor,
          color: textColor,
          borderRadius: `${borderRadius}px`,
          boxShadow: getShadowStyle(),
          fontFamily: fontFamily,
          fontSize: `${fontSize}px`,
          fontWeight: fontWeight
        }}
      >
        {renderLinkContent()}
      </a>
    </div>
  );
};

export default LinkRenderer; 