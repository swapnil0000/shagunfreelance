import { motion } from 'framer-motion';
import { Ruler, Briefcase, Laptop } from 'lucide-react';

const sizes = [
  {
    icon: Briefcase,
    name: 'Compact',
    dimensions: '28 × 20 × 10 cm',
    fits: 'Essentials, tablet, wallet',
  },
  {
    icon: Laptop,
    name: 'Standard',
    dimensions: '38 × 28 × 12 cm',
    fits: '14" laptop, documents, accessories',
  },
  {
    icon: Ruler,
    name: 'Spacious',
    dimensions: '42 × 32 × 15 cm',
    fits: '16" laptop, gym kit, lunch box',
  },
];

export default function PerfectlySized() {
  return (
    <section className="bg-brand-50/50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="font-heading text-3xl font-bold text-neutral-900">
            Perfectly Sized for Your Day
          </h2>
          <p className="mt-2 text-neutral-500">
            From quick meetings to full work days — there's a Zimor for every occasion
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {sizes.map(({ icon: Icon, name, dimensions, fits }, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="rounded-xl border border-neutral-200 bg-white p-6 text-center shadow-sm"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-brand-600">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-800">{name}</h3>
              <p className="mt-1 text-sm font-medium text-brand-600">{dimensions}</p>
              <p className="mt-2 text-sm text-neutral-500">Fits: {fits}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
