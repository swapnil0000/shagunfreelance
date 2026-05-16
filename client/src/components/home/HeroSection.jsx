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
    <section className="relative min-h-[80vh] lg:min-h-screen overflow-hidden bg-neutral-950">

      {/* ── DESKTOP: hero.jpeg full-bleed background ── */}
      <div className="hidden lg:block absolute inset-0 z-0">
        <img
          src="/hero.jpeg"
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover"
          style={{ objectPosition: '75% center' }}
        />
        {/* Left-to-right gradient so text stays readable */}
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/95 via-neutral-950/75 to-neutral-950/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/60 via-transparent to-transparent" />
      </div>

      {/* ── MOBILE: image.png stacked above content ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative lg:hidden overflow-hidden"
        style={{ height: '52vh' }}
      >
        <img
          src="/image.png"
          alt="Zimor India luxury workbag"
          className="h-full w-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-neutral-950/80" />
        {/* Mobile badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="absolute bottom-4 right-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 px-4 py-3 text-white"
        >
          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/70">New Arrival</p>
          <p className="mt-0.5 font-heading text-sm font-semibold leading-tight">Signature Tote</p>
          <p className="mt-0.5 text-[10px] text-white/50">Handcrafted · Varanasi</p>
        </motion.div>
      </motion.div>

      {/* ── CONTENT: shared, desktop overlaid / mobile below image ── */}
      <div className="relative z-10 lg:absolute lg:inset-0 lg:flex lg:items-center">
        <div className="w-full max-w-7xl mx-auto px-8 pt-10 pb-12 sm:px-12 lg:px-14 xl:px-20 lg:py-0">
          <div className="max-w-lg lg:-mt-10">

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
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-3.5 text-sm font-medium text-white/75 backdrop-blur-sm transition-all hover:border-white/40 hover:bg-white/8 hover:text-white"
              >
                View All Bags
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
      </div>

      {/* ── DESKTOP: floating badge pinned bottom-right ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.7 }}
        className="hidden lg:block absolute bottom-12 right-12 z-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 px-5 py-4 text-white shadow-xl"
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-white/70">New Arrival</p>
        <p className="mt-1 font-heading text-base font-semibold leading-tight">Signature Tote</p>
        <p className="mt-0.5 text-xs text-white/50">Handcrafted · Varanasi</p>
      </motion.div>

    </section>
  );
}
