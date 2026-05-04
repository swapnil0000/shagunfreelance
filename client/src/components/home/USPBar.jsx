import { Truck, ShieldCheck, Gem, RefreshCw } from 'lucide-react';

const usps = [
  {
    icon: Truck,
    title: 'Free Shipping',
    description: 'On orders above ₹999',
  },
  {
    icon: Gem,
    title: 'Premium Quality',
    description: 'Handcrafted leather',
  },
  {
    icon: RefreshCw,
    title: 'Easy Returns',
    description: '7-day return policy',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Payments',
    description: 'Razorpay protected',
  },
];

export default function USPBar() {
  return (
    <section className="border-y border-neutral-200 bg-neutral-50">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-8 sm:px-6 md:grid-cols-4 lg:px-8">
        {usps.map(({ icon: Icon, title, description }) => (
          <div key={title} className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-800">{title}</p>
              <p className="text-xs text-neutral-500">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
