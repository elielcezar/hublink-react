import React from 'react';
import ImageUploader from '../../ImageUploader';
import { SketchPicker } from 'react-color';
import TitleField from './TitleField';

const LinkForm = ({ content, onChange }) => {
  const [showBackgroundColorPicker, setShowBackgroundColorPicker] = React.useState(false);
  const [showTextColorPicker, setShowTextColorPicker] = React.useState(false);

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

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Largura
        </label>
        <select
          value={content.width || '100'}
          onChange={(e) => onChange({ ...content, width: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="100">100% (Largura Total)</option>
          <option value="50">50% (Metade)</option>
          <option value="33">33% (Um Terço)</option>
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
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Cor de Fundo
        </label>
        <div className="flex items-center">
          <div 
            className="w-10 h-10 rounded border cursor-pointer"
            style={{ backgroundColor: content.backgroundColor || (content.style === 'primary' ? 'var(--link-color, #3b82f6)' : '#f3f4f6') }}
            onClick={() => setShowBackgroundColorPicker(!showBackgroundColorPicker)}
          />
          <input
            type="text"
            value={content.backgroundColor || ''}
            onChange={(e) => onChange({ ...content, backgroundColor: e.target.value })}
            className="ml-2 w-28 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ex: #3b82f6"
          />
        </div>
        {showBackgroundColorPicker && (
          <div className="absolute z-10 mt-2">
            <div className="fixed inset-0" onClick={() => setShowBackgroundColorPicker(false)} />
            <SketchPicker
              color={content.backgroundColor || (content.style === 'primary' ? 'var(--link-color, #3b82f6)' : '#f3f4f6')}
              onChange={(color) => onChange({ ...content, backgroundColor: color.hex })}
            />
          </div>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Deixe em branco para usar a cor padrão do estilo selecionado
        </p>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Cor do Texto
        </label>
        <div className="flex items-center">
          <div 
            className="w-10 h-10 rounded border cursor-pointer"
            style={{ backgroundColor: content.textColor || (content.style === 'primary' ? '#ffffff' : 'var(--text-color, #333333)') }}
            onClick={() => setShowTextColorPicker(!showTextColorPicker)}
          />
          <input
            type="text"
            value={content.textColor || ''}
            onChange={(e) => onChange({ ...content, textColor: e.target.value })}
            className="ml-2 w-28 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ex: #ffffff"
          />
        </div>
        {showTextColorPicker && (
          <div className="absolute z-10 mt-2">
            <div className="fixed inset-0" onClick={() => setShowTextColorPicker(false)} />
            <SketchPicker
              color={content.textColor || (content.style === 'primary' ? '#ffffff' : 'var(--text-color, #333333)')}
              onChange={(color) => onChange({ ...content, textColor: color.hex })}
            />
          </div>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Deixe em branco para usar a cor padrão do estilo selecionado
        </p>
      </div>     
      
    </>
  );
};

export default LinkForm; 