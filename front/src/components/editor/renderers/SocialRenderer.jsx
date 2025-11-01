import React from 'react';
import { FaInstagram, FaYoutube, FaTiktok, FaSpotify, FaWhatsapp, FaFacebook, FaLinkedin } from 'react-icons/fa';
import KawaiIcon from '../../KawaiIcon';
import XIcon from '../../XIcon';

const SocialRenderer = ({ content }) => {
  const iconColor = content.iconColor || '#0077B5';
  
  const socialLinks = [
    { type: 'tiktok', url: content.tiktok, icon: <FaTiktok size={30} style={{color: iconColor}} /> },    
    { type: 'kwai', url: content.kwai, icon: <KawaiIcon color={iconColor} size={30} /> },
    { type: 'whatsapp', url: content.whatsapp, icon: <FaWhatsapp size={30} style={{color: iconColor}} /> },
    { type: 'instagram', url: content.instagram, icon: <FaInstagram size={30} style={{color: iconColor}} /> },
    { type: 'youtube', url: content.youtube, icon: <FaYoutube size={30} style={{color: iconColor}} /> },
    { type: 'linkedin', url: content.linkedin, icon: <FaLinkedin size={30} style={{color: iconColor}} /> },
    { type: 'x', url: content.x, icon: <XIcon color={iconColor} size={30} /> },
    { type: 'spotify', url: content.spotify, icon: <FaSpotify size={30} style={{color: iconColor}} /> },
    { type: 'facebook', url: content.facebook, icon: <FaFacebook size={30} style={{color: iconColor}} /> }    
  ];
  
  const availableSocialLinks = socialLinks.filter(link => link.url);
  
  return (
    <div className="social-renderer w-full px-2 mb-4">      
      
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