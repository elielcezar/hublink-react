import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IoIosCloseCircleOutline } from "react-icons/io";
import LinkForm from './LinkForm';
import TextForm from './TextForm';
import BannerForm from './BannerForm';
import CarouselForm from './CarouselForm';
import SocialForm from './SocialForm';
import IconForm from './IconForm';
import VideoForm from './VideoForm';
import { GrTextAlignLeft } from "react-icons/gr";
import { HiLink } from "react-icons/hi";
import { FaImage, FaShareAlt, FaIcons } from "react-icons/fa";
import { FaImages } from "react-icons/fa";
import { FaYoutube } from "react-icons/fa";



// Formulários para edição dos componentes
const componentForms = {
  text: ({ content, onChange }) => <TextForm content={content} onChange={onChange} />,
  link: ({ content, onChange }) => <LinkForm content={content} onChange={onChange} />,
  banner: ({ content, onChange }) => <BannerForm content={content} onChange={onChange} />,
  carousel: ({ content, onChange }) => <CarouselForm content={content} onChange={onChange} />,
  social: ({ content, onChange }) => <SocialForm content={content} onChange={onChange} />,
  icon: ({ content, onChange }) => <IconForm content={content} onChange={onChange} />,
  video: ({ content, onChange }) => <VideoForm content={content} onChange={onChange} />
};

// Função para determinar o título padrão para cada tipo de componente
const getComponentDefaultTitle = (type) => {
  const defaults = {
    text: 'Bloco de Texto',
    link: 'Link',
    banner: 'Banner',
    carousel: 'Carrossel',
    social: 'Redes Sociais',
    icon: 'Ícone',
    video: 'Vídeo'
  };
  return defaults[type] || 'Componente';
};

const getComponentDefaultIcon = (type) => {
  const defaults = {
    text: <GrTextAlignLeft className="mr-2 text-violet-700" size={20} />,
    link: <HiLink className="mr-2 text-violet-700" size={20} />,
    banner: <FaImage className="mr-2 text-violet-700" size={20} />,
    carousel: <FaImages className="mr-2 text-violet-700" size={20} />,
    social: <FaShareAlt className="mr-2 text-violet-700" size={20} />,
    icon: <FaIcons className="mr-2" size={20} />,
    video: <FaYoutube className="mr-2 text-violet-700" size={20} />
  };
  return defaults[type] || 'Componente';
};

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
      className="bg-white rounded-lg shadow-md border-2 hover:border-violet-700 relative"
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
            {getComponentDefaultIcon(component.type)}
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
            className="text-gray-400 hover:text-violet-700"
          >
            <IoIosCloseCircleOutline size={24}/>
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

export default SortableItem;
