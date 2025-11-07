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
};








