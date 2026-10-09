-- BarberFlow / migration 0001
-- Execute ONLY on a newly created dedicated BarberFlow Supabase project.
create extension if not exists pgcrypto;
create extension if not exists btree_gist;

create table public.barbershops (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  timezone text not null default 'America/Sao_Paulo',
  logo_url text, primary_color text not null default '#c49a55',
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.barbershops(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','manager','barber','reception')),
  created_at timestamptz not null default now(),
  unique(shop_id,user_id)
);
create table public.professionals (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.barbershops(id) on delete cascade,
  membership_id uuid references public.memberships(id) on delete set null,
  name text not null, photo_url text, active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(id,shop_id)
);
create table public.services (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.barbershops(id) on delete cascade,
  name text not null,
  duration_minutes integer not null check(duration_minutes between 5 and 480),
  price_cents integer not null check(price_cents >= 0),
  active boolean not null default true,
  unique(id,shop_id)
);
create table public.professional_services (
  shop_id uuid not null references public.barbershops(id) on delete cascade,
  professional_id uuid not null,
  service_id uuid not null,
  primary key(professional_id,service_id),
  foreign key(professional_id,shop_id) references public.professionals(id,shop_id) on delete cascade,
  foreign key(service_id,shop_id) references public.services(id,shop_id) on delete cascade
);
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.barbershops(id) on delete cascade,
  name text not null,
  phone_e164 text not null check(phone_e164 ~ '^\+[1-9][0-9]{7,14}$'),
  consent_at timestamptz,
  created_at timestamptz not null default now(),
  unique(id,shop_id),unique(shop_id,phone_e164)
);
create table public.working_hours (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.barbershops(id) on delete cascade,
  professional_id uuid not null,
  weekday smallint not null check(weekday between 0 and 6),
  start_local time not null, end_local time not null,
  check (end_local > start_local),
  foreign key(professional_id,shop_id) references public.professionals(id,shop_id) on delete cascade
);
create table public.time_off (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.barbershops(id) on delete cascade,
  professional_id uuid not null,
  starts_at timestamptz not null, ends_at timestamptz not null,
  check(ends_at > starts_at),
  foreign key(professional_id,shop_id) references public.professionals(id,shop_id) on delete cascade
);
create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.barbershops(id) on delete cascade,
  professional_id uuid not null, service_id uuid not null, client_id uuid not null,
  starts_at timestamptz not null, ends_at timestamptz not null,
  status text not null default 'confirmed' check(status in ('pending','confirmed','completed','cancelled','no_show')),
  price_cents integer not null check(price_cents >= 0),
  created_at timestamptz not null default now(),
  check(ends_at > starts_at),
  foreign key(professional_id,shop_id) references public.professionals(id,shop_id),
  foreign key(service_id,shop_id) references public.services(id,shop_id),
  foreign key(client_id,shop_id) references public.clients(id,shop_id)
);
-- Prevent overlapping active appointments for a professional even under concurrent requests.
alter table public.appointments add constraint no_overlapping_appointments
 exclude using gist (professional_id with =, tstzrange(starts_at,ends_at,'[)') with &&)
 where (status in ('pending','confirmed','completed'));
create index appointments_shop_start_idx on public.appointments(shop_id,starts_at);
create index membership_user_idx on public.memberships(user_id,shop_id);

create function public.is_shop_member(target_shop uuid) returns boolean language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.memberships m where m.shop_id = target_shop and m.user_id = (select auth.uid()))
$$;
revoke all on function public.is_shop_member(uuid) from public;
grant execute on function public.is_shop_member(uuid) to authenticated;

-- Turn RLS on all tenant tables. Clients are public-booking participants, NOT authenticated dashboard users.
alter table public.barbershops enable row level security;
alter table public.memberships enable row level security;
alter table public.professionals enable row level security;
alter table public.services enable row level security;
alter table public.professional_services enable row level security;
alter table public.clients enable row level security;
alter table public.working_hours enable row level security;
alter table public.time_off enable row level security;
alter table public.appointments enable row level security;

create policy "member shop read" on public.barbershops for select to authenticated using (public.is_shop_member(id));
create policy "member memberships read" on public.memberships for select to authenticated using (public.is_shop_member(shop_id));
create policy "member professionals read" on public.professionals for select to authenticated using (public.is_shop_member(shop_id));
create policy "member services read" on public.services for select to authenticated using (public.is_shop_member(shop_id));
create policy "member professional services read" on public.professional_services for select to authenticated using (public.is_shop_member(shop_id));
create policy "member clients read" on public.clients for select to authenticated using (public.is_shop_member(shop_id));
create policy "member working hours read" on public.working_hours for select to authenticated using (public.is_shop_member(shop_id));
create policy "member time off read" on public.time_off for select to authenticated using (public.is_shop_member(shop_id));
create policy "member appointments read" on public.appointments for select to authenticated using (public.is_shop_member(shop_id));

-- Intentional deny-by-default: no writes to tenant tables for anon/authenticated yet.
-- All writes and anonymous booking MUST go through validated server endpoints.
-- A later migration will add role-scoped administrative writes and controlled public availability.
