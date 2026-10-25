create table if not exists lookbook_images (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  headline text,
  caption text,
  product_id uuid references products(id) on delete set null,
  display_order int not null,
  created_at timestamptz not null default now()
);

alter table lookbook_images enable row level security;

create policy "Lookbook images are viewable by everyone"
  on lookbook_images for select
  using (true);

create policy "Only admins can insert lookbook images"
  on lookbook_images for insert
  with check (exists (select 1 from admin_users where admin_users.user_id = auth.uid()));

create policy "Only admins can update lookbook images"
  on lookbook_images for update
  using (exists (select 1 from admin_users where admin_users.user_id = auth.uid()));

create policy "Only admins can delete lookbook images"
  on lookbook_images for delete
  using (exists (select 1 from admin_users where admin_users.user_id = auth.uid()));
;
