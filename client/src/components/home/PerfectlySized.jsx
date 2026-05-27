import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import useProducts from '../../hooks/useProducts';
import { cld } from '../../lib/cloudinary';

const CATEGORIES = [
  { name: 'Shoulder Bags', slug: 'shoulder-bags' },
  { name: 'Laptop Bags', slug: 'laptop-bags' },
  { name: 'Tote Bags', slug: 'tote-bags' },
];

function CategoryCard({ name, slug, index }) {
  const { data, isLoading } = useProducts({ category: slug, limit: 1 });
  const image = data?.products?.[0]?.images?.[0]?.url;
  const count = data?.pagination?.total ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <Link to={`/shop?category=${slug}`} className="group block text-center">
        <div className="mx-auto aspect-square w-full max-w-[160px] overflow-hidden rounded-full border-4 border-white shadow-md transition-all group-hover:border-brand-300 group-hover:shadow-lg">
          {isLoading ? (
            <div className="h-full w-full animate-pulse bg-neutral-200" />
          ) : image ? (
            <img
              src={cld(image, { w: 320 })}
              alt={name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="h-full w-full bg-neutral-100" />
          )}
        </div>

        <h3 className="mt-4 text-sm font-semibold text-neutral-800 group-hover:text-brand-600 transition-colors">
          {name}
        </h3>

        {isLoading ? (
          <div className="mx-auto mt-1 h-3 w-16 animate-pulse rounded bg-neutral-200" />
        ) : (
          <p className="text-xs text-neutral-500">
            {count > 0 ? `${count} style${count !== 1 ? 's' : ''}` : 'Coming soon'}
          </p>
        )}
      </Link>
    </motion.div>
  );
}

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
          {CATEGORIES.map((cat, i) => (
            <CategoryCard key={cat.slug} {...cat} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
