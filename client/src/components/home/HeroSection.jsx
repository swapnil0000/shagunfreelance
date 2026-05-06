import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative min-h-[85vh] overflow-hidden">
      {/* Background image — stylish woman with bag */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1920&q=80&auto=format&fit=crop"
          alt=""
          className="h-full w-full object-cover"
          aria-hidden="true"
        />
        {/* Overlay gradient for text readability */}
        <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative mx-auto flex min-h-[85vh] max-w-7xl items-center px-4 py-20 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="max-w-xl"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm"
          >
            <Sparkles className="h-4 w-4 text-accent-300" />
            <span className="text-sm font-medium text-white/90">New Collection 2025</span>
          </motion.div>

          <h1 className="font-heading text-5xl font-bold leading-[1.1] text-white sm:text-6xl lg:text-7xl">
            Elegance
            <br />
            <span className="bg-linear-to-r from-brand-300 to-accent-300 bg-clip-text text-transparent">
              Redefined
            </span>
          </h1>

          <p className="mt-6 max-w-md text-lg leading-relaxed text-white/80">
            Premium handcrafted workbags for the woman who leads with confidence.
            Made with love in Varanasi.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to="/shop"
              className="group inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-semibold text-neutral-900 shadow-lg transition-all hover:bg-brand-50 hover:shadow-xl"
            >
              Shop Now
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/shop?category=tote-bags"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-8 py-4 text-base font-medium text-white backdrop-blur-sm transition-all hover:border-white/60 hover:bg-white/10"
            >
              Explore Totes
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-12 flex items-center gap-8">
            <div>
              <p className="text-2xl font-bold text-white">2K+</p>
              <p className="text-xs text-white/60">Happy Customers</p>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div>
              <p className="text-2xl font-bold text-white">100%</p>
              <p className="text-xs text-white/60">Handcrafted</p>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div>
              <p className="text-2xl font-bold text-white">4.9★</p>
              <p className="text-xs text-white/60">Avg Rating</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-linear-to-t from-white to-transparent" />
    </section>
  );
}
