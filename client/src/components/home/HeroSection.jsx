import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const stats = [
  { value: '10+', label: 'Happy Customers' },
  { value: '100%', label: 'Premium Quality' },
  { value: '4.9★', label: 'Avg Rating' },
];

export default function HeroSection() {
  return (
    <section className="relative lg:h-[88vh] overflow-hidden bg-neutral-950">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen lg:h-full">

        {/* Left — Content */}
        <div className="relative flex flex-col justify-center px-8 pt-10 pb-12 sm:px-12 lg:px-14 lg:py-0 xl:px-20 order-2 lg:order-1">
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800/30 pointer-events-none" />
          <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-lg">
            {/* Brand tag */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="mb-6 inline-flex items-center gap-3"
            >
              <div className="h-px w-8 bg-white/50" />
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-white/60">
                Zimor India
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
              className="font-heading text-5xl font-bold leading-[1.05] text-white sm:text-6xl xl:text-7xl"
            >
              BUILT FOR
              <br />
              <span className="bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-transparent">
                WORK.
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut', delay: 0.22 }}
              className="mt-5 text-base leading-relaxed text-white/55 sm:text-lg"
            >
              Premium workbags designed for the modern woman —{' '}
              <span className="text-white/75">crafted in Varanasi</span> with quality that lasts.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut', delay: 0.34 }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Link
                to="/shop"
                className="group inline-flex items-center gap-2.5 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-neutral-900 shadow-lg transition-all hover:bg-neutral-100 hover:shadow-xl"
              >
                Explore Collection
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
             
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut', delay: 0.48 }}
              className="mt-10 flex items-center gap-7 border-t border-white/10 pt-8"
            >
              {stats.map((stat, i) => (
                <div key={stat.label} className="flex items-center gap-7">
                  {i > 0 && <div className="h-8 w-px bg-white/10" />}
                  <div>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="mt-0.5 text-xs tracking-wide text-white/40">{stat.label}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Right — image.png (both desktop and mobile) */}
        <motion.div
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className="relative min-h-[55vh] lg:min-h-0 lg:h-[88vh] order-1 lg:order-2 overflow-hidden"
        >
          {/* Desktop: image2.jpeg (976×1088) — contain to show full image, dark bg fills gaps */}
          <img
            src="/image2.jpeg"
            alt="Zimor India luxury workbag"
            className="hidden lg:block h-full w-full object-cover"
          />
          {/* Mobile: image.png */}
          <img
            src="/image.png"
            alt="Zimor India luxury workbag"
            className="block lg:hidden h-full w-full object-cover object-top"
          />
          {/* Blend left edge into dark content panel */}
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/60 via-neutral-950/20 to-transparent lg:from-neutral-950/70 lg:via-neutral-950/25 lg:to-transparent" />
          {/* Bottom fade */}
          <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-neutral-950/60 to-transparent" />

          {/* Floating product badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.7 }}
            className="absolute bottom-6 right-4 sm:bottom-10 sm:right-8 lg:bottom-12 lg:right-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 px-4 py-3 lg:px-5 lg:py-4 text-white shadow-xl"
          >
            <p className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest text-white/70">New Arrival</p>
            <p className="mt-0.5 lg:mt-1 font-heading text-sm lg:text-base font-semibold leading-tight">Signature Tote</p>
            <p className="mt-0.5 text-[10px] lg:text-xs text-white/50">Handcrafted · Varanasi</p>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}
