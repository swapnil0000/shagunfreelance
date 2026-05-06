import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { MessageSquare } from 'lucide-react';
import StarRating from '../ui/StarRating';
import Button from '../ui/Button';
import Skeleton from '../ui/Skeleton';
import useAuthStore from '../../stores/authStore';
import { useProductReviews, useCreateReview } from '../../hooks/useProducts';

const reviewSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  comment: z.string().min(5, 'Review must be at least 5 characters').max(1000),
});

export default function ReviewSection({ productId }) {
  const { isAuthenticated, user } = useAuthStore();
  const { data, isLoading } = useProductReviews(productId);
  const createReview = useCreateReview();
  const [rating, setRating] = useState(0);
  const [showForm, setShowForm] = useState(false);

  const reviews = data?.reviews ?? [];
  const hasReviewed = reviews.some((r) => r.user?._id === user?._id);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(reviewSchema) });

  const onSubmit = async (formData) => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    try {
      await createReview.mutateAsync({
        productId,
        rating,
        title: formData.title,
        comment: formData.comment,
      });
      toast.success('Review submitted');
      reset();
      setRating(0);
      setShowForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    }
  };

  return (
    <section className="mt-12 border-t border-neutral-100 pt-10">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-heading text-2xl font-bold text-neutral-900">
          Customer Reviews
          {reviews.length > 0 && (
            <span className="ml-2 text-lg font-normal text-neutral-400">
              ({reviews.length})
            </span>
          )}
        </h2>
        {isAuthenticated && !hasReviewed && !showForm && (
          <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
            Write a Review
          </Button>
        )}
      </div>

      {/* Review form */}
      {showForm && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mb-8 rounded-xl border border-neutral-200 bg-neutral-50 p-5 space-y-4"
        >
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">
              Your Rating
            </label>
            <StarRating rating={rating} onChange={setRating} size="lg" />
          </div>
          <div>
            <label htmlFor="review-title" className="mb-1.5 block text-sm font-medium text-neutral-700">
              Title
            </label>
            <input
              id="review-title"
              {...register('title')}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-400"
              placeholder="Summarize your experience"
            />
            {errors.title && (
              <p className="mt-1 text-xs text-error">{errors.title.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="review-comment" className="mb-1.5 block text-sm font-medium text-neutral-700">
              Review
            </label>
            <textarea
              id="review-comment"
              {...register('comment')}
              rows={4}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-400 resize-none"
              placeholder="Share your thoughts about this product"
            />
            {errors.comment && (
              <p className="mt-1 text-xs text-error">{errors.comment.message}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" loading={createReview.isPending}>
              Submit Review
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowForm(false);
                reset();
                setRating(0);
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Reviews list */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
              <Skeleton className="h-12 w-full" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <MessageSquare className="h-10 w-10 text-neutral-300" />
          <p className="text-neutral-500">No reviews yet. Be the first to share your experience.</p>
          {isAuthenticated && !showForm && (
            <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
              Write a Review
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review._id} className="border-b border-neutral-100 pb-5 last:border-0">
              <div className="mb-1 flex items-center gap-3">
                <StarRating rating={review.rating} size="sm" readOnly />
                {review.title && (
                  <span className="text-sm font-medium text-neutral-800">{review.title}</span>
                )}
              </div>
              <p className="mb-2 text-sm text-neutral-600 leading-relaxed">{review.comment}</p>
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <span>{review.user?.name || 'Anonymous'}</span>
                <span>·</span>
                <time dateTime={review.createdAt}>
                  {new Date(review.createdAt).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </time>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
