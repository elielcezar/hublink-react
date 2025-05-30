import React from 'react';

const BannerRenderer = ({ content }) => {
  const imageElement = content.imageUrl ? (
    <img 
      src={content.imageUrl} 
      alt={content.altText || 'Banner'} 
      className="w-full h-auto rounded-lg object-cover"
      style={{ maxHeight: '500px' }}
    />
  ) : (
    <div className="w-full h-60 bg-gray-200 rounded-lg flex items-center justify-center">
      <span className="text-gray-500">Imagem do banner não definida</span>
    </div>
  );

  return (
    <div className="banner-renderer w-full mb-4">
      <div className="relative">
        {content.url ? (
          <a 
            href={content.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block"
          >
            {imageElement}
          </a>
        ) : (
          imageElement
        )}
        
        {content.caption && (
          <div className="mt-2 text-sm text-gray-600 italic">
            {content.caption}
          </div>
        )}
      </div>
    </div>
  );
};

export default BannerRenderer; 