import React, { useRef, useEffect } from 'react';
import { register } from 'swiper/element/bundle';
// Registrar os componentes do Swiper
register();

const CarouselRenderer = ({ content }) => {
  const swiperRef = useRef(null);
  const { images = [], config = {} } = content;
  
  // Configuração padrão com fallbacks
  const {
    slidesPerView = 1,
    showNavigation = true,
    showPagination = true,
    spaceBetween = 30,
    loop = true,
    autoplay = false,
    autoplayDelay = 3000,
    pauseOnHover = true
  } = config;

  useEffect(() => {
    // Configurar o Swiper
    const swiperContainer = swiperRef.current;
    const params = {
      slidesPerView,
      spaceBetween,
      navigation: showNavigation,
      pagination: showPagination ? { clickable: true } : false,
      loop,
    };

    // Adicionar autoplay se estiver habilitado
    if (autoplay) {
      params.autoplay = {
        delay: autoplayDelay,
        disableOnInteraction: pauseOnHover
      };
    }

    // Aplicar os parâmetros
    Object.assign(swiperContainer, params);
    
    // Inicializar o Swiper
    swiperContainer.initialize();
  }, [slidesPerView, showNavigation, showPagination, spaceBetween, loop, autoplay, autoplayDelay, pauseOnHover]);

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
    <div className="w-full mb-6">
      <swiper-container ref={swiperRef} init="false" class="h-full w-full">
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