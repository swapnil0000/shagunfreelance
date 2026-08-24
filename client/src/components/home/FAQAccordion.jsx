import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import Accordion from '../ui/Accordion';

const faqs = [
  {
    title: 'Is Zimor a genuine brand?',
    content: 'Yes! We are committed to providing authentic products, secure payments, and transparent customer support.',
  },
  {
    title: 'How can I trust my order will arrive?',
    content: 'Every order is processed carefully, and tracking details are shared once your package is dispatched.',
  },
  {
    title: 'Do you offer customer support?',
    content: 'Absolutely. Our team is available to answer your questions before and after purchase.',
  },
  {
    title: 'What if I receive a damaged or wrong item?',
    content: "We'll make it right. Simply contact us with your order details, and our team will assist you promptly.",
  },
  {
    title: 'Are payments secure?',
    content: 'Yes, all payments are processed through secure and trusted payment gateways.',
  },
  {
    title: 'Why do customers choose Zimor?',
    content: 'Quality products, transparent service, and customer satisfaction are at the heart of everything we do.',
  },
  {
    title: 'Can I contact you before ordering?',
    content: "Of course! Feel free to DM us anytime—we're happy to help you make the right choice.",
  },
  {
    title: 'How long does delivery take?',
    content: 'Orders are usually delivered within 4–7 business days, depending on your location.',
  },
  {
    title: 'When will my order be shipped?',
    content: "We process and dispatch orders within 2–3 business days. You'll receive a tracking link as soon as your order ships.",
  },
  {
    title: 'What if my order is delayed?',
    content: 'Sometimes deliveries may take a little longer due to weather, holidays, or courier delays. If that happens, our support team is here to help.',
  },
  {
    title: 'Can I change my shipping address after placing an order?',
    content: "If your order hasn't been dispatched yet, contact us as soon as possible and we'll do our best to update the address.",
  },
  {
    title: 'What if I miss my delivery?',
    content: "The courier will usually attempt delivery again. If you need assistance, just reach out to us and we'll help coordinate with the courier.",
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
