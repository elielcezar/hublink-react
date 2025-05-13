import React from 'react';
import { FaInstagram, FaTwitter, FaYoutube, FaTiktok, FaSpotify } from 'react-icons/fa';

// Componente de ícone personalizado para o Kwai
const KwaiIcon = ({ color, size = 30 }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none"
    style={{ color }}
  >
    <path 
      d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2ZM16.5 8.5L14.5 10.5L12.5 8.5L10.5 10.5L8.5 8.5V15.5L10.5 13.5L12.5 15.5L14.5 13.5L16.5 15.5V8.5Z" 
      fill="currentColor"
    />
  </svg>
);

const SocialRenderer = ({ content }) => {
  const iconColor = content.iconColor || '#0077B5';
  
  const socialLinks = [
    { type: 'instagram', url: content.instagram, icon: <FaInstagram size={30} style={{color: iconColor}} /> },
    { type: 'x', url: content.x, icon: <FaTwitter size={30} style={{color: iconColor}} /> },
    { type: 'youtube', url: content.youtube, icon: <FaYoutube size={30} style={{color: iconColor}} /> },
    { type: 'tiktok', url: content.tiktok, icon: <FaTiktok size={30} style={{color: iconColor}} /> },    
    { type: 'spotify', url: content.spotify, icon: <FaSpotify size={30} style={{color: iconColor}} /> },    
    { type: 'kwai', url: content.kwai, icon: <KwaiIcon color={iconColor} /> }
  ];
  
  const availableSocialLinks = socialLinks.filter(link => link.url);
  
  return (
    <div className="social-renderer w-full px-2 mb-6">      
      
      <div className="flex flex-wrap justify-center gap-4">
        {availableSocialLinks.map((link, index) => (
          <a
            key={index}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-transform hover:scale-110"
            aria-label={`Link para ${link.type}`}
          >
            {link.icon}
          </a>
        ))}
        
        {availableSocialLinks.length === 0 && (
          <p className="text-gray-500 text-sm">Nenhuma rede social configurada</p>
        )}
      </div>
    </div>
  );
};

export default SocialRenderer; 