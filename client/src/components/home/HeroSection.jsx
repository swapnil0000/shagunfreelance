import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import heroImg from '../../assets/hero.png';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-brand-50">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24 lg:px-8">
        {/* Text */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center md:text-left"
        >
          <span className="mb-3 inline-block rounded-full bg-brand-100 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-brand-700">
            Premium Workbags
          </span>
          <h1 className="font-heading text-4xl font-bold leading-tight text-neutral-900 sm:text-5xl lg:text-6xl">
            Carry Your <br className="hidden sm:block" />
            <span className="text-brand-600">Ambition</span> in Style
          </h1>
          <p className="mt-4 max-w-lg text-base text-neutral-600 sm:text-lg md:mx-0 mx-auto">
            Handcrafted leather workbags designed for the modern professional woman.
            Made in Varanasi with love.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 md:justify-start">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-7 py-3.5 text-base font-medium text-white transition-colors hover:bg-brand-700"
            >
              Shop Now
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 rounded-lg border border-brand-600 px-7 py-3.5 text-base font-medium text-brand-600 transition-colors hover:bg-brand-50"
            >
              Our Story
            </Link>
          </div>
        </motion.div>

        {/* Image */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
          className="flex justify-center"
        >
          <img
            src={heroImg}
            alt="Zimor India premium leather workbag"
            className="w-full max-w-md rounded-2xl object-cover shadow-xl md:max-w-lg"
          />
        </motion.div>
      </div>
    </section>
  );
}
