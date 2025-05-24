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
        className="bg-gray-50 border-[12px] border-black rounded-[30px] w-[300px] h-[600px] overflow-hidden mx-auto"
        style={{
          ...getBackgroundStyle(pageStyle),
          fontFamily: pageStyle?.fontFamily || defaultStyle.fontFamily,
          color: pageStyle?.textColor || defaultStyle.textColor
        }}
      >
        <div className="preview-content h-full py-6 px-3 overflow-y-auto overflow-x-hidden">
          {pageStyle?.logo && (
            <header className="text-center mb-6">
              <div className="flex justify-center">
                <img 
                  src={pageStyle.logo} 
                  alt="Logo" 
                  className="max-h-36 object-contain"
                />
              </div>
            </header>
          )}
          
          <div className="flex flex-col">
            {components
              .filter(component => !component.toDelete)
              .map((component) => (
                <div key={component.id} className="mb-4 w-full">
                  {componentRenderers[component.type]({ 
                    content: component.content, 
                    pageStyle: pageStyle || defaultStyle 
                  })}
                </div>
              ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default PagePreview; 