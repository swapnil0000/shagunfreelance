import { useParams, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useProduct } from '../hooks/useProducts';
import ImageGallery from '../components/product/ImageGallery';
import ProductInfo from '../components/product/ProductInfo';
import ReviewSection from '../components/product/ReviewSection';
import RelatedProducts from '../components/product/RelatedProducts';
import Skeleton from '../components/ui/Skeleton';

function ProductDetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Skeleton className="mb-6 h-4 w-48" />
      <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
        <Skeleton className="aspect-square w-full rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-20 w-full" />
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
  const product = data?.data?.product ?? null;

  if (isLoading) return <ProductDetailSkeleton />;

  if (isError || !product) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <p className="text-lg text-neutral-500">Product not found</p>
        <Link to="/shop" className="text-sm font-medium text-brand-600 hover:text-brand-700">
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
    >
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-neutral-400" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-neutral-600 transition-colors">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link to="/shop" className="hover:text-neutral-600 transition-colors">Shop</Link>
        {product.category && (
          <>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link
              to={`/shop?category=${product.category}`}
              className="hover:text-neutral-600 transition-colors capitalize"
            >
              {product.category.replace(/-/g, ' ')}
            </Link>
          </>
        )}
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-neutral-600 line-clamp-1">{product.name}</span>
      </nav>

      {/* Product layout */}
      <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
        <ImageGallery images={product.images} />
        <ProductInfo product={product} />
      </div>

      {/* Reviews */}
      <ReviewSection productId={product._id} />

      {/* Related products */}
      <RelatedProducts category={product.category} excludeSlug={product.slug} />
    </motion.div>
  );
}
