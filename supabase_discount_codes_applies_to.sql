-- Add applies_to column to discount_codes so codes can target order subtotal or shipping.
alter table public.discount_codes
  add column if not exists applies_to text not null default 'order';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'discount_codes_applies_to_check'
  ) then
    alter table public.discount_codes
      add constraint discount_codes_applies_to_check
      check (applies_to in ('order', 'shipping'));
  end if;
end $$;
