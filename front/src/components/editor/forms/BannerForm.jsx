import React from 'react';
import ImageUploader from '../../ImageUploader';
import TitleField from './TitleField';

const BannerForm = ({ content, onChange }) => {
  return (
    <>
      <TitleField 
        title={content.title} 
        onChange={(newTitle) => onChange({ ...content, title: newTitle })}
      />
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Imagem do Banner
        </label>
        <ImageUploader 
          currentImageUrl={content.imageUrl} 
          onImageUpload={(imageUrl) => onChange({ ...content, imageUrl })}
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Texto Alternativo
        </label>
        <input
          type="text"
          value={content.altText || ''}
          onChange={(e) => onChange({ ...content, altText: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Descrição da imagem"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Legenda
        </label>
        <input
          type="text"
          value={content.caption || ''}
          onChange={(e) => onChange({ ...content, caption: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Legenda opcional para a imagem"
        />
      </div>
    </>
  );
};

export default BannerForm; 