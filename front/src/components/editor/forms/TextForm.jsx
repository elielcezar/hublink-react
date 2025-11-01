import React from 'react';
import TitleField from './TitleField';
import RichTextEditor from './RichTextEditor';

const TextForm = ({ content, onChange, pageStyle }) => {
  return (
    <>
      <TitleField 
        title={content.title} 
        onChange={(newTitle) => onChange({ ...content, title: newTitle })}
      />
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Conteúdo HTML
        </label>
        <RichTextEditor
          value={content.text}
          onChange={(newText) => onChange({ ...content, text: newText })}
          placeholder="Digite seu conteúdo aqui..."
          pageStyle={pageStyle}
        />
        <p className="mt-1 text-xs text-gray-500">
          Você pode usar tags HTML para formatar o texto.
        </p>
      </div>
    </>
  );
};

export default TextForm; 