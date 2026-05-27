import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';

// Helper: unwrap { status, data: { ... } } envelope from API responses
const unwrap = (r) => r.data?.data ?? r.data;

export default function useProducts(filters) {
  return useQuery({
    queryKey: ['products', filters],
    // Pass React Query's signal so superseded requests (rapid filter/sort
    // changes) are aborted instead of racing to resolve.
    queryFn: ({ signal }) => api.get('/products', { params: filters, signal }).then(unwrap),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}

export function useProduct(slug) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: ({ signal }) => api.get(`/products/${slug}`, { signal }).then(unwrap),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}

export function useProductReviews(productId) {
  return useQuery({
    queryKey: ['reviews', productId],
    queryFn: ({ signal }) => api.get(`/reviews/${productId}`, { signal }).then(unwrap),
    enabled: !!productId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/reviews', data).then(unwrap),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.productId] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
    },
  });
}

export function useRelatedProducts(category, excludeSlug) {
  return useQuery({
    // Own namespace (not under ['products']) so a future products invalidation
    // doesn't needlessly drop the related-products cache.
    queryKey: ['related-products', category, excludeSlug],
    queryFn: ({ signal }) =>
      api.get('/products', { params: { category, limit: 4 }, signal }).then(unwrap),
    enabled: !!category,
    staleTime: 5 * 60 * 1000,
  });
}
