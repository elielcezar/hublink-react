import React, { useState } from 'react';
import { FaInstagram, FaTwitter, FaYoutube, FaTiktok, FaSpotify } from 'react-icons/fa';
import TitleField from './TitleField';
import { SketchPicker } from 'react-color';

// Componente de ícone personalizado para o Kwai
const KwaiIcon = ({ className = "" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="1em" 
    height="1em" 
    viewBox="0 0 24 24" 
    fill="none"
    className={className}
  >
    <path 
      d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2ZM16.5 8.5L14.5 10.5L12.5 8.5L10.5 10.5L8.5 8.5V15.5L10.5 13.5L12.5 15.5L14.5 13.5L16.5 15.5V8.5Z" 
      fill="currentColor"
    />
  </svg>
);

const SocialForm = ({ content, onChange }) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  
  const handleChange = (key, value) => {
    onChange({
      ...content,
      [key]: value
    });
  };

  const socialNetworks = [
    { key: 'instagram', label: 'Instagram', icon: <FaInstagram className="text-pink-600" /> },
    { key: 'x', label: 'X (Twitter)', icon: <FaTwitter className="text-blue-400" /> },
    { key: 'youtube', label: 'YouTube', icon: <FaYoutube className="text-red-600" /> },
    { key: 'tiktok', label: 'TikTok', icon: <FaTiktok className="text-black" /> },
    { key: 'spotify', label: 'Spotify', icon: <FaSpotify className="text-green-600" /> },
    { key: 'kwai', label: 'Kwai', icon: <KwaiIcon className="text-red-500" /> }
  ];

  return (
    <div className="space-y-4">
      <TitleField 
        title={content.title} 
        onChange={(newTitle) => onChange({ ...content, title: newTitle })}
      />
      
      {socialNetworks.map(({ key, label, icon }) => (
        <div key={key} className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
            <span className="mr-2">{icon}</span> {label}
          </label>
          <input
            type="url"
            value={content[key] || ''}
            onChange={(e) => handleChange(key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder={`URL do seu perfil no ${label}`}
          />
        </div>
      ))}
      
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Cor dos Ícones
        </label>
        <div className="flex items-center gap-3">
          <div 
            className="h-10 w-10 rounded border cursor-pointer"
            style={{ backgroundColor: content.iconColor || '#0077B5' }}
            onClick={() => setShowColorPicker(!showColorPicker)}
          ></div>
          <input
            type="text"
            value={content.iconColor || '#0077B5'}
            onChange={(e) => handleChange('iconColor', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded text-sm w-32"
          />
        </div>
        
        {showColorPicker && (
          <div className="absolute z-10 mt-2 bottom-20 left-4">
            <div 
              className="fixed inset-0" 
              onClick={() => setShowColorPicker(false)}
            ></div>
            <SketchPicker 
              color={content.iconColor || '#0077B5'} 
              onChange={(color) => handleChange('iconColor', color.hex)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialForm; 