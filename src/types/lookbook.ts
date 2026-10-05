export interface LookbookImage {
  id: string;
  image_url: string;
  headline?: string | null;
  caption?: string | null;
  product_id?: string | null;
  display_order: number;
  created_at: string;
}
