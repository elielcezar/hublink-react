import React from 'react';

const TitleField = ({ title, onChange }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Título do Componente
      </label>
      <input
        type="text"
        value={title || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        placeholder="Digite um título para identificar este componente"
      />
      <p className="mt-1 text-xs text-gray-500">
        Este título ajuda a identificar o componente no editor e não é exibido na página.
      </p>
    </div>
  );
};

export default TitleField; 