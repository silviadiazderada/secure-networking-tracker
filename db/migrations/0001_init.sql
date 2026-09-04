-- ===========================================================================
-- 0001_init.sql  —  contacts table, validation constraints, and RLS policies
-- ===========================================================================
-- Run once against a fresh Neon database:  npm run db:migrate
-- Safe to re-run: policies and triggers are dropped and recreated.
--
-- Security model
-- --------------
-- The browser talks to the Neon Data API directly using the signed-in user's
-- Better Auth JWT. Postgres Row Level Security is the ONLY thing standing
-- between one user and another user's rows, so every access path below is
-- constrained to `user_id = auth.user_id()`.
--   * auth.user_id()  -> text id of the user in the current JWT (provided by
--                        Neon Managed Better Auth)
--   * authenticated   -> the Postgres role the Data API uses for requests that
--                        carry a valid JWT
--   * anon            -> the role for requests with no JWT (granted nothing)
-- ===========================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Table
-- ---------------------------------------------------------------------------
create table if not exists public.contacts (
  id          uuid        primary key default gen_random_uuid(),

  -- Ownership. Defaults to the caller's id and can never be null, so a row
  -- always belongs to exactly one user even if the client omits the field.
  user_id     text        not null default auth.user_id(),

  name        text        not null,
  company     text,
  role        text,
  where_met   text,
  notes       text,
  priority    text        not null default 'medium',

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  -- Backend validation, enforced by the database regardless of the client.
  constraint contacts_name_not_blank check (btrim(name) <> ''),
  constraint contacts_name_len       check (char_length(name) <= 200),
  constraint contacts_priority_valid check (priority in ('high', 'medium', 'low'))
);

create index if not exists contacts_user_id_idx     on public.contacts (user_id);
create index if not exists contacts_user_created_idx on public.contacts (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Keep updated_at current on every UPDATE
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists contacts_set_updated_at on public.contacts;
create trigger contacts_set_updated_at
  before update on public.contacts
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.contacts enable row level security;
alter table public.contacts force  row level security;  -- applies to the table owner too

-- Separate policy per operation, each scoped to the signed-in user.

drop policy if exists contacts_select on public.contacts;
create policy contacts_select on public.contacts
  for select
  to authenticated
  using (user_id = auth.user_id());

drop policy if exists contacts_insert on public.contacts;
create policy contacts_insert on public.contacts
  for insert
  to authenticated
  with check (user_id = auth.user_id());

drop policy if exists contacts_update on public.contacts;
create policy contacts_update on public.contacts
  for update
  to authenticated
  using      (user_id = auth.user_id())   -- may only target your own rows
  with check (user_id = auth.user_id());  -- ...and may not reassign them to anyone else

drop policy if exists contacts_delete on public.contacts;
create policy contacts_delete on public.contacts
  for delete
  to authenticated
  using (user_id = auth.user_id());

-- ---------------------------------------------------------------------------
-- Grants for the Data API roles (RLS still filters every row)
--   authenticated -> request carried a valid Neon Auth JWT
--   anonymous     -> request had no JWT (granted nothing on contacts)
-- ---------------------------------------------------------------------------
grant usage on schema public to authenticated;
grant select, insert, update, delete on public.contacts to authenticated;

revoke all on public.contacts from anonymous;
