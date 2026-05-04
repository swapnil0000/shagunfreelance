import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Search } from 'lucide-react';
import Button from '../components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-24 text-center sm:py-32">
      {/* Illustration */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <div className="flex h-40 w-40 items-center justify-center rounded-full bg-brand-50">
          <Search className="h-16 w-16 text-brand-300" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="absolute -bottom-2 -right-2 flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white font-bold text-lg shadow-lg"
        >
          ?
        </motion.div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mt-8 font-heading text-5xl font-bold text-neutral-900 sm:text-6xl"
      >
        404
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mt-4 text-lg text-neutral-600"
      >
        Oops! The page you're looking for doesn't exist.
      </motion.p>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mt-2 text-neutral-500"
      >
        It might have been moved or the URL may be incorrect.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mt-8 flex flex-col gap-3 sm:flex-row"
      >
        <Link to="/">
          <Button variant="primary" size="lg">
            <Home className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
        <Link to="/shop">
          <Button variant="outline" size="lg">
            Browse Shop
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
