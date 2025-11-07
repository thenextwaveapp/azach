import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}

// Get user's wishlist
export const useWishlist = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['wishlist', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('wishlist')
        .select('*, products(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
};

// Check if product is in wishlist
export const useIsInWishlist = (productId: string | number) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['wishlist-check', user?.id, productId],
    queryFn: async () => {
      if (!user) return false;

      const { data, error } = await supabase
        .from('wishlist')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!user && !!productId,
  });
};

// Add to wishlist
export const useAddToWishlist = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (productId: string | number) => {
      if (!user) throw new Error('Must be logged in to add to wishlist');

      const { data, error } = await supabase
        .from('wishlist')
        .insert({
          user_id: user.id,
          product_id: productId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['wishlist-check'] });
    },
  });
};

// Remove from wishlist
export const useRemoveFromWishlist = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (productId: string | number) => {
      if (!user) throw new Error('Must be logged in to remove from wishlist');

      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['wishlist-check'] });
    },
  });
};
