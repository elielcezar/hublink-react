import React from 'react';

const TextRenderer = ({ content }) => {
  return (
    <div className="prose max-w-none mb-4" dangerouslySetInnerHTML={{ __html: content.text }} />
  );
};

export default TextRenderer; 