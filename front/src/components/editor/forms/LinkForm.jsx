import React from 'react';
import ImageUploader from './ImageUploader';
import TitleField from './TitleField';

const LinkForm = ({ content, onChange }) => {
  return (
    <>
      <TitleField 
        title={content.title} 
        onChange={(newTitle) => onChange({ ...content, title: newTitle })}
      />
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Texto do Link
        </label>
        <input
          type="text"
          value={content.text || ''}
          onChange={(e) => onChange({ ...content, text: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Texto para exibir no link"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          URL
        </label>
        <input
          type="url"
          value={content.url || ''}
          onChange={(e) => onChange({ ...content, url: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="https://example.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Largura do Link
        </label>
        <select
          value={content.width || '100'}
          onChange={(e) => onChange({ ...content, width: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="100">Largura completa (100%)</option>
          <option value="50">Meia largura (50%)</option>
          <option value="33">Um terço da largura (33%)</option>
        </select>
      </div>

      {content.imageUrl && content.imageUrl.trim() !== '' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Posição da Imagem
          </label>
          <select
            value={content.imagePosition || 'left'}
            onChange={(e) => onChange({ ...content, imagePosition: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="left">Esquerda</option>
            <option value="right">Direita</option>
            <option value="top">Topo</option>
          </select>
        </div>
      )}
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Imagem (Opcional)
        </label>
        <ImageUploader 
          onImageUpload={(imageUrl) => onChange({ ...content, imageUrl })}
          currentImage={content.imageUrl || ''} 
        />
      </div>     
      
    </>
  );
};

export default LinkForm; 