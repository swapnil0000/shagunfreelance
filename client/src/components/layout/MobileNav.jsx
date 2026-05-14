import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Home, ShoppingBag, Info, Mail, Heart, ArrowRight, MessageCircle } from 'lucide-react';

const navLinks = [
  { to: '/',        label: 'Home',     icon: Home },
  { to: '/shop',    label: 'Shop',     icon: ShoppingBag, badge: 'New' },
  { to: '/about',   label: 'About',    icon: Info },
  { to: '/contact', label: 'Contact',  icon: Mail },
  { to: '/wishlist',label: 'Wishlist', icon: Heart },
];

export default function MobileNav({ isOpen, onClose }) {
  const { pathname } = useLocation();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.28 }}
            className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl flex flex-col"
          >

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
              <Link to="/" onClick={onClose}>
                <img src="/logo.png" alt="Zimor India" className="h-9 w-auto object-contain" />
              </Link>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 hover:bg-brand-50 hover:text-brand-600 transition-colors"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 overflow-y-auto px-3 py-4">
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
                Menu
              </p>
              <ul className="space-y-0.5">
                {navLinks.map(({ to, label, icon: Icon, badge }) => {
                  const isActive = pathname === to;
                  return (
                    <li key={to}>
                      <Link
                        to={to}
                        onClick={onClose}
                        className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all ${
                          isActive
                            ? 'bg-brand-50 text-brand-700'
                            : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                        }`}
                      >
                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                          isActive
                            ? 'bg-brand-100 text-brand-600'
                            : 'bg-neutral-100 text-neutral-500 group-hover:bg-neutral-200'
                        }`}>
                          <Icon className="h-4 w-4" />
                        </span>

                        <span className="flex-1">{label}</span>

                        {badge && (
                          <span className="rounded-full bg-brand-500 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                            {badge}
                          </span>
                        )}

                        {isActive && (
                          <span className="h-1.5 w-1.5 rounded-full bg-brand-500 shrink-0" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Bottom CTAs */}
            <div className="border-t border-neutral-100 px-4 py-4 space-y-2">
              <Link
                to="/shop"
                onClick={onClose}
                className="flex items-center justify-between w-full rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-600 transition-colors"
              >
                Shop All Bags
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="https://wa.me/918953696928"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-emerald-500" />
                  Chat on WhatsApp
                </span>
                <ArrowRight className="h-4 w-4 text-neutral-400" />
              </a>

              <p className="pt-1 text-center text-[10px] text-neutral-400 tracking-wide">
                Handcrafted in Varanasi · Est. 2023
              </p>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
