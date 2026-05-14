import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageCircle, Clock, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { contactSchema } from '../schemas/contactSchema';
import api from '../lib/axios';

const contactMethods = [
  {
    icon: Mail,
    title: 'Email Us',
    detail: 'support@zimorindia.com',
    sub: 'We reply within 2–4 hours',
    link: 'mailto:support@zimorindia.com',
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp',
    detail: '+91 89536 96928',
    sub: 'Instant replies, 9am – 9pm',
    link: 'https://wa.me/918953696928',
  },
  {
    icon: Phone,
    title: 'Call Us',
    detail: '+91 89536 96928',
    sub: 'Mon – Sat, 10am – 7pm',
    link: 'tel:+918953696928',
  },
  {
    icon: MapPin,
    title: 'Visit Us',
    detail: 'Shivpurwa, Varanasi',
    sub: 'Uttar Pradesh – 221010',
    link: null,
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08 },
  }),
};

export default function ContactPage() {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', phone: '', subject: '', message: '' },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post('/contact', data);
      toast.success("Message sent! We'll get back to you soon.");
      reset();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white overflow-x-hidden">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden min-h-[60vh] flex items-end">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1920&q=80&auto=format&fit=crop"
            alt=""
            className="h-full w-full object-cover object-center"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/55 to-neutral-950/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/70 to-transparent" />
        </div>

        {/* Vertical decorative label */}
        <div className="absolute top-1/3 right-8 -translate-y-1/2 hidden md:flex flex-col items-center gap-3">
          <div className="h-14 w-px bg-white/20" />
          <span
            className="text-[10px] font-semibold tracking-[0.35em] text-white/35 uppercase"
            style={{ writingMode: 'vertical-rl' }}
          >
            Varanasi · Est. 2023
          </span>
          <div className="h-14 w-px bg-white/20" />
        </div>

        <div className="relative mx-auto w-full max-w-6xl px-6 pb-16 pt-32 sm:px-10 lg:px-16">
          <motion.div
            initial="hidden"
            animate="show"
            variants={fadeUp}
          >
            <span className="inline-block rounded-full border border-brand-400/40 bg-brand-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-brand-300 mb-6 backdrop-blur-sm">
              We're Here to Help
            </span>

            <h1 className="font-heading text-5xl font-bold text-white sm:text-6xl lg:text-7xl leading-[1.05] max-w-2xl">
              Let's Talk
              <br />
              <span className="italic text-brand-300 underline decoration-brand-500/50 decoration-2 underline-offset-8">
                Bags.
              </span>
            </h1>

            <div className="mt-6 w-10 h-[2px] rounded-full bg-brand-500" />

            <p className="mt-4 max-w-md text-base text-white/60 leading-relaxed">
              Questions about sizing, materials, shipping, or styling? We love hearing from our customers. Drop us a message and we'll get back to you fast.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── CONTACT METHOD CARDS ── */}
      <section className="bg-neutral-950 border-t border-white/10">
        <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-white/10">
            {contactMethods.map(({ icon: Icon, title, detail, sub, link }, i) => (
              <motion.div
                key={title}
                custom={i}
                initial="hidden"
                animate="show"
                variants={fadeUp}
                className="min-w-0"
              >
                {link ? (
                  <a
                    href={link}
                    target={link.startsWith('http') ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    className="group flex flex-col gap-2.5 px-3 py-5 sm:px-6 sm:py-7 transition-colors hover:bg-white/5"
                  >
                    <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-brand-500/15 flex items-center justify-center shrink-0">
                      <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-brand-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-white/40">{title}</p>
                      <p className="mt-1 text-xs sm:text-sm font-bold text-white group-hover:text-brand-300 transition-colors break-all">{detail}</p>
                      <p className="mt-0.5 text-[10px] sm:text-xs text-white/30">{sub}</p>
                    </div>
                  </a>
                ) : (
                  <div className="flex flex-col gap-2.5 px-3 py-5 sm:px-6 sm:py-7">
                    <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-brand-500/15 flex items-center justify-center shrink-0">
                      <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-brand-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-white/40">{title}</p>
                      <p className="mt-1 text-xs sm:text-sm font-bold text-white break-words">{detail}</p>
                      <p className="mt-0.5 text-[10px] sm:text-xs text-white/30">{sub}</p>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FORM + INFO ── */}
      <section className="mx-auto max-w-6xl px-6 py-24 sm:px-10 lg:px-16">
        <div className="grid gap-16 lg:grid-cols-5 lg:items-start">

          {/* Left — info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="lg:col-span-2 lg:sticky lg:top-28"
          >
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-500">Send a Message</span>
            <h2 className="mt-3 font-heading text-3xl font-bold text-neutral-900 sm:text-4xl leading-tight">
              We'd Love to
              <br />
              <span className="italic text-brand-600">Hear From You.</span>
            </h2>
            <p className="mt-4 text-sm text-neutral-500 leading-relaxed max-w-xs">
              Whether you're choosing between two styles, tracking an order, or just want to say hi — we're real people who love talking bags.
            </p>

            {/* Info items */}
            <div className="mt-8 space-y-3">
              <div className="flex items-start gap-4 rounded-2xl border border-neutral-100 bg-neutral-50 px-5 py-4">
                <Clock className="h-5 w-5 text-brand-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-neutral-800">Fast Response</p>
                  <p className="mt-0.5 text-xs text-neutral-500 leading-relaxed">We typically reply within 2–4 hours on business days.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-2xl border border-neutral-100 bg-neutral-50 px-5 py-4">
                <MessageCircle className="h-5 w-5 text-brand-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-neutral-800">Prefer WhatsApp?</p>
                  <a
                    href="https://wa.me/918953696928"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 transition-colors"
                  >
                    Chat with us now <ArrowRight className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Location card */}
            {/* <div className="mt-5 overflow-hidden rounded-2xl border border-neutral-200">
              <img
                src="https://images.unsplash.com/photo-1564507592333-c60657eea523?w=600&q=80&auto=format&fit=crop"
                alt="Varanasi"
                className="h-36 w-full object-cover"
              />
              <div className="bg-neutral-50 px-4 py-3 flex items-start gap-2">
                <MapPin className="h-3.5 w-3.5 text-brand-500 shrink-0 mt-0.5" />
                <p className="text-xs text-neutral-600 leading-relaxed">
                  D 59/198-KA-1-P, Shivpurwa,<br />Varanasi, UP – 221010
                </p>
              </div>
            </div> */}
          </motion.div>

          {/* Right — form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="lg:col-span-3"
          >
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="rounded-3xl bg-brand-50/60 border border-brand-100 p-7 sm:p-10"
              noValidate
            >
              <p className="text-sm font-semibold text-neutral-700 mb-6">
                Fill in the details below — we'll get back to you shortly.
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Your Name"
                  placeholder="Priya Sharma"
                  error={errors.name?.message}
                  {...register('name')}
                />
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  error={errors.email?.message}
                  {...register('email')}
                />
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Input
                  label="Phone (optional)"
                  type="tel"
                  placeholder="+91 98765 43210"
                  error={errors.phone?.message}
                  {...register('phone')}
                />
                <Input
                  label="Subject"
                  placeholder="e.g. Order inquiry, Styling help..."
                  error={errors.subject?.message}
                  {...register('subject')}
                />
              </div>

              <div className="mt-4">
                <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={5}
                  placeholder="Tell us what's on your mind — we read every message personally."
                  className={`w-full rounded-xl border px-4 py-3 text-sm text-neutral-800 placeholder:text-neutral-400 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 resize-none bg-white ${
                    errors.message ? 'border-error' : 'border-brand-200 focus:bg-white'
                  }`}
                  {...register('message')}
                />
                {errors.message && (
                  <p className="mt-1 text-sm text-error">{errors.message.message}</p>
                )}
              </div>

              <div className="mt-7">
                <Button type="submit" loading={loading} size="lg" className="w-full rounded-xl gap-2">
                  <Send className="h-4 w-4" />
                  Send Message
                </Button>
                <p className="mt-3 text-center text-xs text-neutral-400">
                  We typically reply within 2–4 hours on business days.
                </p>
              </div>
            </form>
          </motion.div>

        </div>
      </section>

    </div>
  );
}
