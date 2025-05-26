import React, { useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

const RichTextEditor = ({ value, onChange, placeholder = "Digite seu texto aqui...", pageStyle }) => {
  const editorRef = useRef(null);
  const quillRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && !quillRef.current) {
      // Configuração da toolbar
      const toolbarOptions = [
        [{ header: [1, 2, false] }],
        ['bold', 'italic', 'underline'],
        [{ 'align': '' }, { 'align': 'center' }, { 'align': 'right' }],
        [{ 'list': 'bullet' }],
        ['link'],
        [{ 'color': [] }],
        ['clean']
      ];

      // Inicializar o Quill
      quillRef.current = new Quill(editorRef.current, {
        theme: 'snow',
        placeholder: placeholder,
        modules: {
          toolbar: toolbarOptions
        }
      });

      // Definir valor inicial
      if (value && value.trim() !== '') {
        quillRef.current.root.innerHTML = value;
      }

      // Listener de mudança simples
      quillRef.current.on('text-change', () => {
        const html = quillRef.current.root.innerHTML;
        onChange(html);
      });
    }

    // Cleanup simples
    return () => {
      if (quillRef.current) {
        quillRef.current = null;
      }
    };
  }, []);

  // Atualizar valor quando mudar externamente
  useEffect(() => {
    if (quillRef.current && value !== undefined) {
      const currentContent = quillRef.current.root.innerHTML;
      if (currentContent !== value) {
        quillRef.current.root.innerHTML = value || '';
      }
    }
  }, [value]);

  // Função para gerar o estilo de background com base no pageStyle
  const getBackgroundStyle = () => {
    if (!pageStyle) return {};

    if (pageStyle.backgroundType === 'image' && pageStyle.backgroundImage) {
      return {
        backgroundImage: `url(${pageStyle.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      };
    } else if (pageStyle.backgroundType === 'gradient') {
      return {
        background: `linear-gradient(${pageStyle.gradientDirection || 'to right'}, ${pageStyle.gradientStartColor || '#4f46e5'}, ${pageStyle.gradientEndColor || '#818cf8'})`
      };
    } else {
      return {
        backgroundColor: pageStyle.backgroundColor || '#ffffff'
      };
    }
  };

  return (
    <div 
      className="quill-wrapper"
      style={{
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        overflow: 'hidden'
      }}
    >
      <div ref={editorRef} />
      <style>{`
        .quill-wrapper .ql-editor {
          min-height: 150px;
          font-size: 14px;
          line-height: 1.5;
          padding: 12px;
          ${pageStyle ? `
            background-color: ${pageStyle.backgroundColor || '#ffffff'};
            ${pageStyle.backgroundType === 'image' && pageStyle.backgroundImage ? `
              background-image: url(${pageStyle.backgroundImage});
              background-size: cover;
              background-position: center;
              background-repeat: no-repeat;
            ` : ''}
            ${pageStyle.backgroundType === 'gradient' ? `
              background: linear-gradient(${pageStyle.gradientDirection || 'to right'}, 
                ${pageStyle.gradientStartColor || '#4f46e5'}, 
                ${pageStyle.gradientEndColor || '#818cf8'});
            ` : ''}
          ` : ''}
        }
        
        .quill-wrapper .ql-toolbar.ql-snow {
          border: none;
          border-bottom: 1px solid #e5e7eb;
          background-color: #f9fafb;
        }
        
        .quill-wrapper .ql-container.ql-snow {
          border: none;
          font-family: inherit;
        }
        
        .quill-wrapper .ql-editor:focus {
          outline: none;
        }
        
        .quill-wrapper .ql-editor.ql-blank::before {
          font-style: italic;
          color: #9ca3af;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor; 