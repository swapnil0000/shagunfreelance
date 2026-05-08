import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const categories = [
  {
    name: 'Shoulder Bags',
    slug: 'shoulder-bags',
    image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&q=80&auto=format&fit=crop',
    count: '12 styles',
  },
  {
    name: 'Laptop Bags',
    slug: 'laptop-bags',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80&auto=format&fit=crop',
    count: '10 styles',
  },
  {
    name: 'Tote Bags',
    slug: 'tote-bags',
    image: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=400&q=80&auto=format&fit=crop',
    count: '8 styles',
  },
];

export default function PerfectlySized() {
  return (
    <section className="bg-neutral-50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <span className="text-sm font-medium uppercase tracking-widest text-brand-500">
            Shop by Category
          </span>
          <h2 className="mt-2 font-heading text-3xl font-bold text-neutral-900 sm:text-4xl">
            Find Your Perfect Match
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {categories.map(({ name, slug, image, count }, i) => (
            <motion.div
              key={slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <Link
                to={`/shop?category=${slug}`}
                className="group block text-center"
              >
                <div className="mx-auto aspect-square w-full max-w-[160px] overflow-hidden rounded-full border-4 border-white shadow-md transition-all group-hover:border-brand-300 group-hover:shadow-lg">
                  <img
                    src={image}
                    alt={name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-neutral-800 group-hover:text-brand-600 transition-colors">
                  {name}
                </h3>
                <p className="text-xs text-neutral-500">{count}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
