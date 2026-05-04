import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';

export default function useProducts(filters) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => api.get('/products', { params: filters }).then((r) => r.data),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}

export function useProduct(slug) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => api.get(`/products/${slug}`).then((r) => r.data),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}

export function useProductReviews(productId) {
  return useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => api.get(`/reviews/${productId}`).then((r) => r.data),
    enabled: !!productId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/reviews', data).then((r) => r.data),
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
      api.get('/products', { params: { category, limit: 4 } }).then((r) => r.data),
    enabled: !!category,
    staleTime: 5 * 60 * 1000,
  });
}
