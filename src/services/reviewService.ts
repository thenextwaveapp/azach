import { supabase } from '@/lib/supabase';
import type { Review, ReviewInsert, ReviewStatus } from '@/types/review';

export const reviewService = {
  // Get approved reviews for a product (public-facing)
  async getApprovedForProduct(productId: string): Promise<Review[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get all reviews for a product visible to the current user (their own pending/rejected + all approved)
  async getVisibleForProduct(productId: string): Promise<Review[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Submit a review (always starts as 'pending', enforced server-side)
  async create(review: ReviewInsert): Promise<Review> {
    const { data, error } = await supabase
      .from('reviews')
      .insert(review)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Admin: get all reviews, optionally filtered by status
  async getAllForAdmin(status?: ReviewStatus): Promise<Review[]> {
    let query = supabase.from('reviews').select('*').order('created_at', { ascending: false });
    if (status) {
      query = query.eq('status', status);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  // Admin: update a review's moderation status
  async updateStatus(id: string, status: ReviewStatus): Promise<Review> {
    const { data, error } = await supabase
      .from('reviews')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Admin: delete a review
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
