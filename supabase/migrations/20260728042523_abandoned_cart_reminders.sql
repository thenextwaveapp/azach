create extension if not exists pg_cron;
create extension if not exists pg_net;

create table if not exists abandoned_cart_reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  sent_at timestamptz not null default now()
);

alter table abandoned_cart_reminders enable row level security;
;
