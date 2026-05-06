import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { contactSchema } from '../schemas/contactSchema';
import api from '../lib/axios';

const contactCards = [
  { icon: Mail, title: 'Email', detail: 'support@zimorindia.com', link: 'mailto:support@zimorindia.com', color: 'from-blue-500 to-blue-600' },
  { icon: Phone, title: 'Phone', detail: '+91 98765 43210', link: 'tel:+919876543210', color: 'from-green-500 to-green-600' },
  { icon: MessageCircle, title: 'WhatsApp', detail: 'Chat now', link: 'https://wa.me/919876543210', color: 'from-emerald-500 to-emerald-600' },
  { icon: MapPin, title: 'Studio', detail: 'Varanasi, UP', link: null, color: 'from-purple-500 to-purple-600' },
];

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
      toast.success("Message sent! We'll get back to you soon 💌");
      reset();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white">
      {/* Hero with background image */}
      <section className="relative overflow-hidden min-h-[50vh] flex items-center">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1920&q=80&auto=format&fit=crop"
            alt=""
            className="h-full w-full object-cover"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-neutral-950/70 backdrop-blur-[2px]" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-heading text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
              We'd Love to
              <br />
              <span className="text-brand-300">Hear From You</span> ✨
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg text-neutral-300">
              Questions about our bags, need styling advice, or just want to say hi?
              Drop us a line.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact cards */}
      <section className="mx-auto max-w-4xl px-4 -mt-10 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {contactCards.map(({ icon: Icon, title, detail, link, color }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
            >
              {link ? (
                <a
                  href={link}
                  target={link.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className="group block rounded-2xl bg-white p-5 shadow-lg border border-neutral-100 text-center transition-all hover:shadow-xl hover:-translate-y-1"
                >
                  <div className={`mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br ${color} text-white shadow-sm`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="mt-3 text-sm font-bold text-neutral-800">{title}</p>
                  <p className="mt-0.5 text-xs text-brand-600 group-hover:underline">{detail}</p>
                </a>
              ) : (
                <div className="rounded-2xl bg-white p-5 shadow-lg border border-neutral-100 text-center">
                  <div className={`mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br ${color} text-white shadow-sm`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="mt-3 text-sm font-bold text-neutral-800">{title}</p>
                  <p className="mt-0.5 text-xs text-neutral-500">{detail}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Form + Map section */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-5">
          {/* Left: Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 flex flex-col justify-center"
          >
            <h2 className="font-heading text-2xl font-bold text-neutral-900 sm:text-3xl">
              Let's start a conversation 💬
            </h2>
            <p className="mt-4 text-neutral-600 leading-relaxed">
              Whether you need help choosing the perfect bag, have a question about your order,
              or want to collaborate — we're here for you.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3 rounded-xl bg-neutral-50 p-4">
                <Clock className="h-5 w-5 text-brand-500" />
                <div>
                  <p className="text-sm font-semibold text-neutral-800">Response Time</p>
                  <p className="text-xs text-neutral-500">Usually within 2-4 hours</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-neutral-50 p-4">
                <MessageCircle className="h-5 w-5 text-brand-500" />
                <div>
                  <p className="text-sm font-semibold text-neutral-800">Prefer WhatsApp?</p>
                  <p className="text-xs text-neutral-500">Chat with us for instant replies</p>
                </div>
              </div>
            </div>

            {/* Mini map placeholder */}
            <div className="mt-8 overflow-hidden rounded-2xl border border-neutral-200">
              <img
                src="https://images.unsplash.com/photo-1564507592333-c60657eea523?w=600&q=80&auto=format&fit=crop"
                alt="Varanasi"
                className="h-40 w-full object-cover"
              />
              <div className="bg-neutral-50 p-3 text-center">
                <p className="text-xs font-medium text-neutral-700">📍 Varanasi, Uttar Pradesh, India</p>
              </div>
            </div>
          </motion.div>

          {/* Right: Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-3"
          >
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8"
              noValidate
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Name" placeholder="Your name" error={errors.name?.message} {...register('name')} />
                <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Input label="Phone (optional)" type="tel" placeholder="+91 98765 43210" error={errors.phone?.message} {...register('phone')} />
                <Input label="Subject" placeholder="What's this about?" error={errors.subject?.message} {...register('subject')} />
              </div>

              <div className="mt-4">
                <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-neutral-700">Message</label>
                <textarea
                  id="message"
                  rows={5}
                  placeholder="Tell us what's on your mind..."
                  className={`w-full rounded-xl border px-4 py-3 text-sm text-neutral-800 placeholder:text-neutral-400 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 resize-none ${
                    errors.message ? 'border-error' : 'border-neutral-200 bg-neutral-50 focus:bg-white'
                  }`}
                  {...register('message')}
                />
                {errors.message && <p className="mt-1 text-sm text-error">{errors.message.message}</p>}
              </div>

              <div className="mt-6">
                <Button type="submit" loading={loading} size="lg" className="w-full rounded-xl">
                  <Send className="h-4 w-4" />
                  Send Message
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
