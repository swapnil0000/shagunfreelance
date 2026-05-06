import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';

// Helper: unwrap { status, data: { ... } } envelope from API responses
const unwrap = (r) => r.data?.data ?? r.data;

export default function useProducts(filters) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => api.get('/products', { params: filters }).then(unwrap),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}

export function useProduct(slug) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => api.get(`/products/${slug}`).then(unwrap),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}

export function useProductReviews(productId) {
  return useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => api.get(`/reviews/${productId}`).then(unwrap),
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
    queryKey: ['products', 'related', category, excludeSlug],
    queryFn: () =>
      api.get('/products', { params: { category, limit: 4 } }).then(unwrap),
    enabled: !!category,
    staleTime: 5 * 60 * 1000,
  });
}
