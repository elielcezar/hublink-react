import React from 'react';
import ImageUploader from './ImageUploader';
import TitleField from './TitleField';

const BannerForm = ({ content, onChange }) => {
  return (
    <>
      <TitleField 
        title={content.title} 
        onChange={(newTitle) => onChange({ ...content, title: newTitle })}
      />
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Imagem do Banner
        </label>      
        <ImageUploader 
          onImageUpload={(imageUrl) => onChange({ ...content, imageUrl })}
          currentImage={content.imageUrl || ''} 
        />
      </div>
      
      <div className="mb-4 flex gap-2">
        <label className="flex items-center block text-sm font-medium text-gray-700 mb-1 w-[125px]">
          Link (URL)
        </label>
        <input
          type="text"
          value={content.url || ''}
          onChange={(e) => onChange({ ...content, url: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="https://"
        />
      </div>     
      
    </>
  );
};

export default BannerForm; 