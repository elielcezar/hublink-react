import React from 'react';
import ImageUploader from '../../ImageUploader';
import { SketchPicker } from 'react-color';
import TitleField from './TitleField';

const IconForm = ({ content, onChange }) => {
  const [showOverlayColorPicker, setShowOverlayColorPicker] = React.useState(false);
  const [showTextColorPicker, setShowTextColorPicker] = React.useState(false);

  return (
    <>
      <TitleField 
        title={content.title} 
        onChange={(newTitle) => onChange({ ...content, title: newTitle })}
      />
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Texto do Ícone
        </label>
        <input
          type="text"
          value={content.text || ''}
          onChange={(e) => onChange({ ...content, text: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Texto para exibir no ícone"
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
          Imagem de Fundo
        </label>
        <ImageUploader 
          currentImageUrl={content.imageUrl} 
          onImageUpload={(imageUrl) => onChange({ ...content, imageUrl })}
        />
        <p className="mt-1 text-xs text-gray-500">
          {!content.imageUrl && "Se nenhuma imagem for selecionada, um gradiente será usado como fundo."}
        </p>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Altura do Ícone
        </label>
        <select
          value={content.height || 'medium'}
          onChange={(e) => onChange({ ...content, height: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="small">Pequeno (100px)</option>
          <option value="medium">Médio (150px)</option>
          <option value="large">Grande (200px)</option>
        </select>
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
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Cor da Sobreposição
        </label>
        <div className="flex items-center">
          <div 
            className="w-10 h-10 rounded border cursor-pointer"
            style={{ backgroundColor: content.overlayColor || 'rgba(0, 0, 0, 0.4)' }}
            onClick={() => setShowOverlayColorPicker(!showOverlayColorPicker)}
          />
          <input
            type="text"
            value={content.overlayColor || 'rgba(0, 0, 0, 0.4)'}
            onChange={(e) => onChange({ ...content, overlayColor: e.target.value })}
            className="ml-2 w-28 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="rgba(0,0,0,0.4)"
          />
        </div>
        {showOverlayColorPicker && (
          <div className="absolute z-10 mt-2">
            <div className="fixed inset-0" onClick={() => setShowOverlayColorPicker(false)} />
            <SketchPicker
              color={content.overlayColor || 'rgba(0, 0, 0, 0.4)'}
              onChange={(color) => {
                const rgba = `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.rgb.a})`;
                onChange({ ...content, overlayColor: rgba });
              }}
            />
          </div>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Esta cor escurece a imagem para melhorar a legibilidade do texto
        </p>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Cor do Texto
        </label>
        <div className="flex items-center">
          <div 
            className="w-10 h-10 rounded border cursor-pointer"
            style={{ backgroundColor: content.textColor || '#ffffff' }}
            onClick={() => setShowTextColorPicker(!showTextColorPicker)}
          />
          <input
            type="text"
            value={content.textColor || '#ffffff'}
            onChange={(e) => onChange({ ...content, textColor: e.target.value })}
            className="ml-2 w-28 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="#ffffff"
          />
        </div>
        {showTextColorPicker && (
          <div className="absolute z-10 mt-2">
            <div className="fixed inset-0" onClick={() => setShowTextColorPicker(false)} />
            <SketchPicker
              color={content.textColor || '#ffffff'}
              onChange={(color) => onChange({ ...content, textColor: color.hex })}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default IconForm; 