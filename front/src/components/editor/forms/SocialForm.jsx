import React from 'react';
import { FaInstagram, FaTwitter, FaYoutube, FaTiktok, FaSpotify } from 'react-icons/fa';
import TitleField from './TitleField';

const SocialForm = ({ content, onChange }) => {
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
    { key: 'spotify', label: 'Spotify', icon: <FaSpotify className="text-green-600" /> }
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
    </div>
  );
};

export default SocialForm; 