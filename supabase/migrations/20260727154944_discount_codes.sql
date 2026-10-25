create table if not exists discount_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  percent_off numeric not null check (percent_off > 0 and percent_off <= 100),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists discount_redemptions (
  id uuid primary key default gen_random_uuid(),
  discount_code_id uuid not null references discount_codes(id) on delete cascade,
  email text not null,
  order_id uuid references orders(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (discount_code_id, email)
);

alter table discount_codes enable row level security;
alter table discount_redemptions enable row level security;

alter table orders add column if not exists discount_code text;
alter table orders add column if not exists discount_amount numeric not null default 0;

insert into discount_codes (code, percent_off) values ('WELCOME15', 15)
  on conflict (code) do nothing;
;
