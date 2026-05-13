import { motion } from 'framer-motion';
import { Heart, Gem, Users, MapPin, Star, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const values = [
  { emoji: '✨', title: 'Craftsmanship', description: 'Every bag is crafted by skilled artisans in Varanasi — blending quality materials with purposeful modern design.' },
  { emoji: '💎', title: 'Quality First', description: 'Premium full-grain leather that ages beautifully. No shortcuts, no compromises, just pure quality.' },
  { emoji: '💪', title: 'Women First', description: 'Designed by women, for women. Bags that match your ambition, your hustle, and your aesthetic.' },
  { emoji: '🌿', title: 'Sustainable', description: 'Ethically sourced materials, minimal waste production, and packaging that loves the planet.' },
];

const stats = [
  { value: '2,000+', label: 'Happy Customers' },
  { value: '50+', label: 'Artisans' },
  { value: '4.9/5', label: 'Rating' },
  { value: '100%', label: 'Handmade' },
];

const team = [
  { name: 'Priya Sharma', role: 'Founder & Designer', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80&auto=format&fit=crop' },
  { name: 'Anita Verma', role: 'Head of Production', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&q=80&auto=format&fit=crop' },
  { name: 'Kavya Singh', role: 'Creative Director', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80&auto=format&fit=crop' },
];

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* Hero with parallax-style background */}
      <section className="relative min-h-[70vh] overflow-hidden flex items-center">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80&auto=format&fit=crop"
            alt=""
            className="h-full w-full object-cover"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-block rounded-full bg-white/10 px-5 py-2 text-sm font-medium text-white/90 backdrop-blur-sm mb-6">
              Est. 2023 · Varanasi, India
            </span>
            <h1 className="font-heading text-4xl font-bold text-white sm:text-5xl lg:text-6xl leading-tight">
              We Make Bags That
              <br />
              <span className="text-brand-300">Tell Your Story</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/70 leading-relaxed">
              Zimor India was born from a simple belief — that the modern Indian woman
              deserves a workbag as refined and capable as she is.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-neutral-950 py-10">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-6 px-4 sm:grid-cols-4 sm:px-6">
          {stats.map(({ value, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <p className="text-2xl font-bold text-white sm:text-3xl">{value}</p>
              <p className="mt-1 text-xs text-neutral-400 uppercase tracking-wider">{label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Story section with side image */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-sm font-medium uppercase tracking-widest text-brand-500">Our Journey</span>
            <h2 className="mt-3 font-heading text-3xl font-bold text-neutral-900 sm:text-4xl">
              From Varanasi's Lanes to Your Hands 🤲
            </h2>
            <p className="mt-5 text-neutral-600 leading-relaxed">
              Varanasi has been a centre of textile and leather artistry for centuries.
              We partner with local artisans who bring generations of skill to every stitch.
              Each bag is a testament to patience, precision, and pride.
            </p>
            <p className="mt-4 text-neutral-600 leading-relaxed">
              We started Zimor because Indian women professionals deserved something
              unmistakably premium, thoughtfully functional, and proudly Indian. No more
              choosing between imported luxury and generic options.
            </p>
            <Link
              to="/shop"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
            >
              Explore our collection <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="overflow-hidden rounded-3xl">
              <img
                src="https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&q=80&auto=format&fit=crop"
                alt="Leather crafting"
                className="h-full w-full object-cover aspect-4/5"
              />
            </div>
            {/* Floating card */}
            <div className="absolute -bottom-6 -left-6 rounded-2xl bg-white p-4 shadow-xl border border-neutral-100">
              <div className="flex items-center gap-1 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-accent-400 text-accent-400" />
                ))}
              </div>
              <p className="text-xs text-neutral-600">"Best bag I've ever owned"</p>
              <p className="text-xs text-neutral-400 mt-0.5">— Priya, Mumbai</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-neutral-50 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <span className="text-sm font-medium uppercase tracking-widest text-brand-500">What we believe</span>
            <h2 className="mt-2 font-heading text-3xl font-bold text-neutral-900 sm:text-4xl">
              Our Values ❤️
            </h2>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {values.map(({ emoji, title, description }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-neutral-200 bg-white p-6 transition-all hover:border-brand-200 hover:shadow-md"
              >
                <span className="text-3xl">{emoji}</span>
                <h3 className="mt-3 text-base font-bold text-neutral-900">{title}</h3>
                <p className="mt-2 text-sm text-neutral-500 leading-relaxed">{description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <span className="text-sm font-medium uppercase tracking-widest text-brand-500">The people</span>
          <h2 className="mt-2 font-heading text-3xl font-bold text-neutral-900 sm:text-4xl">
            Meet the Team 👋
          </h2>
        </motion.div>

        <div className="grid gap-8 sm:grid-cols-3">
          {team.map(({ name, role, image }, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="mx-auto h-32 w-32 overflow-hidden rounded-full border-4 border-white shadow-lg">
                <img src={image} alt={name} className="h-full w-full object-cover" />
              </div>
              <h3 className="mt-4 text-base font-bold text-neutral-900">{name}</h3>
              <p className="text-sm text-neutral-500">{role}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1920&q=80&auto=format&fit=crop"
            alt=""
            className="h-full w-full object-cover"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-brand-900/80" />
        </div>
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="font-heading text-3xl font-bold text-white sm:text-4xl">
            Ready to find your perfect bag? 👜
          </h2>
          <p className="mt-4 text-brand-200">
            Join thousands of women who carry Zimor every day.
          </p>
          <Link
            to="/shop"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-semibold text-neutral-900 transition-all hover:bg-brand-50 hover:shadow-xl"
          >
            Shop Now <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
