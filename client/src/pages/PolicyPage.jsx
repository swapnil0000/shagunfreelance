import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

const policies = {
  shipping: {
    title: 'Shipping Policy',
    content: [
      {
        heading: 'Delivery Timelines',
        text: 'We ship across India within 5–7 business days from the date of order confirmation. During festive seasons or sales, delivery may take an additional 2–3 days.',
      },
      {
        heading: 'Tracking Your Order',
        text: 'Once your order is dispatched, you will receive an email and SMS with tracking details. You can also track your order from your account dashboard.',
      },
      {
        heading: 'Shipping Partners',
        text: 'We partner with trusted logistics providers to ensure your Zimor bag reaches you safely and on time. All shipments are insured against transit damage.',
      },
    ],
  },
  returns: {
    title: 'Returns & Exchanges',
    content: [
      {
        heading: 'Return Window',
        text: 'We offer a 7-day return window from the date of delivery. Items must be unused, unworn, and in their original packaging with all tags attached.',
      },
      {
        heading: 'How to Initiate a Return',
        text: 'To initiate a return, email us at support@zimorindia.com with your order number and reason for return. Our team will guide you through the process.',
      },
      {
        heading: 'Refund Process',
        text: 'Once we receive and inspect the returned item, refunds are processed within 5–7 business days to your original payment method. COD orders are refunded via bank transfer.',
      },
      {
        heading: 'Exchanges',
        text: 'We currently do not offer direct exchanges. Please initiate a return and place a new order for the desired item.',
      },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    content: [
      {
        heading: 'Information We Collect',
        text: 'We collect personal information you provide during registration, checkout, and contact form submissions — including your name, email, phone number, and shipping address.',
      },
      {
        heading: 'How We Use Your Information',
        text: 'Your information is used to process orders, communicate updates, improve our services, and send promotional content (only with your consent). We never sell your data to third parties.',
      },
      {
        heading: 'Data Security',
        text: 'We use industry-standard encryption and security measures to protect your personal data. Payment information is processed securely through Razorpay and is never stored on our servers.',
      },
      {
        heading: 'Cookies',
        text: 'Our website uses cookies to enhance your browsing experience, remember your preferences, and analyse site traffic. You can manage cookie preferences in your browser settings.',
      },
      {
        heading: 'Your Rights',
        text: 'You may request access to, correction of, or deletion of your personal data at any time by contacting us at support@zimorindia.com.',
      },
    ],
  },
  terms: {
    title: 'Terms & Conditions',
    content: [
      {
        heading: 'Acceptance of Terms',
        text: 'By accessing and using the Zimor India website, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use our services.',
      },
      {
        heading: 'Products & Pricing',
        text: 'All product descriptions and prices are accurate to the best of our knowledge. We reserve the right to modify prices without prior notice. Prices are listed in Indian Rupees (INR) and include applicable taxes.',
      },
      {
        heading: 'Order Acceptance',
        text: 'Placing an order constitutes an offer to purchase. We reserve the right to refuse or cancel any order due to stock unavailability, pricing errors, or suspected fraudulent activity.',
      },
      {
        heading: 'Intellectual Property',
        text: 'All content on this website — including images, text, logos, and designs — is the property of Zimor India and is protected by copyright laws. Unauthorized use is prohibited.',
      },
      {
        heading: 'Limitation of Liability',
        text: 'Zimor India shall not be liable for any indirect, incidental, or consequential damages arising from the use of our website or products, to the fullest extent permitted by law.',
      },
      {
        heading: 'Governing Law',
        text: 'These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Varanasi, Uttar Pradesh.',
      },
    ],
  },
};

export default function PolicyPage() {
  const { slug } = useParams();
  const policy = policies[slug];

  if (!policy) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
        <h1 className="font-heading text-3xl font-bold text-neutral-900">
          Policy Not Found
        </h1>
        <p className="mt-3 text-neutral-600">
          The policy page you're looking for doesn't exist.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <section className="bg-brand-50 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-heading text-4xl font-bold text-neutral-900 sm:text-5xl"
          >
            {policy.title}
          </motion.h1>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="space-y-8"
        >
          {policy.content.map((section) => (
            <div key={section.heading}>
              <h2 className="text-xl font-semibold text-neutral-900">
                {section.heading}
              </h2>
              <p className="mt-2 text-neutral-600 leading-relaxed">{section.text}</p>
            </div>
          ))}
        </motion.div>

        <div className="mt-12 border-t border-neutral-200 pt-8">
          <p className="text-sm text-neutral-500">
            Last updated: January 2025. For questions about our policies, contact us at{' '}
            <a
              href="mailto:support@zimorindia.com"
              className="text-brand-600 hover:text-brand-700"
            >
              support@zimorindia.com
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}
