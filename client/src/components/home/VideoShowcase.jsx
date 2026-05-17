import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import api from '../../lib/axios';

// Optimized Cloudinary URL (q_auto reduces file size, f_auto picks best format per browser)
const FALLBACK_VIDEO =
  'https://res.cloudinary.com/dtu7nh06r/video/upload/q_auto,f_auto/v1778676890/IMG_9752_1_swmoz9.mp4';

function useBrandVideoUrl() {
  return useQuery({
    queryKey: ['settings', 'brandVideoUrl'],
    queryFn: () =>
      api
        .get('/settings/brandVideoUrl')
        .then((r) => r.data.data.value || FALLBACK_VIDEO)
        .catch(() => FALLBACK_VIDEO),
    staleTime: 5 * 60 * 1000,
    placeholderData: FALLBACK_VIDEO,
  });
}

export default function VideoShowcase() {
  const { data: videoUrl } = useBrandVideoUrl();
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);

  // Only load & play the video when it enters the viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || !videoRef.current || !videoUrl) return;
    const video = videoRef.current;
    video.load();
    video.play().catch(() => {});
  }, [inView, videoUrl]);

  // Don't render section at all if no video is configured
  if (!videoUrl) return null;

  return (
    <section ref={containerRef} className="relative w-full overflow-hidden bg-neutral-950">
      <div className="relative min-h-[90vh] w-full md:min-h-[90vh]">
        {inView && (
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            onCanPlay={() => setLoaded(true)}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
              loaded ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
        )}

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Loading shimmer */}
        {!loaded && (
          <div className="absolute inset-0 bg-neutral-900 animate-pulse" />
        )}

        {/* Content overlay */}
        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="max-w-lg"
            >
              <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-widest text-brand-400">
                Behind the Craft
              </span>
              <h2 className="font-heading text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
                Crafted with Passion
              </h2>
              <p className="mt-4 text-sm text-white/70 leading-relaxed sm:text-base">
                Every stitch tells a story of tradition, skill, and love — crafted with passion and purpose.
              </p>
              <Link
                to="/shop"
                className="group mt-7 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-neutral-900 transition-all hover:bg-brand-50 hover:shadow-lg"
              >
                Explore Collection
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
