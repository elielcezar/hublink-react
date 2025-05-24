import React, { useState } from 'react';
import { FaInstagram, FaTwitter, FaYoutube, FaTiktok, FaSpotify, FaWhatsapp, FaFacebook } from 'react-icons/fa';
import TitleField from './TitleField';
import { SketchPicker } from 'react-color';
import KawaiIcon from '../../KawaiIcon';
import XIcon from '../../XIcon';

const SocialForm = ({ content, onChange }) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  
  const handleChange = (key, value) => {
    onChange({
      ...content,
      [key]: value
    });
  };

  const socialNetworks = [
    { key: 'whatsapp', label: 'Whatsapp', icon: <FaWhatsapp className="text-green-600" size={24}/> },
    { key: 'facebook', label: 'Facebook', icon: <FaFacebook className="text-blue-600" size={24}/> },
    { key: 'instagram', label: 'Instagram', icon: <FaInstagram className="text-pink-600" size={24}/> },
    { key: 'x', label: 'X (Twitter)', icon: <XIcon color="#000000" size={24}/> },
    { key: 'youtube', label: 'YouTube', icon: <FaYoutube className="text-red-600" size={24}/> },
    { key: 'tiktok', label: 'TikTok', icon: <FaTiktok className="text-black" size={24}/> },
    { key: 'spotify', label: 'Spotify', icon: <FaSpotify className="text-green-600" size={24}/> },
    { key: 'kwai', label: 'Kwai', icon: <KawaiIcon color="#ff7e00" size={24} /> }
  ];

  return (
    <div className="space-y-4">
      <TitleField 
        title={content.title} 
        onChange={(newTitle) => onChange({ ...content, title: newTitle })}
      />

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
      
      {socialNetworks.map(({ key, label, icon }) => (
        <div key={key} className="flex gap-2 mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center w-[125px]">
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
      
    </div>
  );
};

export default SocialForm; 