import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../lib/axios';
import ProductCard from '../product/ProductCard';
import Skeleton from '../ui/Skeleton';

function useFeaturedProducts() {
  return useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => api.get('/products/featured').then((r) => r.data?.data ?? r.data),
    // Short stale window — admins reorder featured products and the home page
    // should reflect that without a 5-min wait. Matches the server's 30s TTL.
    staleTime: 30 * 1000,
    refetchOnMount: 'always',
  });
}

function ProductSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-3/4 w-full rounded-xl" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

export default function FeaturedProducts() {
  const { data, isLoading, isError } = useFeaturedProducts();
  const products = data?.products ?? [];

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-12 flex items-end justify-between">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-sm font-medium uppercase tracking-widest text-brand-500">
            Curated for you
          </span>
          <h2 className="mt-2 font-heading text-3xl font-bold text-neutral-900 sm:text-4xl">
            Featured Collection
          </h2>
        </motion.div>
        <Link
          to="/shop"
          className="group hidden items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 sm:flex"
        >
          View All
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {isError && (
        <p className="text-center text-neutral-500">
          Unable to load featured products right now.
        </p>
      )}

      <div className="grid grid-cols-2 gap-5 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }, (_, i) => <ProductSkeleton key={i} />)
          : products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
      </div>

      <div className="mt-10 text-center sm:hidden">
        <Link
          to="/shop"
          className="inline-flex items-center gap-1.5 rounded-full border border-brand-600 px-6 py-2.5 text-sm font-medium text-brand-600 hover:bg-brand-50"
        >
          View All Products <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
