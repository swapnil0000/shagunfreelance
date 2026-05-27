import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Star, ShieldCheck, Truck } from 'lucide-react';

const TICKER = [
  'Premium Workbags', 'Premium Material', 'Free Shipping All Orders',
  'Handmade with Love', 'Premium Workbags', 'Premium Material',
  'Free Shipping All Orders', 'Handmade with Love',
];

const stats = [
  { value: '10+', label: 'Happy Customers' },
  { value: '100%', label: 'Premium Quality' },
  { value: '4.9★', label: 'Avg Rating' },
];

const float = (delay = 0, y = 10) => ({
  animate: { y: [0, -y, 0] },
  transition: { duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay },
});

export default function HeroSection() {
  return (
    <section className="overflow-hidden bg-neutral-950">

      {/* ── DESKTOP: split left / right ── */}
      <div className="hidden lg:grid lg:grid-cols-2 h-[88vh] min-h-[640px]">

        {/* ── LEFT: content panel ── */}
        <div className="relative flex flex-col justify-between bg-neutral-950 px-14 py-10 xl:px-20 overflow-hidden">

          {/* Decorative: large watermark year */}
          <div
            aria-hidden
            className="pointer-events-none select-none absolute -bottom-6 -left-4 text-[180px] font-black leading-none text-white/[0.03]"
          >
            ZIMOR
          </div>

          {/* Decorative: right-edge divider line */}
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
            className="absolute right-0 top-0 h-full w-px origin-top bg-gradient-to-b from-transparent via-white/10 to-transparent"
          />

          {/* ── Top bar ── */}
          <div className="relative z-10 flex items-center justify-between">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.28em] text-white/30"
            >
              {/* <span className="h-px w-6 bg-white/20 block" /> */}
             
            </motion.p>

            {/* <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.6 }}
              className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1.5"
            >
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="h-2.5 w-2.5 fill-white text-white" />
              ))}
              <span className="ml-1.5 text-[11px] font-semibold text-white">4.9</span>
            </motion.div> */}
          </div>

          {/* ── Center: headline + subtitle + CTAs ── */}
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-5 flex items-center gap-3"
            >
              <div className="h-px w-8 bg-white/40" />
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-white/50">
                Zimor India
              </span>
            </motion.div>

            <div className="overflow-hidden">
              <motion.h1
                initial={{ y: 80 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                className="font-heading font-black leading-[0.88] text-white"
                style={{ fontSize: 'clamp(60px, 6vw, 96px)' }}
              >
                BUILT
                <br />
                FOR
                <br />
                <span className="bg-gradient-to-b from-white to-neutral-500 bg-clip-text text-transparent">
                  WORK.
                </span>
              </motion.h1>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut', delay: 0.3 }}
              className="mt-5 max-w-[300px] text-[15px] leading-relaxed text-white/50"
            >
              PREMIUM WOMEN’S WORK BAGS 
              <span className="text-white/80"> • MADE IN INDIA</span>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut', delay: 0.44 }}
              className="mt-8 flex items-center gap-5"
            >
              <Link
                to="/shop"
                className="group inline-flex items-center gap-2.5 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-neutral-900 shadow-xl transition-all hover:bg-neutral-100 hover:scale-[1.03] hover:shadow-2xl"
              >
                Shop Collection
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link to="/shop" className="text-sm font-medium text-white/40 transition-colors hover:text-white/70">
                View all →
              </Link>
            </motion.div>

            {/* Trust pills */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.58 }}
              className="mt-6 flex items-center gap-3"
            >
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-white/50">
                <ShieldCheck className="h-3 w-3" /> Secure Payments
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-white/50">
                <Truck className="h-3 w-3" /> Free Shipping
              </span>
            </motion.div>
          </div>

          {/* ── Bottom: stats ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.62 }}
            className="relative z-10 flex items-center gap-8 border-t border-white/10 pt-6"
          >
            {stats.map((stat, i) => (
              <div key={stat.label} className="flex items-center gap-8">
                {i > 0 && <div className="h-7 w-px bg-white/10" />}
                <div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="mt-0.5 text-[11px] uppercase tracking-wider text-white/35">{stat.label}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── RIGHT: image panel with floating UI ── */}
        <motion.div
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="relative overflow-hidden bg-neutral-950"
        >
          {/* Bag image */}
          <img
            src="/image.jpg"
            alt="Zimor India luxury workbag"
            width="1080"
            height="1448"
            fetchpriority="high"
            decoding="async"
            className="h-full w-full object-cover object-top"
          />

          {/* Left-edge blend */}
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/80 via-neutral-950/25 to-transparent" />
          {/* Bottom fade */}
          <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-neutral-950/80 to-transparent" />
          {/* Subtle top fade */}
          <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-neutral-950/40 to-transparent" />

          {/* ── Floating: "New Collection" pill — top right ── */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            {...float(0, 6)}
            className="absolute top-8 right-8"
          >
            <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-4 py-2 backdrop-blur-md shadow-lg">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/60 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-widest text-white">New Collection</span>
            </div>
          </motion.div>

          {/* ── Floating: review card — middle right ── */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.1, duration: 0.6 }}
            {...float(0.5, 8)}
            className="absolute top-[38%] right-7"
          >
            <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md px-4 py-3.5 shadow-xl max-w-[180px]">
              <div className="flex gap-0.5 mb-2">
                {[1,2,3,4,5].map(i => <Star key={i} className="h-3 w-3 fill-white text-white" />)}
              </div>
              <p className="text-xs font-medium text-white leading-snug">"Perfect for work, gets compliments every day!"</p>
              <p className="mt-1.5 text-[10px] text-white/40">— Priya S., Mumbai</p>
            </div>
          </motion.div>

          {/* ── Floating: product info card — bottom right ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            {...float(1, 6)}
            className="absolute bottom-10 right-8"
          >
            <div className="rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white backdrop-blur-md shadow-xl">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/50">New Arrival</p>
              <p className="mt-1 font-heading text-sm font-bold">Signature Tote</p>
              <p className="mt-0.5 text-[11px] text-white/40">Premium Material</p>
              <div className="mt-2.5 pt-2.5 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs font-bold text-white">₹2,499</span>
                <span className="text-[10px] text-white/40 line-through">₹3,499</span>
              </div>
            </div>
          </motion.div>

        </motion.div>
      </div>

      {/* ── Scrolling ticker (desktop only) ── */}
      <div className="hidden lg:flex overflow-hidden border-t border-white/8 bg-white/[0.03] py-3">
        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 28, ease: 'linear', repeat: Infinity }}
          className="flex shrink-0 whitespace-nowrap"
        >
          {[...TICKER, ...TICKER].map((item, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-5 px-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/25"
            >
              {item}
              <span className="text-white/15">◆</span>
            </span>
          ))}
        </motion.div>
      </div>

      {/* ── MOBILE: stacked ── */}
      <div className="lg:hidden">
        <div
          className="relative overflow-hidden"
          style={{ height: '560px', maxHeight: '560px', minHeight: '260px' }}
        >
          <img
            src="/image.jpg"
            alt="Zimor India luxury workbag"
            width="1080"
            height="1448"
            fetchpriority="high"
            decoding="async"
            className="h-full w-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/20 via-transparent to-neutral-950/80" />

          {/* <div className="absolute top-4 left-4 flex items-center gap-2">
            <div className="h-px w-5 bg-white/40" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-white/60">Zimor India</span>
          </div> */}

          <div className="absolute bottom-4 right-4 rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 backdrop-blur-sm text-white">
            <p className="text-[9px] font-semibold uppercase tracking-widest text-white/50">New Arrival</p>
            <p className="mt-0.5 text-xs font-semibold">Signature Tote</p>
            <p className="text-[9px] text-white/40">Premium Material</p>
          </div>
        </div>

        <div className="bg-neutral-950 px-8 pt-10 pb-14 sm:px-12">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="font-heading text-[52px] font-black leading-[0.88] text-white sm:text-[64px]"
          >
            BUILT<br />FOR<br />
            <span className="bg-gradient-to-b from-white to-neutral-500 bg-clip-text text-transparent">
              WORK.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-5 text-sm leading-relaxed text-white/50 sm:text-base"
          >
            PREMIUM WOMEN’S WORK BAGS <br/>
            <span className="text-white/80"> • MADE IN INDIA </span> 
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.27 }}
            className="mt-7"
          >
            <Link
              to="/shop"
              className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-neutral-900 shadow-lg transition-all hover:bg-neutral-100"
            >
              Shop Collection
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.38 }}
            className="mt-8 flex items-center gap-6 border-t border-white/10 pt-7"
          >
            {stats.map((stat, i) => (
              <div key={stat.label} className="flex items-center gap-6">
                {i > 0 && <div className="h-7 w-px bg-white/10" />}
                <div>
                  <p className="text-xl font-bold text-white">{stat.value}</p>
                  <p className="mt-0.5 text-[11px] uppercase tracking-wide text-white/35">{stat.label}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

    </section>
  );
}
