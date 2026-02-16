import { supabase } from '@/lib/supabase';
import type { Product, ProductInsert, ProductUpdate } from '@/types/product';

export const productService = {
  // Get all products
  async getAll(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get product by ID
  async getById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Get products by category
  async getByCategory(category: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get featured products
  async getFeatured(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('featured', true)
      .eq('in_stock', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get sale products
  async getOnSale(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('on_sale', true)
      .eq('in_stock', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get products by gender
  async getByGender(gender: 'men' | 'women'): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('gender', gender)
      .eq('in_stock', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Search products
  async search(query: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .or(`name.ilike.%${query}%,category.ilike.%${query}%,description.ilike.%${query}%`)
      .eq('in_stock', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Create product
  async create(product: ProductInsert): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update product
  async update(product: ProductUpdate): Promise<Product> {
    const { id, ...updates } = product;
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete product
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Update stock
  async updateStock(id: string, stock: number): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .update({
        stock,
        in_stock: stock > 0
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get filtered products with server-side filtering and sorting
  async getFiltered(filters: {
    categories?: string[];
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean | null;
    onSale?: boolean | null;
    gender?: 'men' | 'women' | 'unisex' | null;
    genders?: ('men' | 'women' | 'unisex')[];
    sortBy?: 'newest' | 'price-low' | 'price-high' | 'name-asc' | 'name-desc';
  }): Promise<Product[]> {
    let query = supabase.from('products').select('*');

    // Category filter
    if (filters.categories && filters.categories.length > 0) {
      query = query.in('category', filters.categories);
    }

    // Price range filter
    if (filters.minPrice !== undefined) {
      query = query.gte('price', filters.minPrice);
    }
    if (filters.maxPrice !== undefined) {
      query = query.lte('price', filters.maxPrice);
    }

    // Stock filter
    if (filters.inStock !== null && filters.inStock !== undefined) {
      query = query.eq('in_stock', filters.inStock);
    }

    // Sale filter
    if (filters.onSale !== null && filters.onSale !== undefined) {
      query = query.eq('on_sale', filters.onSale);
    }

    // Gender filter - support both single gender and multiple genders
    if (filters.genders && filters.genders.length > 0) {
      query = query.in('gender', filters.genders);
    } else if (filters.gender) {
      query = query.eq('gender', filters.gender);
    }

    // Sorting
    switch (filters.sortBy) {
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      case 'price-low':
        query = query.order('price', { ascending: true });
        break;
      case 'price-high':
        query = query.order('price', { ascending: false });
        break;
      case 'name-asc':
        query = query.order('name', { ascending: true });
        break;
      case 'name-desc':
        query = query.order('name', { ascending: false });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },
};









