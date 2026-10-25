-- ICP quiz submissions from ManyChat
create table if not exists public.icp_quizzes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- ManyChat identity (join key for the callback)
  mc_subscriber_id text not null,
  ig_username text,

  -- The six answers
  offer text,
  buyer_description text,
  titles text,
  company_size text,
  regions text,
  best_customer text,

  -- Pipeline state
  status text not null default 'queued'
    check (status in ('queued','processing','done','delivered','failed','skipped_vague')),
  qualified boolean,

  -- Fulfillment artifacts
  targeting_spec jsonb,          -- generated filter/ladder config
  run_log text,                  -- worker log for this run
  output_path text,              -- storage path of the sample file
  sample_count int,
  processed_at timestamptz,
  delivered_at timestamptz,

  -- Sales tracking
  outcome text default 'pending'
    check (outcome in ('pending','sample_sent','bought','ghosted','nurture')),
  deal_value numeric,
  notes text
);

create index if not exists icp_quizzes_status_idx on public.icp_quizzes (status);
create index if not exists icp_quizzes_subscriber_idx on public.icp_quizzes (mc_subscriber_id);

-- Reusable targeting specs: the demand map / ladder library
create table if not exists public.targeting_ladders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,             -- e.g. 'us_datacenter_energy_infra'
  description text,
  spec jsonb not null,            -- seniority/domain regexes, filters, weights
  times_used int not null default 1,
  source_quiz_id uuid references public.icp_quizzes(id)
);

-- RLS on, no public policies: only service_role (your worker) can touch these
alter table public.icp_quizzes enable row level security;
alter table public.targeting_ladders enable row level security;;
