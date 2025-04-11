import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiX } from 'react-icons/fi';

const ImageUploader = ({ onImageUpload, currentImage = '' }) => {
  const [image, setImage] = useState(currentImage);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = async (acceptedFiles) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append('images', acceptedFiles[0]);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erro ao fazer upload da imagem');
      }

      const data = await response.json();
      setImage(data.urls[0]);
      onImageUpload(data.urls[0]);
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao fazer upload da imagem');
    } finally {
      setIsUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    multiple: false
  });

  const removeImage = () => {
    setImage('');
    onImageUpload('');
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-500'}`}
      >
        <input {...getInputProps()} />
        <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          {isDragActive
            ? 'Solte a imagem aqui...'
            : 'Arraste e solte uma imagem aqui, ou clique para selecionar'}
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Suporta JPEG, PNG, GIF
        </p>
      </div>

      {isUploading && (
        <div className="text-center text-sm text-gray-600">
          Fazendo upload da imagem...
        </div>
      )}

      {image && (
        <div className="relative group">
          <img
            src={image}
            alt="Upload"
            className="w-full h-32 object-cover rounded-lg"
          />
          <button
            type="button"
            onClick={removeImage}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUploader; 