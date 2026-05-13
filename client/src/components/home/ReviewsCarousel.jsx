import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, PenLine, X, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import api from '../../lib/axios';
import useAuthStore from '../../stores/authStore';

const FALLBACK = [
  {
    _id: 'f1',
    user: { name: 'Priya S.' },
    role: 'Marketing Manager',
    product: { name: 'Zimor Tote' },
    rating: 5,
    comment: 'Absolutely love my Zimor tote! The quality is outstanding and it fits my 15" laptop perfectly. Gets compliments every single day at work.',
  },
  {
    _id: 'f2',
    user: { name: 'Ananya M.' },
    role: 'Startup Founder',
    product: { name: 'Zimor Laptop Bag' },
    rating: 5,
    comment: 'Worth every rupee — this bag will last years. The finishing and stitching are top notch. I carry it to every client meeting with pride.',
  },
];

const COLORS = ['bg-rose-400','bg-violet-400','bg-sky-400','bg-amber-400','bg-emerald-400','bg-pink-400'];
function avatarColor(name = '') {
  let n = 0; for (const c of name) n += c.charCodeAt(0);
  return COLORS[n % COLORS.length];
}
function initials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

// ── Interactive star picker ───────────────────────────────────────────────────
function StarPicker({ value, onChange }) {
  const [hov, setHov] = useState(0);
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(i => (
        <Star
          key={i}
          className={`h-7 w-7 cursor-pointer transition-all ${(hov||value) >= i ? 'fill-amber-400 text-amber-400 scale-110' : 'fill-neutral-700 text-neutral-700'}`}
          onMouseEnter={() => setHov(i)}
          onMouseLeave={() => setHov(0)}
          onClick={() => onChange(i)}
        />
      ))}
    </div>
  );
}

// ── Write review panel ────────────────────────────────────────────────────────
function WritePanel({ onClose }) {
  const { isAuthenticated } = useAuthStore();
  const qc = useQueryClient();
  const { data: prods = [] } = useQuery({
    queryKey: ['products-review-list'],
    queryFn: () => api.get('/products?limit=20').then(r => r.data.data.products),
  });
  const [productId, setProductId] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const mut = useMutation({
    mutationFn: d => api.post('/reviews', d),
    onSuccess: () => {
      toast.success('Review submitted! Thank you 🙌');
      qc.invalidateQueries({ queryKey: ['reviews-recent'] });
      onClose();
    },
    onError: err => toast.error(err.response?.data?.message || 'Failed to submit'),
  });

  if (!isAuthenticated) return (
    <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:6 }}
      className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm">
      <p className="mb-4 text-sm text-neutral-400">Sign in to share your experience.</p>
      <Link to="/login" className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 transition-colors">
        Sign In
      </Link>
    </motion.div>
  );

  return (
    <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:6 }}
      className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm sm:p-8">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-base font-semibold text-white">Share Your Experience</h3>
        <button onClick={onClose} className="rounded-full p-1.5 text-neutral-500 hover:bg-white/10 hover:text-white transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>
      <form onSubmit={e => { e.preventDefault();
        if (!productId) return toast.error('Select a product');
        if (!rating) return toast.error('Give a star rating');
        if (comment.trim().length < 5) return toast.error('Write at least 5 characters');
        mut.mutate({ productId, rating, comment: comment.trim() });
      }} className="space-y-5">

        {/* Product */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-neutral-400 uppercase tracking-wider">Product</label>
          <div className="relative">
            <select value={productId} onChange={e => setProductId(e.target.value)}
              className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-10 text-sm text-white focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-400">
              <option value="" className="bg-neutral-900">Choose a product…</option>
              {prods.map(p => <option key={p._id} value={p._id} className="bg-neutral-900">{p.name}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
          </div>
        </div>

        {/* Stars */}
        <div>
          <label className="mb-2 block text-xs font-medium text-neutral-400 uppercase tracking-wider">Your Rating</label>
          <StarPicker value={rating} onChange={setRating} />
        </div>

        {/* Comment */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-neutral-400 uppercase tracking-wider">Review</label>
          <textarea rows={3} value={comment} onChange={e => setComment(e.target.value)}
            placeholder="What did you love about it?"
            className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-400" />
        </div>

        <button type="submit" disabled={mut.isPending}
          className="w-full rounded-xl bg-brand-600 py-3.5 text-sm font-semibold text-white transition-all hover:bg-brand-500 disabled:opacity-50">
          {mut.isPending ? 'Submitting…' : 'Post Review'}
        </button>
      </form>
    </motion.div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ReviewsCarousel() {
  const [active, setActive] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [dir, setDir] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['reviews-recent'],
    queryFn: () => api.get('/reviews/recent').then(r => r.data.data.reviews),
    staleTime: 2 * 60 * 1000,
  });

  const reviews = data?.length ? data : FALLBACK;

  // Auto-cycle
  useEffect(() => {
    if (showForm || reviews.length <= 1) return;
    const t = setInterval(() => { setDir(1); setActive(i => (i + 1) % reviews.length); }, 5000);
    return () => clearInterval(t);
  }, [reviews.length, showForm]);

  const go = (d) => {
    setDir(d);
    setActive(i => (i + d + reviews.length) % reviews.length);
  };

  const r = reviews[active];
  const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '5.0';

  return (
    <section className="relative overflow-hidden bg-neutral-950 py-20 sm:py-28">

      {/* Ambient glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-600/10 blur-[100px]" />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">

        {/* Top label + rating */}
        <div className="mb-12 flex flex-col items-center gap-3 text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-400">
            Customer Love
          </span>
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 backdrop-blur-sm">
            {[1,2,3,4,5].map(i => (
              <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            ))}
            <span className="ml-1 text-sm font-bold text-white">{avg}</span>
            <span className="text-neutral-600">·</span>
            <span className="text-sm text-neutral-400">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Big quote display */}
        <div className="relative min-h-[280px] sm:min-h-[240px]">
          {/* Decorative giant quote */}
          <span className="pointer-events-none absolute -top-6 left-0 select-none font-serif text-[120px] leading-none text-brand-600/20 sm:text-[160px]">
            "
          </span>

          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={r._id}
              custom={dir}
              variants={{
                enter: d => ({ opacity: 0, x: d > 0 ? 40 : -40 }),
                center: { opacity: 1, x: 0 },
                exit: d => ({ opacity: 0, x: d > 0 ? -40 : 40 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="flex flex-col items-center text-center"
            >
              {/* Quote text */}
              <p className="mx-auto max-w-2xl text-xl font-light leading-relaxed text-white sm:text-2xl lg:text-3xl">
                {r.comment}
              </p>

              {/* Stars */}
              <div className="mt-6 flex gap-1">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className={`h-4 w-4 ${i <= r.rating ? 'fill-amber-400 text-amber-400' : 'fill-neutral-700 text-neutral-700'}`} />
                ))}
              </div>

              {/* Author */}
              <div className="mt-5 flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white ${avatarColor(r.user?.name)}`}>
                  {initials(r.user?.name)}
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-white">{r.user?.name || 'Customer'}</p>
                  <p className="text-xs text-neutral-500">
                    {r.role || r.product?.name || 'Verified Customer'}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        {reviews.length > 1 && (
          <div className="mt-10 flex items-center justify-center gap-4">
            <button onClick={() => go(-1)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-neutral-400 transition-all hover:border-white/30 hover:bg-white/5 hover:text-white">
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {reviews.map((_, i) => (
                <button key={i} onClick={() => { setDir(i > active ? 1 : -1); setActive(i); }}
                  className={`rounded-full transition-all duration-300 ${i === active ? 'w-6 h-2 bg-brand-500' : 'w-2 h-2 bg-neutral-700 hover:bg-neutral-500'}`}
                />
              ))}
            </div>

            <button onClick={() => go(1)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-neutral-400 transition-all hover:border-white/30 hover:bg-white/5 hover:text-white">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Write review */}
        <div className="mt-12">
          <AnimatePresence mode="wait">
            {showForm ? (
              <WritePanel key="form" onClose={() => setShowForm(false)} />
            ) : (
              <motion.div key="cta" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                className="flex flex-col items-center gap-2">
                <button onClick={() => setShowForm(true)}
                  className="group inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:border-brand-500/50 hover:bg-brand-600/10 hover:text-brand-300">
                  <PenLine className="h-4 w-4 transition-transform group-hover:rotate-12" />
                  Write a Review
                </button>
                <p className="text-xs text-neutral-600">Purchased from us? We'd love to hear from you.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}
