import React from 'react';
import '../../../styles/renderer.css';


const TextRenderer = ({ content }) => {
  return (
    <div className="text-renderer prose max-w-none mb-4" dangerouslySetInnerHTML={{ __html: content.text }} />
  );
};

export default TextRenderer; 