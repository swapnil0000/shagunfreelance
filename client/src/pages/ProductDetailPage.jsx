import { useParams, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useProduct } from '../hooks/useProducts';
import ImageGallery from '../components/product/ImageGallery';
import ProductInfo from '../components/product/ProductInfo';
import ReviewSection from '../components/product/ReviewSection';
import RelatedProducts from '../components/product/RelatedProducts';
import Skeleton from '../components/ui/Skeleton';

function ProductDetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <Skeleton className="mb-4 h-3 w-40" />
      <div className="grid gap-6 md:grid-cols-2 lg:gap-12">
        <Skeleton className="aspect-square w-full rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-7 w-3/4" />
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  const { slug } = useParams();
  const { data, isLoading, isError } = useProduct(slug);
  const product = data?.product ?? null;

  if (isLoading) return <ProductDetailSkeleton />;

  if (isError || !product) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center px-4">
        <p className="text-lg text-neutral-500">Product not found</p>
        <Link to="/shop" className="text-sm font-medium text-brand-600 hover:text-brand-700">
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 pt-4 pb-24 sm:px-6 sm:pb-8 lg:px-8">

        {/* Breadcrumb */}
        <nav className="mb-4 flex items-center gap-1 overflow-x-auto whitespace-nowrap text-xs text-neutral-400 scrollbar-none" aria-label="Breadcrumb">
          <Link to="/" className="shrink-0 hover:text-neutral-600">Home</Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <Link to="/shop" className="shrink-0 hover:text-neutral-600">Shop</Link>
          {product.category && (
            <>
              <ChevronRight className="h-3 w-3 shrink-0" />
              <Link to={`/shop?category=${product.category}`} className="shrink-0 hover:text-neutral-600 capitalize">
                {product.category.replace(/-/g, ' ')}
              </Link>
            </>
          )}
          <ChevronRight className="h-3 w-3 shrink-0" />
          <span className="truncate text-neutral-600">{product.name}</span>
        </nav>

        {/* Main product layout */}
        <div className="grid gap-6 md:grid-cols-2 lg:gap-12">
          <ImageGallery images={product.images} />
          <ProductInfo product={product} />
        </div>

        {/* Reviews */}
        <div className="mt-10">
          <ReviewSection productId={product._id} />
        </div>

        {/* Related products */}
        <RelatedProducts category={product.category} excludeSlug={product.slug} />
      </div>
    </div>
  );
}
