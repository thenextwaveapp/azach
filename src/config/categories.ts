// Single source of truth for product categories.
// - `dbValue` is what's stored in products.category (Supabase)
// - `slug` is what appears in /shop-all?category=<slug> URLs (homepage tiles link with these)
export interface CategoryDef {
  slug: string;
  dbValue: string;
  label: string;
}

export const CATEGORIES: CategoryDef[] = [
  { slug: "tops", dbValue: "TOPS", label: "Tops" },
  { slug: "bottoms", dbValue: "BOTTOM", label: "Bottoms" },
  { slug: "sets", dbValue: "SET", label: "Sets" },
  { slug: "accessories", dbValue: "ACCESSORIES", label: "Accessories" },
  { slug: "dress", dbValue: "DRESS", label: "Dress" },
];

export const categoryBySlug = (slug: string | null | undefined): CategoryDef | undefined =>
  slug ? CATEGORIES.find((c) => c.slug === slug.toLowerCase()) : undefined;

export const categoryLabel = (dbValue: string): string =>
  CATEGORIES.find((c) => c.dbValue === dbValue)?.label ?? dbValue;
