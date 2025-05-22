import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import React from 'react';
import api from '../config/apiConfig';
import CarouselRenderer from '../components/editor/renderers/CarouselRenderer';
import LinkForm from '../components/editor/forms/LinkForm';
import LinkRenderer from '../components/editor/renderers/LinkRenderer';
import MenuDashboard from '../components/MenuDashboard';
import SocialRenderer from '../components/editor/renderers/SocialRenderer';
import BannerRenderer from '../components/editor/renderers/BannerRenderer';
import IconForm from '../components/editor/forms/IconForm';
import IconRenderer from '../components/editor/renderers/IconRenderer';
import TextForm from '../components/editor/forms/TextForm';
import TextRenderer from '../components/editor/renderers/TextRenderer';
import BannerForm from '../components/editor/forms/BannerForm';
import CarouselForm from '../components/editor/forms/CarouselForm';
import SocialForm from '../components/editor/forms/SocialForm';
import '../styles/preview.css';
import AppHeader from '../components/AppHeader';

import { GrTextAlignLeft } from "react-icons/gr";
import { HiLink } from "react-icons/hi";
import { FaRegImage } from "react-icons/fa";
import { RiCarouselView } from "react-icons/ri";
import { IoShareSocialSharp } from "react-icons/io5";
import { FaSquareFontAwesomeStroke } from "react-icons/fa6";
import { LuSquareMousePointer } from "react-icons/lu";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Componentes para renderização na prévia
const componentRenderers = {
  text: ({ content }) => <TextRenderer content={content} />,
  link: ({ content }) => <LinkRenderer content={content} />,
  banner: ({ content }) => <BannerRenderer content={content} />,
  carousel: ({ content }) => <CarouselRenderer content={content} />,
  social: ({ content }) => <SocialRenderer content={content} />,
  icon: ({ content }) => <IconRenderer content={content} />
};

// Formulários para edição dos componentes
const componentForms = {
  text: ({ content, onChange }) => <TextForm content={content} onChange={onChange} />,
  link: ({ content, onChange }) => <LinkForm content={content} onChange={onChange} />,
  banner: ({ content, onChange }) => <BannerForm content={content} onChange={onChange} />,
  carousel: ({ content, onChange }) => <CarouselForm content={content} onChange={onChange} />,
  social: ({ content, onChange }) => <SocialForm content={content} onChange={onChange} />,
  icon: ({ content, onChange }) => <IconForm content={content} onChange={onChange} />
};

// Valores padrão para novos componentes
const defaultComponentValues = {
  text: { 
    title: 'Bloco de Texto',
    text: '<p>Digite seu texto aqui</p>' 
  },
  link: { 
    title: 'Link',
    text: 'Clique aqui', 
    url: 'https://', 
    style: 'primary',
    width: '100',
    imageUrl: '',
    imagePosition: 'left',
    backgroundColor: '#ffffff',
    textColor: '#000000'
  },
  banner: { 
    title: 'Banner',
    imageUrl: '', 
    altText: '', 
    caption: '' 
  },
  carousel: {
    title: 'Carrossel',
    images: [],
    config: {
      slidesPerView: 1,
      showNavigation: true,
      showPagination: true,
      spaceBetween: 30,
      loop: true,
      autoplay: false,
      autoplayDelay: 3000,
      pauseOnHover: true,
      controlsColor: '#000000'
    }
  },
  social: {
    title: 'Redes Sociais',
    instagram: '',
    x: '',
    youtube: '',
    tiktok: '',
    kwai: '',
    spotify: '',
    iconColor: '#0077B5'
  },
  icon: {
    title: 'Botão',
    text: 'Texto do Botão', 
    url: 'https://', 
    imageUrl: '',
    height: 'medium',
    width: '100',
    overlayColor: 'rgba(0, 0, 0, 0.4)',
    textColor: '#ffffff'
  }
};

// Componente para cada item ordenável
const SortableItem = ({ component, index, expandedComponent, setExpandedComponent, onDelete, saving, handleComponentUpdate }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: component.id.toString() });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className="bg-white rounded-lg shadow-md overflow-hidden"
    >
      <div
        onClick={() => setExpandedComponent(
          expandedComponent === component.id ? null : component.id
        )}
        className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50"
      >
        <div className="flex items-center">
          <div 
            {...attributes} 
            {...listeners} 
            className="mr-2 px-2 py-1 text-gray-500 hover:bg-gray-100 rounded cursor-grab"
          >
            ⣿
          </div>
          <span className="text-gray-500 mr-2">
            {index + 1}.
          </span>
          <h3 className="font-medium capitalize">
            {component.content.title || getComponentDefaultTitle(component.type)}
          </h3>
        </div>
        
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(component.id);
            }}
            disabled={saving}
            className="text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      </div>
      
      {expandedComponent === component.id && (
        <div className="border-t border-gray-200 p-4">
          {componentForms[component.type]({
            content: component.content,
            onChange: (newContent) => handleComponentUpdate(component.id, newContent)
          })}
        </div>
      )}
    </div>
  );
};

const PageEditor = () => {
  const { pageId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [page, setPage] = useState(null);
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [_lastSaved, _setLastSaved] = useState(null);
  const [error, setError] = useState('');
  const [expandedComponent, setExpandedComponent] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Sensores para o drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    const fetchPageData = async () => {
      try {

        const userResponse = await api.get('/api/me');        
        setUser(userResponse.data);      
            
        const response = await api.get(`/api/pages/${pageId}`);
        
        // Garantir que a página tenha um objeto style, mesmo que vazio
        setPage({
          ...response.data,
          style: response.data.style || {
            backgroundColor: '#ffffff',
            fontFamily: 'Inter, sans-serif',
            linkColor: '#3b82f6',
            textColor: '#333333'
          }
        });
        
        // Converter os componentes para objetos com content parseado
        const parsedComponents = response.data.components.map(comp => ({
          ...comp,
          content: typeof comp.content === 'string' ? JSON.parse(comp.content) : comp.content
        }));
        
        setComponents(parsedComponents);
      } catch (error) {
        console.error('Erro ao buscar dados da página:', error);
        setError('Erro ao carregar a página. Verifique se você tem permissão para editá-la.');
        
        if (error.response?.status === 401 || error.response?.status === 403) {
          navigate('/dashboard');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchPageData();
  }, [pageId, navigate]);
  
  useEffect(() => {
    if (page?.style) {
      // Buscar o elemento de preview 
      const previewElement = document.getElementById('page-preview-container');
      
      if (previewElement) {
        // Aplicar cor de fundo ou imagem de fundo
        if (page.style.backgroundType === 'image' && page.style.backgroundImage) {
          previewElement.style.backgroundImage = `url(${page.style.backgroundImage})`;
          previewElement.style.backgroundSize = 'cover';
          previewElement.style.backgroundPosition = 'center';
          previewElement.style.backgroundRepeat = 'no-repeat';
          previewElement.style.backgroundColor = '';
        } else {
          previewElement.style.backgroundImage = '';
          previewElement.style.backgroundColor = page.style.backgroundColor || '#ffffff';
        }
        
        // Aplicar fonte e cor do texto
        previewElement.style.fontFamily = page.style.fontFamily || 'Inter, sans-serif';
        previewElement.style.color = page.style.textColor || '#333333';
      }
    }
  }, [page?.style]);
  
  const addComponent = async (type, content) => {
    try {
      // Resetar qualquer erro anterior
      setError('');
      
      // Não salvar na API imediatamente, apenas adicionar ao estado local
      // Criar um ID temporário que será substituído quando salvar
      const tempId = `temp-${Date.now()}`;
      const newComponent = {
        id: tempId,
        type,
        content,
        isNew: true // Marcar como novo componente para salvar depois
      };
      
      // Adicionar ao início da lista em vez do final
      setComponents(prevComponents => [newComponent, ...prevComponents]);
      setHasUnsavedChanges(true); // Marcar que há alterações não salvas
    } catch (error) {
      console.error('Erro ao adicionar componente:', error);
      setError('Falha ao adicionar componente. Por favor, tente novamente.');
    }
  };
  
  const deleteComponent = async (componentId) => {
    try {
      setError('');
      
      // Verificar se o componente é novo (ainda não salvo na API)
      const component = components.find(comp => comp.id === componentId);
      
      if (component && !component.isNew) {
        // Marcar para deleção, mas não deletar imediatamente da API
        // Em vez de manter o componente visível com uma flag toDelete
        // vamos mover para um estado separado e remover da visualização
        const deletedComponent = {...component, toDelete: true};
        
        // Remover da lista de componentes visíveis
        setComponents(prevComponents => 
          prevComponents.filter(comp => comp.id !== componentId)
        );
        
        // Armazenar separadamente para deleção futura
        // Isso poderia ser um novo estado como:
        // setComponentsToDelete(prev => [...prev, deletedComponent]);
        // 
        // Mas como já temos a lógica implementada com a flag toDelete,
        // podemos adicionar de volta ao array com a flag
        setComponents(prevComponents => [
          ...prevComponents.filter(comp => comp.id !== componentId),
          deletedComponent
        ]);
      } else {
        // Se for um componente novo, apenas remove do estado
        setComponents(prevComponents => 
          prevComponents.filter(component => component.id !== componentId)
        );
      }
      
      setHasUnsavedChanges(true);
    } catch (error) {
      console.error('Erro ao excluir componente:', error);
      setError('Falha ao excluir componente. Por favor, tente novamente.');
    }
  };
  
  const moveComponent = async (componentId, direction) => {
    try {
      setError('');
      
      const currentIndex = components.findIndex(comp => comp.id === componentId);
      if (currentIndex === -1) return;
      
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (newIndex < 0 || newIndex >= components.length) return;
      
      // Trocar posição dos componentes apenas localmente
      const newComponents = [...components];
      [newComponents[currentIndex], newComponents[newIndex]] = 
      [newComponents[newIndex], newComponents[currentIndex]];
      
      setComponents(newComponents);
      setHasUnsavedChanges(true); // Marcar que há alterações não salvas
    } catch (error) {
      console.error('Erro ao reordenar componentes:', error);
      setError('Falha ao reordenar componentes. Por favor, tente novamente.');
    }
  };
  
  const handleComponentUpdate = (componentId, newContent) => {
    setComponents(components.map(component => 
      component.id === componentId 
        ? { ...component, content: newContent } 
        : component
    ));
    setHasUnsavedChanges(true);
  };
  
  const saveComponents = async () => {
    try {
      setSaving(true);
      setError('');
      
      // 1. Lidar com componentes para deletar
      const componentsToDelete = components.filter(comp => comp.toDelete && !comp.isNew);
      for (const component of componentsToDelete) {
        await api.delete(`/api/components/${component.id}`);
      }
      
      // 2. Filtrar componentes que não serão deletados
      const componentsToSave = components.filter(comp => !comp.toDelete);
      
      // 3. Salvar componentes novos ou atualizados
      for (const component of componentsToSave) {
        if (component.isNew) {
          // Componente novo - criar via API
          const response = await api.post(
            `/api/pages/${pageId}/components`,
            { 
              type: component.type, 
              content: component.content 
            }
          );
          // Atualizar o ID temporário com o ID real da API
          component.id = response.data.id;
          component.isNew = false;
        } else {
          // Componente existente - atualizar via API
          await api.put(
            `/api/components/${component.id}`,
            {
              type: component.type,
              content: component.content
            }
          );
        }
      }
      
      // 4. Atualizar a ordem dos componentes
      const componentIds = componentsToSave.map(comp => comp.id);
      await api.put(
        `/api/pages/${pageId}/reorder`,
        { componentIds }
      );
      
      // 5. Atualizar o estado com os componentes salvos
      setComponents(componentsToSave);
      setHasUnsavedChanges(false);
      
      // Exibir mensagem de sucesso temporária
      _setLastSaved(new Date().toLocaleTimeString());
      
      return true;
    } catch (error) {
      console.error('Erro ao salvar componentes:', error);
      setError('Falha ao salvar componentes. Por favor, tente novamente.');
      return false;
    } finally {
      setSaving(false);
    }
  };
  
  const fetchPageStyle = async () => {
    try {
      const response = await api.get(
        `/api/pages/${pageId}/style`
      );
      
      const style = response.data.style || {
        backgroundColor: '#ffffff',
        fontFamily: 'Inter, sans-serif',
        linkColor: '#3b82f6',
        textColor: '#333333'
      };
      
      setPage(prevPage => ({
        ...prevPage,
        style
      }));
    } catch (error) {
      console.error('Erro ao buscar estilo da página:', error);
    }
  };
  
  useEffect(() => {
    // Adicione um event listener para quando a janela recebe foco novamente
    const handleFocus = () => {
      // Recarregar o estilo da página quando a janela recebe foco
      fetchPageStyle();
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [pageId]);
  
  // Função para lidar com o fim do drag and drop
  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (!over) return;
    
    if (active.id !== over.id) {
      setComponents((items) => {
        // Filtrar apenas componentes visíveis
        const visibleItems = items.filter(item => !item.toDelete);
        
        // Encontrar os índices dos items
        const oldIndex = visibleItems.findIndex(item => item.id.toString() === active.id);
        const newIndex = visibleItems.findIndex(item => item.id.toString() === over.id);
        
        // Reorganizar a array
        const reorderedItems = arrayMove(visibleItems, oldIndex, newIndex);
        
        // Combinar com componentes marcados para deleção
        const newComponents = [
          ...reorderedItems,
          ...items.filter(item => item.toDelete)
        ];
        
        setHasUnsavedChanges(true);
        return newComponents;
      });
    }
  };
  
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-700">Carregando editor...</p>
        </div>
      </div>
    );
  }
  
  if (error && !page) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-md">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Erro</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            to="/dashboard"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Voltar para o Dashboard
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-row min-h-screen">
      <MenuDashboard />
      
      <div className="min-h-screen bg-gray-100 w-full pl-[100px]">
        
        <AppHeader 
          user={user}
          pages={page ? [page] : []}
          showSaveButton={true}
          showSlugEditor={true}
          onSave={saveComponents}
          hasChanges={hasUnsavedChanges}
          saving={saving}
        />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row gap-x-12">
            {/* Coluna de edição - Esquerda */}
            <div className="md:w-8/12 space-y-4">
              <h1 className="text-2xl font-bold text-gray-900">                
                  Editor de Componentes
              </h1>
              <div className="bg-violet-800 p-4 rounded-lg shadow-md">               
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => addComponent('text', defaultComponentValues.text)}
                    disabled={saving}
                    className="flex items-center px-4 py-3 text-white bg-violet-500 font-medium text-lg rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-white hover:text-violet-950 transition-all duration-300"
                  >
                    <GrTextAlignLeft className="mr-2" size={24} />
                    Texto
                  </button>
                  <button
                    onClick={() => addComponent('link', defaultComponentValues.link)}
                    disabled={saving}
                    className="flex items-center px-4 py-3 text-white bg-violet-500 font-medium text-lg rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-white hover:text-violet-950 transition-all duration-300"
                  >
                    <HiLink className="mr-2" size={24} />
                    Link
                  </button>
                  <button
                    onClick={() => addComponent('banner', defaultComponentValues.banner)}
                    disabled={saving}
                    className="flex items-center px-4 py-3 text-white bg-violet-500 font-medium text-lg rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-white hover:text-violet-950 transition-all duration-300"
                  >
                    <FaRegImage className="mr-2" size={24} />
                    Banner
                  </button>
                  <button
                    onClick={() => addComponent('carousel', defaultComponentValues.carousel)}
                    disabled={saving}
                    className="flex items-center px-4 py-3 text-white bg-violet-500 font-medium text-lg rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-white hover:text-violet-950 transition-all duration-300"
                  >
                    <RiCarouselView className="mr-2" size={24} />
                    Carrossel
                  </button>
                  <button
                    onClick={() => addComponent('social', defaultComponentValues.social)}
                    disabled={saving}
                    className="flex items-center px-4 py-3 text-white bg-violet-500 font-medium text-lg rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-white hover:text-violet-950 transition-all duration-300"
                  >
                    <IoShareSocialSharp className="mr-2" size={24} />
                    Redes Sociais
                  </button>
                  <button
                    onClick={() => addComponent('icon', defaultComponentValues.icon)}
                    disabled={saving}
                    className="flex items-center px-4 py-3 text-white bg-violet-500 font-medium text-lg rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-white hover:text-violet-950 transition-all duration-300"
                  >
                    <LuSquareMousePointer className="mr-2" size={24} />
                    Botão
                  </button>
                </div>
              </div>
              
              {components.filter(comp => !comp.toDelete).length > 0 ? (
                <div className="space-y-4">
                  <DndContext 
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext 
                      items={components.filter(comp => !comp.toDelete).map(comp => comp.id.toString())}
                      strategy={verticalListSortingStrategy}
                    >
                      {components
                        .filter(component => !component.toDelete)
                        .map((component, index) => (
                          <SortableItem 
                            key={component.id}
                            component={component}
                            index={index}
                            expandedComponent={expandedComponent}
                            setExpandedComponent={setExpandedComponent}
                            onDelete={deleteComponent}
                            saving={saving}
                            handleComponentUpdate={handleComponentUpdate}
                          />
                        ))}
                    </SortableContext>
                  </DndContext>
                </div>
              ) : (
                <div className="bg-white p-8 rounded-lg shadow-md text-center">
                  <p className="text-gray-600">
                    Esta página ainda não tem componentes.
                  </p>
                  <p className="mt-2 text-gray-600">
                    Use os botões acima para adicionar conteúdo à sua landing page.
                  </p>
                </div>
              )}
            </div>
            
            {/* Prévia - Direita */}
            <div className="md:w-4/12">
              <div className="px-4">
              
                <div 
                  id="page-preview-container"
                  className="bg-gray-50 border-[12px] border-black rounded-[30px] w-[300px] h-[600px] overflow-hidden mx-auto"
                >
                  <div className="preview-content h-full py-6 px-3 overflow-y-auto overflow-x-hidden">
                    {page?.style?.logo && (
                      <header className="text-center mb-6">
                        <div className="flex justify-center">
                          <img 
                            src={page.style.logo} 
                            alt="Logo" 
                            className="max-h-36 object-contain"
                          />
                        </div>
                      </header>
                    )}
                    
                    <div className="flex flex-col">
                      {components.map((component) => (
                        <div key={component.id} className="mb-4 w-full">
                          {componentRenderers[component.type]({ content: component.content })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

// Função de debounce
const _debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Adicionar esta função para determinar o título padrão para cada tipo de componente
const getComponentDefaultTitle = (type) => {
  const defaults = {
    text: 'Bloco de Texto',
    link: 'Link',
    banner: 'Banner',
    carousel: 'Carrossel',
    social: 'Redes Sociais',
    icon: 'Ícone'
  };
  return defaults[type] || 'Componente';
};

// Função para obter o rótulo de cada tipo de componente
const _getComponentLabel = (type) => {
  const labels = {
    text: 'Texto',
    link: 'Link',
    banner: 'Banner',
    carousel: 'Carrossel',
    social: 'Redes Sociais',
    icon: 'Ícone'
  };
  return labels[type] || 'Componente';
};

export default PageEditor; 