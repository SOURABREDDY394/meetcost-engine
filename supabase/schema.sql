create extension if not exists pgcrypto;

create type public.project_priority as enum ('low', 'medium', 'high');
create type public.project_status as enum ('active', 'paused', 'completed');
create type public.meeting_risk as enum ('clear', 'review', 'risk');
create type public.anomaly_status as enum ('open', 'resolved');

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  currency text not null default 'INR',
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete cascade,
  display_name text,
  role text not null default 'admin',
  created_at timestamptz not null default now()
);

create table public.cost_bands (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  role_name text not null,
  hourly_cost numeric(12, 2) not null check (hourly_cost >= 0),
  created_at timestamptz not null default now(),
  unique (organization_id, role_name)
);

create table public.employees (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  external_id text,
  display_name text not null,
  email text,
  role_name text not null,
  department text,
  team text,
  created_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  owner_name text,
  priority public.project_priority not null default 'medium',
  monthly_budget numeric(14, 2) not null default 0,
  team text,
  keywords text[] not null default '{}',
  status public.project_status not null default 'active',
  created_at timestamptz not null default now()
);

create table public.meetings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  external_id text,
  title text not null,
  description text,
  notes text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  department text,
  project_hint text,
  recurring boolean not null default false,
  recurrence_key text,
  risk public.meeting_risk not null default 'clear',
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table public.meeting_attendees (
  meeting_id uuid not null references public.meetings(id) on delete cascade,
  employee_id uuid references public.employees(id) on delete set null,
  attendee_email text,
  role_name text,
  hourly_cost_snapshot numeric(12, 2) not null default 0,
  primary key (meeting_id, attendee_email)
);

create table public.attributions (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null unique references public.meetings(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  confidence integer not null check (confidence between 0 and 100),
  evidence jsonb not null default '{}'::jsonb,
  reason text,
  corrected_by uuid references auth.users(id) on delete set null,
  corrected_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.meeting_outcomes (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null unique references public.meetings(id) on delete cascade,
  outcome_type text,
  decisions integer not null default 0,
  action_items integer not null default 0,
  roi_score integer check (roi_score between 0 and 100),
  summary text,
  created_at timestamptz not null default now()
);

create table public.anomalies (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  meeting_id uuid references public.meetings(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  anomaly_type text not null,
  severity text not null,
  title text not null,
  detail text,
  potential_saving numeric(14, 2) not null default 0,
  status public.anomaly_status not null default 'open',
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  organization_id uuid references public.organizations(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.cost_bands enable row level security;
alter table public.employees enable row level security;
alter table public.projects enable row level security;
alter table public.meetings enable row level security;
alter table public.meeting_attendees enable row level security;
alter table public.attributions enable row level security;
alter table public.meeting_outcomes enable row level security;
alter table public.anomalies enable row level security;
alter table public.audit_logs enable row level security;

create or replace function public.current_organization_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select organization_id from public.profiles where id = auth.uid()
$$;

create policy "organization members can read organization"
on public.organizations for select
using (id = public.current_organization_id());

create policy "users can read their profile"
on public.profiles for select
using (id = auth.uid());

create policy "organization members can read cost bands"
on public.cost_bands for select
using (organization_id = public.current_organization_id());

create policy "organization members can manage operational data"
on public.projects for all
using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());

create policy "organization members can manage meetings"
on public.meetings for all
using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());

create policy "organization members can manage anomalies"
on public.anomalies for all
using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());

create index meetings_organization_starts_at_idx on public.meetings (organization_id, starts_at desc);
create index projects_organization_idx on public.projects (organization_id);
create index anomalies_organization_status_idx on public.anomalies (organization_id, status);
