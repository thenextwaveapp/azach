import { supabase } from '@/lib/supabase';
import type { LookbookImage } from '@/types/lookbook';

export const lookbookService = {
  async getAll(): Promise<LookbookImage[]> {
    const { data, error } = await supabase
      .from('lookbook_images')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
  },
};
