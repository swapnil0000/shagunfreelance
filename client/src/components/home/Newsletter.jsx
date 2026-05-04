import { useState } from 'react';
import { Send } from 'lucide-react';
import api from '../../lib/axios';
import Button from '../ui/Button';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');
    try {
      await api.post('/newsletter/subscribe', { email });
      setStatus('success');
      setMessage("You're subscribed! Watch your inbox for updates.");
      setEmail('');
    } catch (err) {
      setStatus('error');
      setMessage(
        err.response?.data?.message || 'Something went wrong. Please try again.'
      );
    }
  };

  return (
    <section className="bg-brand-600">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="font-heading text-3xl font-bold text-white">
            Stay in the Loop
          </h2>
          <p className="mt-2 text-brand-100">
            New arrivals, exclusive offers, and styling tips — straight to your inbox.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status !== 'idle') setStatus('idle');
              }}
              className="flex-1 rounded-lg border-0 bg-white/10 px-4 py-3 text-white placeholder:text-brand-200 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <Button
              type="submit"
              variant="secondary"
              loading={status === 'loading'}
              className="bg-white text-brand-700 hover:bg-brand-50"
            >
              <Send className="h-4 w-4" />
              Subscribe
            </Button>
          </form>

          {status === 'success' && (
            <p className="mt-3 text-sm text-green-200">{message}</p>
          )}
          {status === 'error' && (
            <p className="mt-3 text-sm text-red-200">{message}</p>
          )}
        </div>
      </div>
    </section>
  );
}
