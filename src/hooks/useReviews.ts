import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewService } from '@/services/reviewService';
import type { ReviewInsert, ReviewStatus } from '@/types/review';

export const useProductReviews = (productId: string, userId?: string) => {
  return useQuery({
    queryKey: ['reviews', 'product', productId, userId],
    queryFn: () =>
      userId
        ? reviewService.getVisibleForProduct(productId)
        : reviewService.getApprovedForProduct(productId),
    enabled: !!productId,
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (review: ReviewInsert) => reviewService.create(review),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', 'product', variables.product_id] });
    },
  });
};

export const useAdminReviews = (status?: ReviewStatus) => {
  return useQuery({
    queryKey: ['reviews', 'admin', status],
    queryFn: () => reviewService.getAllForAdmin(status),
  });
};

export const useUpdateReviewStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ReviewStatus }) =>
      reviewService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => reviewService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
};
