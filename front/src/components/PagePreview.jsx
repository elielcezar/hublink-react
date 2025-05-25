import React from 'react';

// Componentes para renderização na prévia
const componentRenderers = {
  text: ({ content, pageStyle }) => <TextRenderer content={content} pageStyle={pageStyle} />,
  link: ({ content, pageStyle }) => <LinkRenderer content={content} pageStyle={pageStyle} />,
  banner: ({ content, pageStyle }) => <BannerRenderer content={content} pageStyle={pageStyle} />,
  carousel: ({ content, pageStyle }) => <CarouselRenderer content={content} pageStyle={pageStyle} />,
  social: ({ content, pageStyle }) => <SocialRenderer content={content} pageStyle={pageStyle} />,
  icon: ({ content, pageStyle }) => <IconRenderer content={content} pageStyle={pageStyle} />,
  video: ({ content, pageStyle }) => <VideoRenderer content={content} pageStyle={pageStyle} />
};

// Importar os renderers
import CarouselRenderer from './editor/renderers/CarouselRenderer';
import LinkRenderer from './editor/renderers/LinkRenderer';
import SocialRenderer from './editor/renderers/SocialRenderer';
import BannerRenderer from './editor/renderers/BannerRenderer';
import IconRenderer from './editor/renderers/IconRenderer';
import TextRenderer from './editor/renderers/TextRenderer';
import VideoRenderer from './editor/renderers/VideoRenderer';

import '../styles/preview.css';

const defaultStyle = {
  backgroundColor: '#ffffff',
  fontFamily: 'Inter, sans-serif',
  linkColor: '#3b82f6',
  linkBackgroundColor: '#3b82f6',
  linkTextColor: '#ffffff',
  linkShadowColor: '#000000',
  linkShadowIntensity: 4,
  linkShadowBlur: 4,
  linkShadowOpacity: 20,
  linkBorderRadius: 8,
  textColor: '#333333',
  backgroundImage: null,
  logo: null,
  backgroundType: 'color',
  gradientStartColor: '#4f46e5',
  gradientEndColor: '#818cf8',
  gradientDirection: 'to right'
};

const getBackgroundStyle = (pageStyle) => {
  const style = pageStyle || defaultStyle;
  
  switch (style.backgroundType) {
    case 'gradient':
      return {
        background: `linear-gradient(${style.gradientDirection || 'to right'}, ${style.gradientStartColor || '#4f46e5'}, ${style.gradientEndColor || '#818cf8'})`
      };
    case 'image':
      return {
        backgroundImage: style.backgroundImage ? `url(${style.backgroundImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      };
    case 'color':
    default:
      return {
        backgroundColor: style.backgroundColor || '#ffffff'
      };
  }
};

const PagePreview = ({ components = [], pageStyle = defaultStyle }) => {
  return (
    <>
      <div 
        id="page-preview-container"
        className="bg-gray-50 border-[12px] border-black rounded-[30px] w-[300px] h-[600px] overflow-hidden mx-auto max-h-[80vh]"
        style={{
          ...getBackgroundStyle(pageStyle),
          fontFamily: pageStyle?.fontFamily || defaultStyle.fontFamily,
          //color: pageStyle?.textColor || defaultStyle.textColor
          //color: defaultStyle.textColor
        }}
      >
        <div className="preview-content h-full py-6 px-3 overflow-y-auto overflow-x-hidden">
          {pageStyle?.logo && (
            <header className="text-center mb-6">
              <div className="flex justify-center">
                <img 
                  src={pageStyle.logo} 
                  alt="Logo" 
                  className="logo max-h-36 object-contain rounded-full"
                />
              </div>
            </header>
          )}
          
          <main>
          {(() => {
            const rows = [];
            let currentRow = [];
            let currentRowWidth = 0;

            components.forEach((component, index) => {
              const isLink = component.type === 'link';
              const width = isLink ? parseInt(component.content?.width || '100') : 100;

              if (width === 100 || !isLink) {
                // Finalizar linha atual se houver
                if (currentRow.length > 0) {
                  rows.push(currentRow);
                  currentRow = [];
                  currentRowWidth = 0;
                }
                // Adicionar componente em linha própria
                rows.push([component]);
              } else {
                // Verificar se cabe na linha atual
                if (currentRowWidth + width <= 100) {
                  currentRow.push(component);
                  currentRowWidth += width;
                  
                  // Se chegou a 100% ou é o último componente, finalizar linha
                  if (currentRowWidth === 100 || index === components.length - 1) {
                    rows.push(currentRow);
                    currentRow = [];
                    currentRowWidth = 0;
                  }
                } else {
                  // Não cabe, finalizar linha atual e começar nova
                  if (currentRow.length > 0) {
                    rows.push(currentRow);
                  }
                  currentRow = [component];
                  currentRowWidth = width;
                }
              }
            });

            // Finalizar última linha se houver
            if (currentRow.length > 0) {
              rows.push(currentRow);
            }

            return rows.map((row, rowIndex) => (
              <div key={rowIndex} className={row.length > 1 ? "mb-4 w-full" : "mb-4 w-full"}>
                {row.map((component) => 
                  componentRenderers[component.type]({ 
                    content: component.content, 
                    pageStyle: pageStyle 
                  })
                )}
              </div>
            ));
          })()}
        </main>

        </div>
      </div>
    </>
  );
};

export default PagePreview; 