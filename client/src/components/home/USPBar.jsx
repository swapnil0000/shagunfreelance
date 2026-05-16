import { motion } from 'framer-motion';
import { Truck, ShieldCheck, Gem, RefreshCw } from 'lucide-react';

const usps = [
  {
    icon: Truck,
    title: 'Free Shipping',
    description: 'On every order, always',
    color: 'bg-neutral-100 text-neutral-700',
    border: 'hover:border-neutral-300',
  },
  {
    icon: Gem,
    title: 'Premium Quality',
    description: 'Materials built to last',
    color: 'bg-neutral-900 text-white',
    border: 'hover:border-neutral-700',
  },
  {
    icon: RefreshCw,
    title: '7-Day Returns',
    description: 'No questions asked',
    color: 'bg-neutral-100 text-neutral-700',
    border: 'hover:border-neutral-300',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Payments',
    description: 'Protected by Razorpay',
    color: 'bg-neutral-100 text-neutral-700',
    border: 'hover:border-neutral-300',
  },
];

export default function USPBar() {
  return (
    <section className="bg-white py-10 sm:py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
          {usps.map(({ icon: Icon, title, description, color, border }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className={`group flex flex-col items-center gap-3 rounded-2xl border border-neutral-100 bg-white p-5 text-center shadow-sm transition-all duration-200 hover:shadow-md ${border}`}
            >
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${color} transition-transform duration-200 group-hover:scale-110`}>
                <Icon className="h-5 w-5" strokeWidth={1.8} />
              </div>
              <div>
                <p className="text-sm font-bold text-neutral-900">{title}</p>
                <p className="mt-0.5 text-xs text-neutral-500 leading-relaxed">{description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
