import React from 'react';
import { FaInstagram, FaTwitter, FaYoutube, FaTiktok, FaSpotify } from 'react-icons/fa';

const SocialRenderer = ({ content }) => {
  const networks = [
    { key: 'instagram', icon: FaInstagram, color: 'text-pink-600', label: 'Instagram' },
    { key: 'x', icon: FaTwitter, color: 'text-blue-500', label: 'X (Twitter)' },
    { key: 'youtube', icon: FaYoutube, color: 'text-red-600', label: 'Youtube' },
    { key: 'tiktok', icon: FaTiktok, color: 'text-black', label: 'TikTok' },
    { key: 'spotify', icon: FaSpotify, color: 'text-green-600', label: 'Spotify' }
  ];

  // Filtrar apenas as redes sociais que têm um link definido
  const activeNetworks = networks.filter(network => content[network.key]);

  return (
    <div className="w-full px-2 mb-6">
      <div className="flex flex-wrap justify-center gap-4">
        {activeNetworks.map(network => {
          const Icon = network.icon;
          return (
            <a
              key={network.key}
              href={content[network.key]}
              target="_blank"
              rel="noopener noreferrer"
              className={`${network.color} hover:opacity-80 text-3xl mx-2`}
              title={network.label}
            >
              <Icon />
            </a>
          );
        })}
        
        {activeNetworks.length === 0 && (
          <p className="text-gray-400 text-sm">Nenhuma rede social configurada</p>
        )}
      </div>
    </div>
  );
};

export default SocialRenderer; 