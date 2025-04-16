import React, { useState, useEffect } from 'react';
import ImageUploader from '../../ImageUploader';
import TitleField from './TitleField';

const CarouselForm = ({ content, onChange }) => {
  const [images, setImages] = useState(content.images || []);
  const [config, setConfig] = useState(content.config || {
    slidesPerView: 1,
    showNavigation: true,
    showPagination: true,
    spaceBetween: 30,
    loop: true,
    autoplay: false,
    autoplayDelay: 3000,
    pauseOnHover: true
  });

  // Atualiza o componente pai quando as imagens ou configuração mudam
  useEffect(() => {
    onChange({
      ...content,
      images,
      config
    });
  }, [images, config]);

  const handleConfigChange = (key, value) => {
    setConfig({
      ...config,
      [key]: value
    });
  };

  const addImage = () => {
    setImages([...images, { url: '', link: '' }]);
  };

  const updateImage = (index, field, value) => {
    const newImages = [...images];
    newImages[index] = { ...newImages[index], [field]: value };
    setImages(newImages);
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <>
      <TitleField 
        title={content.title} 
        onChange={(newTitle) => onChange({ ...content, title: newTitle })}
      />
      
      <div className="space-y-4">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Slides por visualização
          </label>
          <input
            type="number"
            min="1"
            max="5"
            value={config.slidesPerView}
            onChange={(e) => handleConfigChange('slidesPerView', parseInt(e.target.value))}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Espaço entre slides (px)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={config.spaceBetween}
            onChange={(e) => handleConfigChange('spaceBetween', parseInt(e.target.value))}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div className="mb-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="showNavigation"
              checked={config.showNavigation}
              onChange={(e) => handleConfigChange('showNavigation', e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="showNavigation" className="ml-2 block text-sm text-gray-700">
              Mostrar navegação
            </label>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="showPagination"
              checked={config.showPagination}
              onChange={(e) => handleConfigChange('showPagination', e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="showPagination" className="ml-2 block text-sm text-gray-700">
              Mostrar paginação
            </label>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="loop"
              checked={config.loop}
              onChange={(e) => handleConfigChange('loop', e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="loop" className="ml-2 block text-sm text-gray-700">
              Loop infinito
            </label>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="autoplay"
              checked={config.autoplay}
              onChange={(e) => handleConfigChange('autoplay', e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="autoplay" className="ml-2 block text-sm text-gray-700">
              Autoplay
            </label>
          </div>
        </div>

        {config.autoplay && (
          <div className="ml-6 space-y-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tempo entre slides (ms)
              </label>
              <input
                type="number"
                min="1000"
                max="10000"
                step="500"
                value={config.autoplayDelay}
                onChange={(e) => handleConfigChange('autoplayDelay', parseInt(e.target.value))}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div className="mb-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="pauseOnHover"
                  checked={config.pauseOnHover}
                  onChange={(e) => handleConfigChange('pauseOnHover', e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="pauseOnHover" className="ml-2 block text-sm text-gray-700">
                  Pausar ao passar o mouse
                </label>
              </div>
            </div>
          </div>
        )}

        <h3 className="font-medium text-gray-800 mt-6 mb-3">Imagens do Carrossel</h3>
        
        <button
          type="button"
          onClick={addImage}
          className="px-3 py-2 text-sm border border-blue-500 rounded text-blue-500 hover:bg-blue-50"
        >
          Adicionar Imagem
        </button>

        {images.map((image, index) => (
          <div key={index} className="mt-4 p-3 border border-gray-200 rounded-md">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium">Imagem {index + 1}</h4>
              <button 
                type="button" 
                onClick={() => removeImage(index)}
                className="text-red-500 hover:text-red-700"
              >
                Remover
              </button>
            </div>
            
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL da Imagem
              </label>
              <ImageUploader 
                currentImageUrl={image.url} 
                onImageUpload={(url) => updateImage(index, 'url', url)}
              />
            </div>
            
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Link (Opcional)
              </label>
              <input
                type="url"
                value={image.link || ''}
                onChange={(e) => updateImage(index, 'link', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com"
              />
            </div>
          </div>
        ))}

        {images.length === 0 && (
          <p className="mt-2 text-sm text-gray-500">
            Nenhuma imagem adicionada. Clique em "Adicionar Imagem" para começar.
          </p>
        )}
      </div>
    </>
  );
};

export default CarouselForm; 