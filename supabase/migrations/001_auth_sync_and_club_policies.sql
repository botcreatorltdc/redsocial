-- Canonical setup for auth sync and B2B club access.
-- Run in Supabase SQL Editor for each environment (dev/prod).

begin;

-- Ensure RLS is active on clubs.
alter table public.clubs enable row level security;

-- Policies for club owners.
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='clubs' and policyname='clubs_select_own'
  ) then
    create policy "clubs_select_own"
      on public.clubs
      for select
      to authenticated
      using (owner_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='clubs' and policyname='clubs_insert_own'
  ) then
    create policy "clubs_insert_own"
      on public.clubs
      for insert
      to authenticated
      with check (owner_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='clubs' and policyname='clubs_update_own'
  ) then
    create policy "clubs_update_own"
      on public.clubs
      for update
      to authenticated
      using (owner_id = auth.uid())
      with check (owner_id = auth.uid());
  end if;
end $$;

-- Sync auth.users -> public.profiles
create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, username, full_name)
  values (new.id, split_part(new.email, '@', 1), null)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;

create trigger on_auth_user_created_profile
after insert on auth.users
for each row execute procedure public.handle_new_user_profile();

-- Sync auth.users -> public.users
create or replace function public.handle_new_user_public_users()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.users (id, email, nickname, avatar_url, birth_date, is_verified, preferences_json, created_at)
  values (
    new.id,
    new.email,
    split_part(new.email, '@', 1),
    null,
    null,
    false,
    '{}'::jsonb,
    now()
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_users on auth.users;

create trigger on_auth_user_created_users
after insert on auth.users
for each row execute procedure public.handle_new_user_public_users();

commit;
