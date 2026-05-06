import { useState, useRef, useCallback } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Thumbs } from 'swiper/modules';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';

function ZoomableImage({ src, alt }) {
  const containerRef = useRef(null);
  const [zoomed, setZoomed] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 50 });

  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPosition({ x, y });
  }, []);

  const handleMouseEnter = () => setZoomed(true);
  const handleMouseLeave = () => {
    setZoomed(false);
    setPosition({ x: 50, y: 50 });
  };

  return (
    <div
      ref={containerRef}
      className="relative aspect-square w-full cursor-zoom-in overflow-hidden rounded-2xl bg-neutral-100"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover transition-transform duration-200 ease-out"
        style={{
          transform: zoomed ? 'scale(2.2)' : 'scale(1)',
          transformOrigin: `${position.x}% ${position.y}%`,
        }}
        draggable={false}
      />
      {/* Zoom hint */}
      {!zoomed && (
        <div className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-xs text-white backdrop-blur-sm">
          <ZoomIn className="h-3.5 w-3.5" />
          Hover to zoom
        </div>
      )}
    </div>
  );
}

function MobileZoomImage({ src, alt }) {
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const lastTouchRef = useRef(null);
  const lastDistRef = useRef(null);

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      lastDistRef.current = dist;
    } else if (e.touches.length === 1 && scale > 1) {
      lastTouchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      if (lastDistRef.current) {
        const delta = dist / lastDistRef.current;
        setScale((s) => Math.min(3, Math.max(1, s * delta)));
      }
      lastDistRef.current = dist;
    } else if (e.touches.length === 1 && scale > 1 && lastTouchRef.current) {
      const dx = e.touches[0].clientX - lastTouchRef.current.x;
      const dy = e.touches[0].clientY - lastTouchRef.current.y;
      setTranslate((t) => ({ x: t.x + dx, y: t.y + dy }));
      lastTouchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchEnd = () => {
    lastDistRef.current = null;
    lastTouchRef.current = null;
    if (scale <= 1.05) {
      setScale(1);
      setTranslate({ x: 0, y: 0 });
    }
  };

  const handleDoubleTap = () => {
    if (scale > 1) {
      setScale(1);
      setTranslate({ x: 0, y: 0 });
    } else {
      setScale(2.5);
    }
  };

  const reset = () => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  };

  return (
    <div
      className="relative aspect-square w-full overflow-hidden rounded-2xl bg-neutral-100 touch-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onDoubleClick={handleDoubleTap}
    >
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover transition-transform duration-100"
        style={{
          transform: `scale(${scale}) translate(${translate.x / scale}px, ${translate.y / scale}px)`,
        }}
        draggable={false}
      />
      {/* Controls */}
      {scale > 1 && (
        <button
          onClick={reset}
          className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1.5 text-xs text-white backdrop-blur-sm"
        >
          <RotateCcw className="h-3 w-3" />
          Reset
        </button>
      )}
      {scale <= 1 && (
        <div className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-xs text-white backdrop-blur-sm">
          <ZoomIn className="h-3.5 w-3.5" />
          Pinch to zoom
        </div>
      )}
    </div>
  );
}

export default function ImageGallery({ images = [] }) {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const gallery = images.length > 0 ? images : [{ url: '/favicon.svg', alt: 'Product' }];

  return (
    <div className="flex flex-col gap-3">
      {/* Mobile: Swiper with pinch-zoom */}
      <div className="block md:hidden">
        <Swiper
          modules={[Navigation, Thumbs]}
          thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
          onSlideChange={(s) => setActiveIndex(s.activeIndex)}
          navigation
          className="w-full [&_.swiper-button-next]:text-brand-600 [&_.swiper-button-prev]:text-brand-600 [&_.swiper-button-next]:scale-75 [&_.swiper-button-prev]:scale-75"
        >
          {gallery.map((img, i) => (
            <SwiperSlide key={i}>
              <MobileZoomImage src={img.url} alt={img.alt || `Product image ${i + 1}`} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Desktop: Hover-to-zoom */}
      <div className="hidden md:block">
        <ZoomableImage
          src={gallery[activeIndex]?.url}
          alt={gallery[activeIndex]?.alt || 'Product'}
        />
      </div>

      {/* Thumbnails (desktop) */}
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
                  className={`block w-full overflow-hidden rounded-xl border-2 transition-all ${
                    activeIndex === i
                      ? 'border-brand-600 shadow-sm'
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

      {/* Mobile dots */}
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
