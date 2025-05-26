import React, { useState } from 'react';
import TitleField from './TitleField';
import { SketchPicker } from 'react-color';

const HrForm = ({ content, onChange }) => {
  const [showColorPicker, setShowColorPicker] = useState(false);

  return (
    <>
      <TitleField 
        title={content.title} 
        onChange={(newTitle) => onChange({ ...content, title: newTitle })}
      />
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Espessura da Linha
        </label>
        <input
          type="range"
          min="1"
          max="10"
          value={content.thickness || 1}
          onChange={(e) => onChange({ ...content, thickness: parseInt(e.target.value) })}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>1px</span>
          <span>10px</span>
        </div>
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
          <option value="75">75%</option>
          <option value="50">50% (Metade)</option>
          <option value="25">25%</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Cor da Linha
        </label>
        <div className="flex items-center gap-3">
          <div 
            className="h-10 w-10 rounded border cursor-pointer"
            style={{ backgroundColor: content.color || '#e5e7eb' }}
            onClick={() => setShowColorPicker(!showColorPicker)}
          />
          <input
            type="text"
            value={content.color || '#e5e7eb'}
            onChange={(e) => onChange({ ...content, color: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded text-sm w-32"
          />
        </div>
        
        {showColorPicker && (
          <div className="absolute z-10 mt-2">
            <div 
              className="fixed inset-0" 
              onClick={() => setShowColorPicker(false)}
            />
            <SketchPicker 
              color={content.color || '#e5e7eb'}
              onChange={(color) => onChange({ ...content, color: color.hex })}
            />
          </div>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Estilo da Linha
        </label>
        <select
          value={content.style || 'solid'}
          onChange={(e) => onChange({ ...content, style: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="solid">Sólida</option>
          <option value="dashed">Tracejada</option>
          <option value="dotted">Pontilhada</option>
          <option value="double">Dupla</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Margem Vertical
        </label>
        <input
          type="range"
          min="10"
          max="100"
          value={content.margin || 20}
          onChange={(e) => onChange({ ...content, margin: parseInt(e.target.value) })}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>10px</span>
          <span>100px</span>
        </div>
      </div>
    </>
  );
};

export default HrForm; 