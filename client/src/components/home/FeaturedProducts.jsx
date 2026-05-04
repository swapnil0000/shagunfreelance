import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../lib/axios';
import ProductCard from '../product/ProductCard';
import Skeleton from '../ui/Skeleton';

function useFeaturedProducts() {
  return useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => api.get('/products/featured').then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });
}

function ProductSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-3/4 w-full rounded-lg" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

export default function FeaturedProducts() {
  const { data, isLoading, isError } = useFeaturedProducts();
  const products = data?.products ?? data ?? [];

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <h2 className="font-heading text-3xl font-bold text-neutral-900">
            Featured Collection
          </h2>
          <p className="mt-2 text-neutral-500">
            Our most loved bags, handpicked for you
          </p>
        </div>
        <Link
          to="/shop"
          className="hidden items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 sm:flex"
        >
          View All <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {isError && (
        <p className="text-center text-neutral-500">
          Unable to load featured products right now.
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }, (_, i) => <ProductSkeleton key={i} />)
          : products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
      </div>

      <div className="mt-8 text-center sm:hidden">
        <Link
          to="/shop"
          className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          View All Products <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
