import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { toast } from 'sonner';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { contactSchema } from '../schemas/contactSchema';
import api from '../lib/axios';

export default function ContactPage() {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post('/contact', data);
      toast.success('Message sent! We will get back to you soon.');
      reset();
    } catch (error) {
      const message =
        error.response?.data?.message || 'Something went wrong. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white">
      {/* Header */}
      <section className="bg-brand-50 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-heading text-4xl font-bold text-neutral-900 sm:text-5xl"
          >
            Get in Touch
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-lg text-neutral-600"
          >
            Have a question, feedback, or just want to say hello? We'd love to hear from you.
          </motion.p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-5">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <h2 className="font-heading text-2xl font-bold text-neutral-900">
              Contact Information
            </h2>
            <p className="mt-3 text-neutral-600">
              Reach out to us through the form or use the details below.
            </p>

            <div className="mt-8 space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-100">
                  <Mail className="h-5 w-5 text-brand-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-900">Email</p>
                  <a
                    href="mailto:support@zimorindia.com"
                    className="text-sm text-neutral-600 hover:text-brand-600 transition-colors"
                  >
                    support@zimorindia.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-100">
                  <Phone className="h-5 w-5 text-brand-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-900">Phone</p>
                  <a
                    href="tel:+919876543210"
                    className="text-sm text-neutral-600 hover:text-brand-600 transition-colors"
                  >
                    +91 98765 43210
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-100">
                  <MapPin className="h-5 w-5 text-brand-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-900">Address</p>
                  <p className="text-sm text-neutral-600">
                    Zimor India Studio
                    <br />
                    Varanasi, Uttar Pradesh
                    <br />
                    India
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-3"
          >
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8"
              noValidate
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <Input
                  label="Name"
                  placeholder="Your full name"
                  error={errors.name?.message}
                  {...register('name')}
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  error={errors.email?.message}
                  {...register('email')}
                />
              </div>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <Input
                  label="Phone (optional)"
                  type="tel"
                  placeholder="+91 98765 43210"
                  error={errors.phone?.message}
                  {...register('phone')}
                />
                <Input
                  label="Subject"
                  placeholder="How can we help?"
                  error={errors.subject?.message}
                  {...register('subject')}
                />
              </div>

              <div className="mt-5">
                <label
                  htmlFor="message"
                  className="mb-1.5 block text-sm font-medium text-neutral-700"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  rows={5}
                  placeholder="Tell us more..."
                  className={`w-full rounded-lg border px-4 py-2.5 text-sm text-neutral-800 placeholder:text-neutral-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 resize-none ${
                    errors.message
                      ? 'border-error focus:ring-error focus:border-error'
                      : 'border-neutral-300'
                  }`}
                  aria-invalid={errors.message ? 'true' : undefined}
                  aria-describedby={errors.message ? 'message-error' : undefined}
                  {...register('message')}
                />
                {errors.message && (
                  <p id="message-error" className="mt-1 text-sm text-error" role="alert">
                    {errors.message.message}
                  </p>
                )}
              </div>

              <div className="mt-6">
                <Button type="submit" loading={loading} className="w-full sm:w-auto">
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
