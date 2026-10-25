alter table public.products
  add column if not exists sku text,
  add column if not exists size text,
  add column if not exists material text,
  add column if not exists care_instructions text,
  add column if not exists style_code text,
  add column if not exists measurements jsonb,
  add column if not exists model_info jsonb,
  add column if not exists custom_size_available boolean not null default true;

create unique index if not exists idx_products_sku on public.products (sku) where sku is not null;

create index if not exists idx_products_style_code on public.products (style_code);;
