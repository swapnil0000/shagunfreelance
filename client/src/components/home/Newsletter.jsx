import { useState } from 'react';
import { Send, Heart } from 'lucide-react';
import api from '../../lib/axios';
import Button from '../ui/Button';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');
    try {
      await api.post('/newsletter/subscribe', { email });
      setStatus('success');
      setMessage("You're in! Check your inbox for a welcome surprise 💌");
      setEmail('');
    } catch (err) {
      setStatus('error');
      setMessage(
        err.response?.data?.message || 'Something went wrong. Please try again.'
      );
    }
  };

  return (
    <section className="relative overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&q=80&auto=format&fit=crop"
          alt=""
          className="h-full w-full object-cover"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-brand-900/85 backdrop-blur-sm" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
            <Heart className="h-6 w-6 text-brand-300" />
          </div>
          <h2 className="font-heading text-3xl font-bold text-white sm:text-4xl">
            Join the Zimor Family
          </h2>
          <p className="mt-3 text-base text-brand-200">
            Be the first to know about new arrivals, exclusive offers, and styling tips.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
          >
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              placeholder="Your email address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status !== 'idle') setStatus('idle');
              }}
              className="flex-1 rounded-full border-0 bg-white/15 px-5 py-3.5 text-white placeholder:text-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/40"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-brand-700 transition-all hover:bg-brand-50 disabled:opacity-60 shrink-0"
            >
              <Send className="h-4 w-4" />
              Subscribe
            </button>
          </form>

          {status === 'success' && (
            <p className="mt-4 text-sm font-medium text-green-300">{message}</p>
          )}
          {status === 'error' && (
            <p className="mt-4 text-sm font-medium text-red-300">{message}</p>
          )}

          <p className="mt-6 text-xs text-white/40">
            No spam, ever. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
}
