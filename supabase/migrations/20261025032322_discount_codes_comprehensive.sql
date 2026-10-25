-- Make discount codes more comprehensive: usage limits (single/multiple/unlimited) and minimum spend.
alter table public.discount_codes
  add column if not exists usage_type text not null default 'single',
  add column if not exists max_uses integer,
  add column if not exists min_spend numeric not null default 0;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'discount_codes_usage_type_check'
  ) then
    alter table public.discount_codes
      add constraint discount_codes_usage_type_check
      check (usage_type in ('single', 'multiple', 'unlimited'));
  end if;
end $$;

-- Backfill: existing rows single-use.
update public.discount_codes set usage_type = 'single' where usage_type is null;
