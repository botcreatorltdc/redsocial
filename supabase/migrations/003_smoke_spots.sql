begin;

create table if not exists public.smoke_spots (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text null,
  lat double precision not null,
  lng double precision not null,
  danger_level smallint not null check (danger_level between 1 and 5),
  tranquility_level smallint not null check (tranquility_level between 1 and 5),
  comfort_level smallint not null check (comfort_level between 1 and 5),
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists idx_smoke_spots_created_at
  on public.smoke_spots (created_at desc);

alter table public.smoke_spots enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='smoke_spots' and policyname='smoke_spots_select_all_auth'
  ) then
    create policy "smoke_spots_select_all_auth"
      on public.smoke_spots
      for select
      to authenticated
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='smoke_spots' and policyname='smoke_spots_insert_own'
  ) then
    create policy "smoke_spots_insert_own"
      on public.smoke_spots
      for insert
      to authenticated
      with check (created_by = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='smoke_spots' and policyname='smoke_spots_update_own'
  ) then
    create policy "smoke_spots_update_own"
      on public.smoke_spots
      for update
      to authenticated
      using (created_by = auth.uid())
      with check (created_by = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='smoke_spots' and policyname='smoke_spots_delete_own'
  ) then
    create policy "smoke_spots_delete_own"
      on public.smoke_spots
      for delete
      to authenticated
      using (created_by = auth.uid());
  end if;
end $$;

commit;
