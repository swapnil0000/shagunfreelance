import { motion } from 'framer-motion';
import { ArrowRight, MoveDown, Laptop, SlidersHorizontal, Leaf, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const stats = [
  { value: '2,000+', label: 'Bags Delivered' },
  { value: '50+', label: 'Artisans' },
  { value: '4.9★', label: 'Customer Rating' },
  { value: '100%', label: 'Handcrafted' },
];

const features = [
  {
    icon: Laptop,
    title: 'Laptop-Ready Interior',
    description: 'Padded sleeve fits up to 15″ laptops — no more juggling a separate bag.',
  },
  {
    icon: SlidersHorizontal,
    title: 'Adjustable Straps',
    description: 'Switch from shoulder to crossbody in seconds. Your bag, your way.',
  },
  {
    icon: Sparkles,
    title: 'Ages Beautifully',
    description: 'Full-grain leather develops a rich patina. Looks better at year five than day one.',
  },
  {
    icon: Leaf,
    title: 'Sustainably Made',
    description: 'Ethically sourced leather, minimal waste, eco-friendly packaging.',
  },
];

const values = [
  {
    number: '01',
    title: 'Crafted by Hand',
    description:
      'Every stitch, every buckle, every seam is done by artisan hands in Varanasi — a city whose leather craft tradition spans centuries.',
  },
  {
    number: '02',
    title: 'Built to Last',
    description:
      'We use only full-grain leather — the strongest, most beautiful cut. No shortcuts, no synthetic linings, no compromises.',
  },
  {
    number: '03',
    title: 'Designed for Women',
    description:
      'Created by women who carry bags every day. Every pocket, strap, and clasp is placed where it actually makes sense.',
  },
  {
    number: '04',
    title: 'Proudly Indian',
    description:
      'Made in Varanasi. Fair wages for our artisans. Premium quality that competes with — and beats — imported luxury.',
  },
];

const milestones = [
  {
    year: '2023',
    text: 'First collection launched — 3 shoulder bag styles, handcrafted in Varanasi. Sold out in 3 days.',
  },
  {
    year: '2024',
    text: 'Added totes and mini bags. Reached 1,000 happy customers across 15 Indian cities.',
  },
  {
    year: '2025',
    text: '2,000+ bags delivered. Expanding into new leather finishes and sustainable lining fabrics.',
  },
];

const team = [
  {
    name: 'Priya Sharma',
    role: 'Founder & Head Designer',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80&auto=format&fit=crop',
  },
  {
    name: 'Anita Verma',
    role: 'Head of Production',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80&auto=format&fit=crop',
  },
  {
    name: 'Kavya Singh',
    role: 'Creative Director',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80&auto=format&fit=crop',
  },
];

const reviews = [
  { text: '"The strap quality is incredible. Wore it all day — zero discomfort."', author: 'Neha, Delhi' },
  { text: '"Finally a bag that fits my laptop AND looks stunning."', author: 'Riya, Bangalore' },
  { text: '"Gets better with every use. Worth every rupee."', author: 'Sneha, Pune' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.1 },
  }),
};

export default function AboutPage() {
  return (
    <div className="bg-white overflow-x-hidden">

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col justify-end">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1920&q=80&auto=format&fit=crop"
            alt="Woman with Zimor shoulder bag"
            className="h-full w-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/50 to-neutral-950/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/60 to-transparent" />
        </div>

        {/* Vertical decorative label */}
        <div className="absolute top-1/3 right-8 -translate-y-1/2 hidden md:flex flex-col items-center gap-3">
          <div className="h-16 w-px bg-white/20" />
          <span
            className="text-[10px] font-semibold tracking-[0.35em] text-white/40 uppercase"
            style={{ writingMode: 'vertical-rl' }}
          >
            Varanasi · Est. 2023
          </span>
          <div className="h-16 w-px bg-white/20" />
        </div>

        <div className="relative mx-auto w-full max-w-6xl px-6 pb-20 pt-40 sm:px-10 lg:px-16">
          <motion.div initial="hidden" animate="show" variants={fadeUp}>

            {/* Badge */}
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-400/40 bg-brand-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-brand-300 mb-7 backdrop-blur-sm">
              <Sparkles className="h-3 w-3 shrink-0" />
              Hand &amp; Shoulder Bags · Made in India
            </span>

            {/* Heading */}
            <h1 className="font-heading text-5xl font-bold text-white sm:text-6xl lg:text-7xl xl:text-[5.5rem] leading-[1.02] max-w-2xl">
              Carry It.
              <br />
              <span className="italic text-brand-300 underline decoration-brand-500/50 decoration-2 underline-offset-8">
                Own Every
              </span>
              <br />
              Room.
            </h1>

            {/* Decorative rule */}
            <div className="mt-7 w-10 h-[2px] rounded-full bg-brand-500" />

            {/* Subtitle */}
            <p className="mt-4 max-w-sm text-base text-white/60 leading-relaxed">
              Zimor crafts premium leather hand bags and shoulder bags for women who mean business — and still want to look stunning doing it.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-brand-400 hover:gap-3 shadow-lg shadow-brand-900/40"
              >
                Shop Bags <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#story"
                className="inline-flex items-center gap-2 text-sm font-medium text-white/50 hover:text-white transition-colors"
              >
                <MoveDown className="h-4 w-4 animate-bounce" /> Our Story
              </a>
            </div>

            {/* Trust line */}
            <p className="mt-5 flex items-center gap-1.5 text-[11px] text-white/30">
              <span className="text-accent-400 tracking-tight">★★★★★</span>
              <span className="mx-1 text-white/15">·</span>
              4.9 rated
              <span className="mx-1 text-white/15">·</span>
              2,000+ bags delivered
              <span className="mx-1 text-white/15">·</span>
              Handcrafted in Varanasi
            </p>

          </motion.div>
        </div>

        {/* Stats strip */}
        <div className="relative border-t border-white/10 bg-white/5 backdrop-blur-md">
          <div className="mx-auto grid max-w-4xl grid-cols-2 sm:grid-cols-4 divide-x divide-white/10">
            {stats.map(({ value, label }, i) => (
              <motion.div
                key={label}
                custom={i}
                initial="hidden"
                animate="show"
                variants={fadeUp}
                className="px-6 py-5 text-center"
              >
                <p className="text-xl font-bold text-white sm:text-2xl">{value}</p>
                <p className="mt-0.5 text-[10px] uppercase tracking-widest text-white/40">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHAT MAKES OUR BAGS DIFFERENT ── */}
      <section className="bg-brand-50 py-16">
        <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-16">
          <motion.p
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center text-xs font-semibold uppercase tracking-[0.25em] text-brand-500 mb-10"
          >
            What makes Zimor bags different
          </motion.p>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, description }, i) => (
              <motion.div
                key={title}
                custom={i}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={fadeUp}
                className="flex flex-col gap-3 rounded-2xl bg-white border border-brand-100 p-6 hover:shadow-md hover:border-brand-200 transition-all"
              >
                <div className="h-10 w-10 rounded-xl bg-brand-100 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-brand-600" />
                </div>
                <h3 className="text-sm font-bold text-neutral-900">{title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STORY ── */}
      <section id="story" className="mx-auto max-w-6xl px-6 py-24 sm:px-10 lg:px-16">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-start">

          {/* Left */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-500">Our Story</span>
            <h2 className="mt-3 font-heading text-4xl font-bold text-neutral-900 sm:text-5xl leading-tight">
              From Varanasi's
              <br />
              <span className="italic text-brand-600">Craft Lanes</span>
              <br />
              to Your Shoulder.
            </h2>

            <p className="mt-6 text-neutral-600 leading-relaxed max-w-md">
              We started Zimor with one question: why should Indian women choose between an overpriced import and a generic local bag? There had to be a better answer.
            </p>
            <p className="mt-4 text-neutral-600 leading-relaxed max-w-md">
              The answer was Varanasi — a city whose leather artisans have been perfecting their craft for generations. We partnered with them to build bags that are unmistakably premium, thoughtfully designed, and proudly Indian.
            </p>

            {/* Timeline */}
            <div className="mt-10">
              {milestones.map(({ year, text }, i) => (
                <motion.div
                  key={year}
                  custom={i}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  className="flex gap-5"
                >
                  <div className="flex flex-col items-center">
                    <div className="mt-1.5 h-2.5 w-2.5 rounded-full bg-brand-500 ring-4 ring-brand-100 shrink-0" />
                    {i < milestones.length - 1 && (
                      <div className="w-px flex-1 bg-brand-100 my-1 min-h-[28px]" />
                    )}
                  </div>
                  <div className="pb-7">
                    <span className="text-xs font-bold uppercase tracking-widest text-brand-500">{year}</span>
                    <p className="mt-0.5 text-sm text-neutral-600 leading-relaxed">{text}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <Link
              to="/shop"
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors hover:gap-3"
            >
              See all bags <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>

          {/* Right — image with frame + review card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative lg:sticky lg:top-24"
          >
            <div className="absolute inset-0 translate-x-4 translate-y-4 rounded-3xl border-2 border-brand-200" />
            <div className="relative overflow-hidden rounded-3xl bg-neutral-100">
              <img
                src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=700&q=80&auto=format&fit=crop"
                alt="Woman carrying Zimor shoulder bag"
                className="w-full object-cover aspect-[4/5]"
              />
            </div>

            {/* Floating review */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.45 }}
              className="absolute -bottom-5 -left-5 rounded-2xl bg-white p-4 shadow-2xl border border-neutral-100 max-w-[210px]"
            >
              <div className="flex gap-0.5 mb-2">
                {[...Array(5)].map((_, j) => (
                  <svg key={j} className="h-3 w-3 fill-accent-400" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-xs font-medium text-neutral-700 leading-snug">
                "Fits my laptop, phone, and still looks chic."
              </p>
              <p className="mt-1 text-[10px] text-neutral-400">— Riya, Bangalore</p>
            </motion.div>
          </motion.div>

        </div>
      </section>

      {/* ── CUSTOMER LOVE ── */}
      <section className="bg-brand-50 py-16">
        <div className="mx-auto max-w-5xl px-6 sm:px-10 lg:px-16">
          <motion.p
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center text-xs font-semibold uppercase tracking-[0.25em] text-brand-500 mb-10"
          >
            What our customers say
          </motion.p>
          <div className="grid gap-4 sm:grid-cols-3">
            {reviews.map(({ text, author }, i) => (
              <motion.div
                key={author}
                custom={i}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={fadeUp}
                className="rounded-2xl bg-white border border-brand-100 p-6"
              >
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, j) => (
                    <svg key={j} className="h-3.5 w-3.5 fill-accent-400" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-neutral-700 leading-relaxed font-medium">{text}</p>
                <p className="mt-3 text-xs text-neutral-400">— {author}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section className="bg-neutral-950 py-24">
        <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-16">
          <div className="grid gap-16 lg:grid-cols-[1fr_2fr] lg:items-start">

            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={fadeUp}
              className="lg:sticky lg:top-24"
            >
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-400">
                Our Principles
              </span>
              <h2 className="mt-3 font-heading text-4xl font-bold text-white sm:text-5xl leading-tight">
                Why Women
                <br />
                <span className="italic text-brand-300">Choose Zimor.</span>
              </h2>
              <p className="mt-4 text-sm text-neutral-400 max-w-xs leading-relaxed">
                Four non-negotiables that guide every bag we design, every stitch we make, every order we ship.
              </p>
            </motion.div>

            <div className="divide-y divide-white/10">
              {values.map(({ number, title, description }, i) => (
                <motion.div
                  key={title}
                  custom={i}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  className="group flex gap-6 py-8 first:pt-0 last:pb-0"
                >
                  <span className="text-4xl font-bold text-brand-800 font-heading shrink-0 leading-none mt-1">
                    {number}
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-brand-300 transition-colors">
                      {title}
                    </h3>
                    <p className="mt-2 text-sm text-neutral-400 leading-relaxed max-w-sm">
                      {description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ── TEAM ── */}
      <section className="mx-auto max-w-6xl px-6 py-1 sm:px-10 lg:px-16">
        {/* <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
          className="mb-14"
        >
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-500">
            The People Behind the Bags
          </span>
          <h2 className="mt-2 font-heading text-4xl font-bold text-neutral-900 sm:text-5xl leading-tight">
            Meet the <span className="italic text-brand-600">Team.</span>
          </h2>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-3">
          {team.map(({ name, role, image }, i) => (
            <motion.div
              key={name}
              custom={i}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={fadeUp}
              className="group"
            >
              <div className="overflow-hidden rounded-2xl bg-neutral-100 aspect-[3/4]">
                <img
                  src={image}
                  alt={name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <h3 className="text-base font-bold text-neutral-900">{name}</h3>
                  <p className="text-sm text-neutral-500">{role}</p>
                </div>
                <div className="h-8 w-8 rounded-full border border-brand-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <ArrowRight className="h-3.5 w-3.5 text-brand-500" />
                </div>
              </div>
            </motion.div>
          ))}
        </div> */}
      </section>

      {/* ── CTA ── */}
      <section className="mx-6 mb-16 sm:mx-10 lg:mx-16 overflow-hidden rounded-3xl relative">
        <img
          src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1920&q=80&auto=format&fit=crop"
          alt="Women with handbags"
          className="absolute inset-0 h-full w-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/90 via-neutral-950/70 to-neutral-950/30" />

        <div className="relative px-8 py-20 sm:px-16 sm:py-28 lg:px-24">
          <div className="max-w-lg">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={fadeUp}
            >
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-300 mb-5 block">
                Your next favourite bag is waiting
              </span>
              <h2 className="font-heading text-4xl font-bold text-white sm:text-5xl leading-tight">
                Find the bag
                <br />
                <span className="italic text-brand-300">made for you.</span>
              </h2>
              <p className="mt-5 text-white/60 text-sm leading-relaxed max-w-xs">
                Hand bags, shoulder bags, totes — all handcrafted in Varanasi and delivered to your door.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-bold text-neutral-900 transition-all hover:bg-brand-50 hover:gap-3 hover:shadow-2xl"
                >
                  Shop All Bags <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 px-8 py-4 text-sm font-medium text-white/80 transition-all hover:border-white/60 hover:text-white backdrop-blur-sm"
                >
                  Ask Us Anything
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

    </div>
  );
}
