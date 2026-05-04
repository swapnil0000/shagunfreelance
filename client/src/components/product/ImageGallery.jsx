import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Thumbs } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';

export default function ImageGallery({ images = [] }) {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const gallery = images.length > 0 ? images : [{ url: '/favicon.svg', alt: 'Product' }];

  return (
    <div className="flex flex-col gap-3">
      {/* Main image — Swiper for mobile, clickable for desktop */}
      <div className="relative overflow-hidden rounded-xl bg-neutral-100">
        {/* Mobile swiper */}
        <div className="block md:hidden">
          <Swiper
            modules={[Navigation, Thumbs]}
            thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
            onSlideChange={(s) => setActiveIndex(s.activeIndex)}
            navigation
            className="aspect-square w-full [&_.swiper-button-next]:text-brand-600 [&_.swiper-button-prev]:text-brand-600 [&_.swiper-button-next]:scale-75 [&_.swiper-button-prev]:scale-75"
          >
            {gallery.map((img, i) => (
              <SwiperSlide key={i}>
                <img
                  src={img.url}
                  alt={img.alt || `Product image ${i + 1}`}
                  className="h-full w-full object-cover"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Desktop main image */}
        <div className="hidden md:block">
          <img
            src={gallery[activeIndex]?.url}
            alt={gallery[activeIndex]?.alt || 'Product'}
            className="aspect-square w-full object-cover transition-opacity duration-300"
          />
        </div>
      </div>

      {/* Thumbnails */}
      {gallery.length > 1 && (
        <div className="hidden md:block">
          <Swiper
            modules={[Thumbs]}
            onSwiper={setThumbsSwiper}
            slidesPerView={Math.min(gallery.length, 5)}
            spaceBetween={8}
            watchSlidesProgress
            className="w-full"
          >
            {gallery.map((img, i) => (
              <SwiperSlide key={i}>
                <button
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  className={`block w-full overflow-hidden rounded-lg border-2 transition-colors ${
                    activeIndex === i
                      ? 'border-brand-600'
                      : 'border-transparent hover:border-neutral-300'
                  }`}
                  aria-label={`View image ${i + 1}`}
                >
                  <img
                    src={img.url}
                    alt={img.alt || `Thumbnail ${i + 1}`}
                    className="aspect-square w-full object-cover"
                    loading="lazy"
                  />
                </button>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}

      {/* Mobile dots indicator */}
      {gallery.length > 1 && (
        <div className="flex justify-center gap-1.5 md:hidden">
          {gallery.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                activeIndex === i ? 'w-6 bg-brand-600' : 'w-1.5 bg-neutral-300'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
