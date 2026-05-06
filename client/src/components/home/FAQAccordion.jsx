import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import Accordion from '../ui/Accordion';

const faqs = [
  {
    title: 'What materials are Zimor bags made from?',
    content: 'All Zimor bags are handcrafted from premium full-grain leather sourced from trusted Indian tanneries. We use vegetable-tanned leather for durability and a beautiful natural patina over time.',
  },
  {
    title: 'How long does shipping take?',
    content: "We ship across India within 5–7 business days. Orders above ₹999 qualify for free shipping. You'll receive tracking details via email once your order is dispatched.",
  },
  {
    title: 'What is your return policy?',
    content: 'We offer a 7-day return policy from the date of delivery. Items must be unused and in original packaging. Contact us at support@zimorindia.com to initiate a return.',
  },
  {
    title: 'Do you offer international shipping?',
    content: "Currently we ship only within India. We're working on expanding to international markets soon. Subscribe to our newsletter for updates!",
  },
  {
    title: 'How do I care for my leather bag?',
    content: 'Keep your bag away from direct sunlight and moisture. Use a soft cloth to wipe it clean. We recommend applying a leather conditioner every 3–6 months to maintain its suppleness.',
  },
  {
    title: 'Can I track my order?',
    content: "Yes! Once your order is shipped, you'll receive an email with tracking details. You can also check your order status anytime from your account dashboard.",
  },
];

export default function FAQAccordion() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-10 text-center"
      >
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50">
          <HelpCircle className="h-6 w-6 text-brand-600" />
        </div>
        <h2 className="font-heading text-3xl font-bold text-neutral-900">
          Got Questions? 🤔
        </h2>
        <p className="mt-2 text-neutral-500">
          Everything you need to know about Zimor bags
        </p>
      </motion.div>
      <Accordion items={faqs} />
    </section>
  );
}
