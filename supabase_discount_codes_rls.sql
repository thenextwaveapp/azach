-- Allow authenticated (admin) users to read and manage discount codes.
alter table public.discount_codes enable row level security;

drop policy if exists "Authenticated can manage discount codes" on public.discount_codes;
create policy "Authenticated can manage discount codes"
  on public.discount_codes
  for all
  to authenticated
  using (true)
  with check (true);

-- Also allow anon? Admin page uses authenticated session, so no.
