import React, { useRef, useEffect, useState } from 'react';
import { register } from 'swiper/element/bundle';
// Registrar os componentes do Swiper
register();

const CarouselRenderer = ({ content }) => {
  const swiperRef = useRef(null);
  // Gerar um ID único para cada instância do carrossel
  const [carouselId] = useState(`carousel-${Math.random().toString(36).substr(2, 9)}`);
  
  // Garantir que content.images e content.config existam com valores padrão
  const images = content.images || [];
  const config = content.config || {};
  
  // Use valores padrão para safeConfig
  const safeConfig = {
    slidesPerView: 1,
    showNavigation: true,
    showPagination: true,
    spaceBetween: 30,
    loop: true,
    autoplay: false,
    autoplayDelay: 3000,
    pauseOnHover: true,
    controlsColor: '#000000',
    ...config  // Sobrescreve os valores padrão com os que vêm do content.config
  };

  useEffect(() => {
    // Definir a variável CSS personalizada diretamente no container
    const swiperContainer = swiperRef.current;
    
    if (swiperContainer) {
      // Definir a variável CSS diretamente no elemento do Swiper
      swiperContainer.style.setProperty('--swiper-theme-color', safeConfig.controlsColor);
      
      // Configuração do Swiper
      const swiperConfig = {
        slidesPerView: safeConfig.slidesPerView || 1,
        spaceBetween: safeConfig.spaceBetween || 30,
        loop: Boolean(safeConfig.loop),
        autoplay: safeConfig.autoplay ? {
          delay: safeConfig.autoplayDelay || 3000,
          disableOnInteraction: safeConfig.pauseOnHover || true
        } : false,
        pagination: safeConfig.showPagination ? {
          clickable: true,
        } : false,
        navigation: safeConfig.showNavigation,
      };
      
      // Aplicar os parâmetros e inicializar
      Object.assign(swiperContainer, swiperConfig);
      swiperContainer.initialize();
    }
  }, [safeConfig, carouselId]);

  // Se não houver imagens, mostrar mensagem
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
    <div className="w-full mb-6" id={carouselId}>
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