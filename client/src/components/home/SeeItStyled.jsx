import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

const looks = [
  {
    title: 'Office Power',
    description: 'Command the boardroom with structured elegance',
    category: 'laptop-bags',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80&auto=format&fit=crop',
  },
  {
    title: 'Weekend Vibes',
    description: 'Effortless style for brunch and beyond',
    category: 'crossbody-bags',
    image: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=600&q=80&auto=format&fit=crop',
  },
  {
    title: 'Travel Ready',
    description: 'Spacious, chic, and always by your side',
    category: 'tote-bags',
    image: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=600&q=80&auto=format&fit=crop',
  },
];

export default function SeeItStyled() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-12 text-center"
      >
        <span className="text-sm font-medium uppercase tracking-widest text-brand-500">
          Style Inspiration
        </span>
        <h2 className="mt-2 font-heading text-3xl font-bold text-neutral-900 sm:text-4xl">
          See It Styled
        </h2>
        <p className="mt-3 text-neutral-500">
          One bag, endless possibilities
        </p>
      </motion.div>

      <div className="grid gap-5 sm:grid-cols-3">
        {looks.map(({ title, description, category, image }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <Link
              to={`/shop?category=${category}`}
              className="group relative block overflow-hidden rounded-2xl"
            >
              <div className="aspect-4/5 overflow-hidden">
                <img
                  src={image}
                  alt={title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              {/* Overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
              {/* Text */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-xl font-bold text-white">{title}</h3>
                <p className="mt-1 text-sm text-white/80">{description}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-300 group-hover:gap-2 transition-all">
                  Shop the look
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
