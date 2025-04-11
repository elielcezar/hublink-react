import React from 'react';
import ImageUploader from '../../ImageUploader';

const LinkForm = ({ content, onChange }) => {
  return (
    <>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Estilo
        </label>
        <select
          value={content.styleType || 'button'}
          onChange={(e) => onChange({ ...content, styleType: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="button">Botão</option>
          <option value="icon">Ícone</option>
        </select>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Texto do Link
        </label>
        <input
          type="text"
          value={content.text}
          onChange={(e) => onChange({ ...content, text: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Clique aqui"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          URL
        </label>
        <input
          type="url"
          value={content.url}
          onChange={(e) => onChange({ ...content, url: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="https://exemplo.com"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Largura
        </label>
        <select
          value={content.width || '100'}
          onChange={(e) => onChange({ ...content, width: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="100">100% (Ocupar linha inteira)</option>
          <option value="50">50% (Metade da linha)</option>
          <option value="33">33% (Um terço da linha)</option>
        </select>
      </div>
      
      {content.styleType !== 'icon' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cor do Botão
          </label>
          <select
            value={content.style}
            onChange={(e) => onChange({ ...content, style: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="primary">Primário</option>
            <option value="secondary">Secundário</option>
          </select>
        </div>
      )}
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Imagem
        </label>
        <ImageUploader 
          currentImage={content.imageUrl} 
          onImageUpload={(imageUrl) => onChange({ ...content, imageUrl })}
        />
        {content.styleType === 'icon' && content.imageUrl && (
          <p className="mt-1 text-xs text-gray-500">
            Esta imagem será usada como fundo do ícone.
          </p>
        )}
      </div>
      
      {content.imageUrl && content.styleType !== 'icon' && (
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
    </>
  );
};

export default LinkForm; 