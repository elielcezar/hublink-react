import React from 'react';

const HrRenderer = ({ content }) => {
  const style = {
    border: 'none',
    height: `${content.thickness || 1}px`,
    backgroundColor: content.color || '#e5e7eb',
    width: `${content.width || 100}%`,
    margin: `${content.margin || 20}px auto`,   
  };

  return (
    <hr style={style} />
  );
};

export default HrRenderer; 