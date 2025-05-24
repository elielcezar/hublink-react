import React from 'react';

// Função para extrair o ID do vídeo do YouTube da URL
const getYouTubeVideoId = (url) => {
  if (!url) return null;
  
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  
  return (match && match[2].length === 11) ? match[2] : null;
};

const VideoRenderer = ({ content }) => {
  const videoId = getYouTubeVideoId(content.videoUrl);
  
  const videoElement = videoId ? (
    <div className="relative w-full" style={{ paddingBottom: '56.25%' /* 16:9 aspect ratio */ }}>
      <iframe
        className="absolute top-0 left-0 w-full h-full rounded-lg"
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      ></iframe>
    </div>
  ) : (
    <div className="w-full h-60 bg-gray-200 rounded-lg flex items-center justify-center">
      <span className="text-gray-500">Link do YouTube não válido</span>
    </div>
  );

  return (
    <div className="video-renderer w-full mb-4 px-2">
      <div className="relative">
        {videoElement}
        
        {content.caption && (
          <div className="mt-2 text-sm text-gray-600 italic">
            {content.caption}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoRenderer; 