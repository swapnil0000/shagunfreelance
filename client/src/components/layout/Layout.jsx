import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Toaster } from 'sonner';
import AnnouncementBar from './AnnouncementBar';
import Navbar from './Navbar';
import Footer from './Footer';
import MobileNav from './MobileNav';
import CartDrawer from '../cart/CartDrawer';
import ScrollProgressBar from '../shared/ScrollProgressBar';
import WhatsAppFloat from '../shared/WhatsAppFloat';
import CursorTrailer from '../shared/CursorTrailer';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
};

export default function Layout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col">
      <ScrollProgressBar />
      <CursorTrailer />
      <AnnouncementBar />
      <Navbar onOpenMobileNav={() => setMobileNavOpen(true)} />
      <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <CartDrawer />

      <main className="flex-1">
        {/* Keyed remount re-runs the enter animation on navigation. No exit
            animation, so a new (lazy-loaded) route can paint immediately
            instead of waiting ~150ms for the previous page to animate out. */}
        <motion.div
          key={location.pathname}
          variants={pageVariants}
          initial="initial"
          animate="animate"
        >
          <Outlet />
        </motion.div>
      </main>

      <Footer />
      <WhatsAppFloat />
      <Toaster position="top-right" richColors closeButton duration={4000} />
    </div>
  );
}
