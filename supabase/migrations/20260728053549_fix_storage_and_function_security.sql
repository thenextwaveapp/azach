-- Public buckets serve objects via the public URL route without any RLS check, so these
-- SELECT policies only ever enabled storage.list()-style enumeration — never needed for
-- normal image display.
drop policy if exists "Public can view form attachments" on storage.objects;
drop policy if exists "Public can view labels" on storage.objects;
drop policy if exists "Public can view product images" on storage.objects;

-- These only checked bucket_id, not admin status — any authenticated session (including
-- anonymous guest-checkout sessions, which hold the "authenticated" Postgres role) could
-- delete/overwrite any product image via the Storage API directly, bypassing the admin
-- panel's client-side gating entirely.
drop policy if exists "Authenticated users can update product images" on storage.objects;
drop policy if exists "Authenticated users can delete product images" on storage.objects;

create policy "Admins can update product images"
on storage.objects for update
to authenticated
using (bucket_id = 'product-images' and is_admin(auth.uid()));

create policy "Admins can delete product images"
on storage.objects for delete
to authenticated
using (bucket_id = 'product-images' and is_admin(auth.uid()));

-- Pin search_path on all SECURITY DEFINER / trigger functions to close the
-- search-path-hijack vector.
alter function public.is_admin(uuid) set search_path = public;
alter function public.get_available_stock(uuid) set search_path = public;
alter function public.reserve_stock(uuid, integer, text, integer) set search_path = public;
alter function public.release_reservation(text) set search_path = public;
alter function public.cleanup_expired_reservations() set search_path = public;
alter function public.cleanup_expired_shipping_cache() set search_path = public;
alter function public.update_updated_at_column() set search_path = public;
;
