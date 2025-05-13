import React, { useRef, useEffect, useState, useMemo } from 'react';
import { register } from 'swiper/element/bundle';
// Registrar os componentes do Swiper
register();

const CarouselRenderer = ({ content }) => {
  const swiperRef = useRef(null);
  const [carouselId] = useState(`carousel-${Math.random().toString(36).substr(2, 9)}`);
  
  // Para debugging
  const [debug, setDebug] = useState({});
  
  // Garantir que content.images e content.config existam com valores padrão
  const images = content.images || [];
  const config = content.config || {};
  
  // Use useMemo para evitar recriação do objeto safeConfig em cada renderização
  const safeConfig = useMemo(() => ({
    slidesPerView: 1,
    showNavigation: true,
    showPagination: true,
    spaceBetween: 30,
    loop: true,
    autoplay: false,
    autoplayDelay: 3000,
    pauseOnHover: true,
    controlsColor: '#000000',
    ...config
  }), [
    config.slidesPerView,
    config.showNavigation,
    config.showPagination, 
    config.spaceBetween,
    config.loop,
    config.autoplay,
    config.autoplayDelay,
    config.pauseOnHover,
    config.controlsColor
  ]);
  
  // Log para debug
  useEffect(() => {
    console.log("CarouselRenderer configs:", safeConfig);
    setDebug(safeConfig);
  }, [safeConfig]);

  // Estilo para os controles
  useEffect(() => {
    const styleTag = document.createElement('style');
    document.head.appendChild(styleTag);
    styleTag.textContent = `
      #${carouselId} .swiper-button-next, 
      #${carouselId} .swiper-button-prev {
        color: ${safeConfig.controlsColor} !important;
      }
      #${carouselId} .swiper-pagination-bullet-active {
        background-color: ${safeConfig.controlsColor} !important;
      }
    `;
    
    return () => {
      if (styleTag.parentNode) {
        styleTag.parentNode.removeChild(styleTag);
      }
    };
  }, [carouselId, safeConfig.controlsColor]);
  
  // Inicializar e atualizar o Swiper
  useEffect(() => {
    if (!swiperRef.current) return;
    
    // Remover qualquer instância anterior
    const swiperEl = swiperRef.current;
    
    // Configurar o elemento antes da inicialização
    swiperEl.removeAttribute('navigation');
    swiperEl.removeAttribute('pagination');
    
    // Definir atributos com base nas configurações
    if (safeConfig.showNavigation) {
      swiperEl.setAttribute('navigation', 'true');
    }
    
    if (safeConfig.showPagination) {
      swiperEl.setAttribute('pagination', 'true');
    }
    
    swiperEl.setAttribute('slides-per-view', safeConfig.slidesPerView);
    swiperEl.setAttribute('space-between', safeConfig.spaceBetween);
    swiperEl.setAttribute('loop', safeConfig.loop ? 'true' : 'false');
    
    // Inicializar o Swiper
    setTimeout(() => {
      if (swiperEl && !swiperEl.initialized) {
        swiperEl.initialize();
      }
    }, 0);
    
  }, [
    safeConfig.slidesPerView,
    safeConfig.showNavigation,
    safeConfig.showPagination, 
    safeConfig.spaceBetween,
    safeConfig.loop
  ]);

  // Renderização
  if (!images || images.length === 0) {
    return (
      <div className="w-full mb-6">
        <div className="h-40 bg-gray-100 flex items-center justify-center rounded-lg">
          <p className="text-gray-400">Nenhuma imagem adicionada ao carrossel</p>
        </div>
      </div>
    );
  }

  return (
    <div className="carousel-renderer w-full mb-6 px-2" id={carouselId}>
      {/* Debug info - remover em produção */}
      {/*
      <div className="text-xs text-gray-500 mb-1">
        Debug: Nav={debug.showNavigation ? 'true' : 'false'}, 
        Pag={debug.showPagination ? 'true' : 'false'}
      </div>
      */}
      
      <swiper-container 
        ref={swiperRef} 
        init="false" 
        class="h-full w-full"
        style={{ "--swiper-theme-color": safeConfig.controlsColor }}
      >
        {images.map((image, index) => (
          <swiper-slide key={index} class="flex justify-center">
            {image.link ? (
              <a 
                href={image.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full h-full"
              >
                <img 
                  src={image.url} 
                  alt={`Slide ${index + 1}`} 
                  className="w-full h-full object-cover rounded-lg"
                  style={{ maxHeight: '400px' }}
                />
              </a>
            ) : (
              <img 
                src={image.url} 
                alt={`Slide ${index + 1}`} 
                className="w-full h-full object-cover rounded-lg"
                style={{ maxHeight: '400px' }}
              />
            )}
          </swiper-slide>
        ))}
      </swiper-container>
    </div>
  );
};

export default CarouselRenderer; 