import { motion } from 'framer-motion';
import { Truck, ShieldCheck, Gem, RefreshCw, Sparkles } from 'lucide-react';

const usps = [
  { icon: Truck, title: 'Free Shipping', description: 'On all orders', emoji: '🚚' },
  { icon: Gem, title: 'Handcrafted', description: 'Premium leather', emoji: '💎' },
  { icon: RefreshCw, title: '7-Day Returns', description: 'No questions asked', emoji: '↩️' },
  { icon: ShieldCheck, title: 'Secure Pay', description: 'Razorpay protected', emoji: '🔒' },
];

export default function USPBar() {
  return (
    <section className="relative bg-white py-12 overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
          {usps.map(({ icon: Icon, title, description, emoji }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="group flex flex-col items-center text-center rounded-2xl border border-neutral-100 bg-neutral-50/50 p-5 transition-all hover:border-brand-200 hover:bg-brand-50/30 hover:shadow-sm"
            >
              <span className="text-2xl mb-2">{emoji}</span>
              <p className="text-sm font-bold text-neutral-800">{title}</p>
              <p className="mt-0.5 text-xs text-neutral-500">{description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
