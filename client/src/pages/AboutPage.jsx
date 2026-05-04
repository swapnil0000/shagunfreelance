import { motion } from 'framer-motion';
import { Heart, Gem, Users, MapPin } from 'lucide-react';

const values = [
  {
    icon: Gem,
    title: 'Craftsmanship',
    description:
      'Every Zimor bag is handcrafted by skilled artisans in Varanasi, blending traditional techniques with modern design sensibilities.',
  },
  {
    icon: Heart,
    title: 'Quality Materials',
    description:
      'We source only premium full-grain leather and sustainable materials, ensuring each bag ages beautifully and lasts for years.',
  },
  {
    icon: Users,
    title: 'Empowering Women',
    description:
      'Zimor exists to empower women professionals with bags that match their ambition — functional, elegant, and built to perform.',
  },
  {
    icon: MapPin,
    title: 'Made in India',
    description:
      'Proudly designed and produced in Varanasi, Uttar Pradesh — supporting local artisans and celebrating Indian craftsmanship.',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative bg-brand-50 py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-heading text-4xl font-bold text-neutral-900 sm:text-5xl"
          >
            Our Story
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-6 text-lg leading-relaxed text-neutral-600"
          >
            Zimor India was born from a simple belief — that the modern Indian woman
            deserves a workbag as refined and capable as she is. Based in the historic
            city of Varanasi, we combine centuries-old leather craftsmanship with
            contemporary design to create premium bags for the professional woman.
          </motion.p>
        </div>
      </section>

      {/* Brand Story */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-heading text-3xl font-bold text-neutral-900">
              From Varanasi, With Purpose
            </h2>
            <p className="mt-4 text-neutral-600 leading-relaxed">
              Varanasi has been a centre of textile and leather artistry for centuries.
              At Zimor, we partner with local artisans who bring generations of skill to
              every stitch and cut. Our bags are not mass-produced — each one is a
              testament to patience, precision, and pride.
            </p>
            <p className="mt-4 text-neutral-600 leading-relaxed">
              We started Zimor because we saw a gap: Indian women professionals were
              choosing between imported luxury brands and generic options. We wanted to
              offer something that is unmistakably premium, thoughtfully functional, and
              proudly Indian.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="aspect-4/3 rounded-2xl bg-brand-100 flex items-center justify-center"
          >
            <span className="text-brand-400 text-sm">Brand Image</span>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-neutral-50 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-heading text-3xl font-bold text-neutral-900">
              What We Stand For
            </h2>
            <p className="mt-3 text-neutral-500">
              The principles that guide every bag we create
            </p>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value, i) => (
              <motion.div
                key={value.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="rounded-xl bg-white p-6 shadow-sm"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-100">
                  <value.icon className="h-6 w-6 text-brand-600" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-neutral-900">
                  {value.title}
                </h3>
                <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h2 className="font-heading text-3xl font-bold text-neutral-900">
          The Team Behind Zimor
        </h2>
        <p className="mt-4 text-neutral-600 leading-relaxed">
          We are a small, passionate team of designers, artisans, and dreamers based in
          Varanasi. From sourcing the finest leather to hand-finishing every detail, our
          team pours heart into each bag. We believe that when you carry a Zimor bag,
          you carry a piece of our story with you.
        </p>
      </section>
    </div>
  );
}
