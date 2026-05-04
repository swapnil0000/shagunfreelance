import ProductCard from './ProductCard';
import Skeleton from '../ui/Skeleton';
import { useRelatedProducts } from '../../hooks/useProducts';

function ProductSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-3/4 w-full rounded-lg" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

export default function RelatedProducts({ category, excludeSlug }) {
  const { data, isLoading } = useRelatedProducts(category, excludeSlug);
  const allProducts = data?.data?.products ?? data?.products ?? [];
  const products = allProducts.filter((p) => p.slug !== excludeSlug).slice(0, 4);

  if (!isLoading && products.length === 0) return null;

  return (
    <section className="mt-12 border-t border-neutral-100 pt-10">
      <h2 className="mb-6 font-heading text-2xl font-bold text-neutral-900">
        You May Also Like
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }, (_, i) => <ProductSkeleton key={i} />)
          : products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
      </div>
    </section>
  );
}
