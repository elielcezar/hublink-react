import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const CarouselComponent = ({ images, config }) => {
  // Filtra apenas imagens com URL válida
  const validImages = images?.filter(img => img?.url) || [];
  
  // Se tiver menos de 3 imagens, desativa o loop
  const shouldLoop = config?.loop && validImages.length >= 3;

  return (
    <div className="w-full" style={{ maxWidth: '100%', overflow: 'hidden' }}>
      {validImages.length > 0 ? (
        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={config?.spaceBetween || 30}
          slidesPerView={config?.slidesPerView || 1}
          navigation={config?.showNavigation ?? true}
          pagination={config?.showPagination ? { clickable: true } : false}
          loop={shouldLoop}
          style={{ width: '100%' }}
        >
          {validImages.map((image, index) => (
            <SwiperSlide key={index} style={{ width: '100%' }}>
              <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%' }}>
                <img
                  src={image.url}
                  alt={`Slide ${index + 1}`}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '0.5rem'
                  }}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', backgroundColor: '#f3f4f6', borderRadius: '0.5rem' }}>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: '#6b7280' }}>Adicione imagens ao carrossel</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarouselComponent; 