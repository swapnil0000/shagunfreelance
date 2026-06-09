import { useState } from 'react';
import { cld, cldSrcSet } from '../../lib/cloudinary';

export default function ImageGallery({ images = [] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const gallery = images.length > 0 ? images : [{ url: '/favicon.svg', alt: 'Product' }];

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="relative w-full overflow-hidden rounded-2xl bg-neutral-100 ">
        <img
          src={cld(gallery[activeIndex]?.url, { w: 800 })}
          srcSet={cldSrcSet(gallery[activeIndex]?.url, [600, 800, 1200])}
          sizes="(max-width: 768px) 100vw, 50vw"
          alt={gallery[activeIndex]?.alt || 'Product'}
          className="w-full object-contain"
          fetchpriority="high"
          decoding="async"
          draggable={false}
        />
        {/* Mobile nav arrows */}
        {gallery.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setActiveIndex((i) => (i - 1 + gallery.length) % gallery.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 shadow text-neutral-700 md:hidden"
              aria-label="Previous image"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => setActiveIndex((i) => (i + 1) % gallery.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 shadow text-neutral-700 md:hidden"
              aria-label="Next image"
            >
              ›
            </button>
          </>
        )}
        {/* Image counter badge on mobile */}
        {gallery.length > 1 && (
          <span className="absolute bottom-3 right-3 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white md:hidden">
            {activeIndex + 1} / {gallery.length}
          </span>
        )}
      </div>

      {/* Thumbnail strip — desktop only if > 1 image */}
      {gallery.length > 1 && (
        <div className="hidden md:flex gap-2 overflow-x-auto pb-1">
          {gallery.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`shrink-0 h-16 w-16 overflow-hidden rounded-xl border-2 transition-all ${
                activeIndex === i
                  ? 'border-brand-600 shadow-sm'
                  : 'border-transparent hover:border-neutral-300'
              }`}
              aria-label={`View image ${i + 1}`}
            >
              <img
                src={cld(img.url, { w: 160 })}
                alt={img.alt || `Thumbnail ${i + 1}`}
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </button>
          ))}
        </div>
      )}

      {/* Dot indicators on mobile */}
      {gallery.length > 1 && (
        <div className="flex justify-center gap-1.5 md:hidden">
          {gallery.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIndex(i)}
              aria-label={`Go to image ${i + 1}`}
              className={`rounded-full transition-all ${
                activeIndex === i ? 'w-5 h-1.5 bg-brand-600' : 'w-1.5 h-1.5 bg-neutral-300'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
