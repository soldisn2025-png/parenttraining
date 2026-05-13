create extension if not exists pgcrypto;

create table if not exists parent_contacts (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  first_name text not null,
  created_at timestamptz not null default now()
);

create table if not exists generated_plans (
  id uuid primary key default gen_random_uuid(),
  catalog_version text not null,
  prompt_hash text not null,
  review_status text not null,
  system_selected_videos text[] not null,
  system_scores jsonb not null,
  manually_added text[] not null default '{}',
  manually_removed text[] not null default '{}',
  final_video_order text[] not null,
  rationale text,
  weekly_guidance jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists assignment_tokens (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references generated_plans(id),
  contact_id uuid not null references parent_contacts(id),
  token text not null unique,
  expires_at timestamptz not null,
  sent_at timestamptz,
  invalidated_at timestamptz
);

create table if not exists video_progress (
  id uuid primary key default gen_random_uuid(),
  token_id uuid not null references assignment_tokens(id),
  video_id text not null,
  watched boolean not null default false,
  tried_it boolean not null default false,
  need_help boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(token_id, video_id)
);

create table if not exists audit_events (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references generated_plans(id),
  action text not null,
  video_id text,
  prev_order text[],
  next_order text[],
  created_at timestamptz not null default now()
);

create index if not exists assignment_tokens_contact_idx on assignment_tokens(contact_id);
create index if not exists video_progress_token_idx on video_progress(token_id);
create index if not exists audit_events_plan_idx on audit_events(plan_id);

alter table parent_contacts enable row level security;
alter table generated_plans enable row level security;
alter table assignment_tokens enable row level security;
alter table video_progress enable row level security;
alter table audit_events enable row level security;

-- MVP security posture: no public RLS policies. All access is through server-only code
-- using trusted credentials after Clerk/admin or assignment-token validation.
