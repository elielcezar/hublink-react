import React from 'react';
import TitleField from './TitleField';

const VideoForm = ({ content, onChange }) => {
  return (
    <>
      <TitleField 
        title={content.title} 
        onChange={(newTitle) => onChange({ ...content, title: newTitle })}
      />
      
      <div className="mb-4 flex gap-2">
        <label className="flex items-center block text-sm font-medium text-gray-700 mb-1 w-[125px]">
          Link do YouTube
        </label>
        <input
          type="text"
          value={content.videoUrl || ''}
          onChange={(e) => onChange({ ...content, videoUrl: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="https://www.youtube.com/watch?v=..."
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Legenda (opcional)
        </label>
        <input
          type="text"
          value={content.caption || ''}
          onChange={(e) => onChange({ ...content, caption: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Descrição do vídeo"
        />
      </div>
    </>
  );
};

export default VideoForm; 