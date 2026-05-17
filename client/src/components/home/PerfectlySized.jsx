import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const categories = [
  {
    name: 'Shoulder Bags',
    slug: 'shoulder-bags',
    images: ["./bag2.jpeg"],
    count: '12 styles',
  },
  {
    name: 'Laptop Bags',
    slug: 'laptop-bags',
    images: ["./bag3.jpeg"],
    count: '10 styles',
  },
  {
    name: 'Tote Bags',
    slug: 'tote-bags',
    images: ["./bag1.jpeg"],
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
          {categories.map(({ name, slug, images, count }, i) => (
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
                    src={images[0]}
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
