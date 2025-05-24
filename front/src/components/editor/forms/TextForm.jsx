import React, { useEffect } from 'react';
import TitleField from './TitleField';

// Importações do Lexical
import { $getRoot, $getSelection, $isRangeSelection, $createParagraphNode, $createTextNode } from 'lexical';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { 
  FORMAT_TEXT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  FORMAT_ELEMENT_COMMAND,
} from 'lexical';
import { TOGGLE_LINK_COMMAND, LinkNode } from '@lexical/link';
import { INSERT_UNORDERED_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND, ListNode, ListItemNode } from '@lexical/list';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { 
  FaBold, 
  FaItalic, 
  FaUnderline, 
  FaStrikethrough,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaListUl,
  FaListOl,
  FaLink,
  FaUndo,
  FaRedo
} from 'react-icons/fa';

// Configuração do tema
const theme = {
  paragraph: 'mb-2',
  text: {
    bold: 'font-bold',
    italic: 'italic',
    underline: 'underline',
    strikethrough: 'line-through',
  },
  link: 'text-blue-600 underline hover:text-blue-800 cursor-pointer',
  list: {
    nested: {
      listitem: 'list-none',
    },
    ol: 'list-decimal list-inside ml-4',
    ul: 'list-disc list-inside ml-4',
    listitem: 'mb-1',
  },
};

// Plugin para capturar mudanças
function MyOnChangePlugin({ onChange }) {
  const [editor] = useLexicalComposerContext();
  
  return (
    <OnChangePlugin
      onChange={() => {
        editor.update(() => {
          const htmlString = $generateHtmlFromNodes(editor, null);
          onChange(htmlString);
        });
      }}
    />
  );
}

// Plugin para carregar conteúdo inicial
function InitialContentPlugin({ initialContent }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (initialContent && initialContent.trim() !== '') {
      editor.update(() => {
        try {
          const parser = new DOMParser();
          const dom = parser.parseFromString(`<div>${initialContent}</div>`, 'text/html');
          const nodes = $generateNodesFromDOM(editor, dom.body.firstChild);
          
          const root = $getRoot();
          root.clear();
          
          // Filtrar apenas nós válidos (elementos e decoradores)
          const validNodes = nodes.filter(node => 
            node.getType() === 'paragraph' || 
            node.getType() === 'list' ||
            node.getType() === 'listitem' ||
            node.getType() === 'heading'
          );
          
          if (validNodes.length > 0) {
            root.append(...validNodes);
          } else {
            // Se não há nós válidos, criar um parágrafo com o conteúdo
            const paragraph = $createParagraphNode();
            paragraph.append($createTextNode(initialContent.replace(/<[^>]*>/g, '')));
            root.append(paragraph);
          }
        } catch (error) {
          console.warn('Erro ao carregar conteúdo inicial:', error);
          // Fallback: criar parágrafo simples
          const root = $getRoot();
          root.clear();
          const paragraph = $createParagraphNode();
          paragraph.append($createTextNode(initialContent.replace(/<[^>]*>/g, '')));
          root.append(paragraph);
        }
      });
    }
  }, [editor, initialContent]);

  return null;
}

// Barra de ferramentas completa
function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();

  const formatText = (format) => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };

  const formatAlignment = (alignment) => {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, alignment);
  };

  const insertList = (listType) => {
    if (listType === 'ul') {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    }
  };

  const insertLink = () => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const url = prompt('Digite a URL do link:');
      if (url) {
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
      }
    }
  };

  return (
    <div className="border border-gray-300 rounded-t-md bg-gray-50 p-2 flex flex-wrap gap-1">
      {/* Formatação de texto */}
      <button
        type="button"
        onClick={() => formatText('bold')}
        className="p-2 rounded hover:bg-gray-200 focus:outline-none transition-colors"
        title="Negrito"
      >
        <FaBold />
      </button>
      
      <button
        type="button"
        onClick={() => formatText('italic')}
        className="p-2 rounded hover:bg-gray-200 focus:outline-none transition-colors"
        title="Itálico"
      >
        <FaItalic />
      </button>
      
      <button
        type="button"
        onClick={() => formatText('underline')}
        className="p-2 rounded hover:bg-gray-200 focus:outline-none transition-colors"
        title="Sublinhado"
      >
        <FaUnderline />
      </button>
      
      <button
        type="button"
        onClick={() => formatText('strikethrough')}
        className="p-2 rounded hover:bg-gray-200 focus:outline-none transition-colors"
        title="Riscado"
      >
        <FaStrikethrough />
      </button>
      
      <div className="w-px bg-gray-300 mx-1"></div>
      
      {/* Alinhamento */}
      <button
        type="button"
        onClick={() => formatAlignment('left')}
        className="p-2 rounded hover:bg-gray-200 focus:outline-none transition-colors"
        title="Alinhar à esquerda"
      >
        <FaAlignLeft />
      </button>
      
      <button
        type="button"
        onClick={() => formatAlignment('center')}
        className="p-2 rounded hover:bg-gray-200 focus:outline-none transition-colors"
        title="Centralizar"
      >
        <FaAlignCenter />
      </button>
      
      <button
        type="button"
        onClick={() => formatAlignment('right')}
        className="p-2 rounded hover:bg-gray-200 focus:outline-none transition-colors"
        title="Alinhar à direita"
      >
        <FaAlignRight />
      </button>
      
      <div className="w-px bg-gray-300 mx-1"></div>
      
      {/* Listas */}
      <button
        type="button"
        onClick={() => insertList('ul')}
        className="p-2 rounded hover:bg-gray-200 focus:outline-none transition-colors"
        title="Lista com marcadores"
      >
        <FaListUl />
      </button>
      
      <button
        type="button"
        onClick={() => insertList('ol')}
        className="p-2 rounded hover:bg-gray-200 focus:outline-none transition-colors"
        title="Lista numerada"
      >
        <FaListOl />
      </button>
      
      <div className="w-px bg-gray-300 mx-1"></div>
      
      {/* Links */}
      <button
        type="button"
        onClick={insertLink}
        className="p-2 rounded hover:bg-gray-200 focus:outline-none transition-colors"
        title="Inserir link"
      >
        <FaLink />
      </button>
      
      <div className="w-px bg-gray-300 mx-1"></div>
      
      {/* Histórico */}
      <button
        type="button"
        onClick={() => editor.dispatchCommand(UNDO_COMMAND)}
        className="p-2 rounded hover:bg-gray-200 focus:outline-none transition-colors"
        title="Desfazer"
      >
        <FaUndo />
      </button>
      
      <button
        type="button"
        onClick={() => editor.dispatchCommand(REDO_COMMAND)}
        className="p-2 rounded hover:bg-gray-200 focus:outline-none transition-colors"
        title="Refazer"
      >
        <FaRedo />
      </button>
    </div>
  );
}

// Componente principal
const TextForm = ({ content, onChange }) => {
  const initialConfig = {
    namespace: 'TextEditor',
    theme,
    onError: (error) => {
      console.error('Lexical Error:', error);
    },
    nodes: [LinkNode, ListNode, ListItemNode],
    editorState: null,
  };

  const handleChange = (htmlContent) => {
    onChange({ ...content, text: htmlContent });
  };

  return (
    <>
      <TitleField 
        title={content.title} 
        onChange={(newTitle) => onChange({ ...content, title: newTitle })}
      />
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Conteúdo do Texto
        </label>
        
        <LexicalComposer initialConfig={initialConfig}>
          <div className="border border-gray-300 rounded-md">
            <ToolbarPlugin />
            <div className="relative">
              <RichTextPlugin
                contentEditable={
                  <ContentEditable 
                    className="min-h-[120px] px-3 py-2 focus:outline-none prose max-w-none"
                    style={{ borderTop: 'none' }}
                  />
                }
                placeholder={
                  <div className="absolute top-2 left-3 text-gray-400 pointer-events-none">
                    Digite seu texto aqui...
                  </div>
                }
                ErrorBoundary={LexicalErrorBoundary}
              />
              <HistoryPlugin />
              <ListPlugin />
              <LinkPlugin />
              <InitialContentPlugin initialContent={content.text} />
              <MyOnChangePlugin onChange={handleChange} />
            </div>
          </div>
        </LexicalComposer>
        
        <p className="mt-1 text-xs text-gray-500">
          Use a barra de ferramentas para formatar seu texto: negrito, itálico, alinhamento, listas e links.
        </p>
      </div>
    </>
  );
};

export default TextForm; 