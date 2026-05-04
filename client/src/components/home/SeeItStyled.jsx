import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const looks = [
  {
    title: 'Office Ready',
    description: 'Pair with tailored trousers and a crisp blazer',
    category: 'laptop-bags',
    gradient: 'from-brand-200 to-brand-100',
  },
  {
    title: 'Weekend Brunch',
    description: 'Effortless style with a flowy dress',
    category: 'crossbody-bags',
    gradient: 'from-accent-200 to-accent-100',
  },
  {
    title: 'Travel Chic',
    description: 'Spacious enough for your on-the-go essentials',
    category: 'tote-bags',
    gradient: 'from-neutral-200 to-neutral-100',
  },
];

export default function SeeItStyled() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h2 className="font-heading text-3xl font-bold text-neutral-900">
          See It Styled
        </h2>
        <p className="mt-2 text-neutral-500">
          Inspiration for every occasion
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        {looks.map(({ title, description, category, gradient }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <Link
              to={`/shop?category=${category}`}
              className={`group block rounded-xl bg-linear-to-br ${gradient} p-8 transition-shadow hover:shadow-md`}
            >
              <h3 className="text-xl font-semibold text-neutral-800 group-hover:text-brand-700 transition-colors">
                {title}
              </h3>
              <p className="mt-2 text-sm text-neutral-600">{description}</p>
              <span className="mt-4 inline-block text-sm font-medium text-brand-600 group-hover:underline">
                Shop the look →
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
