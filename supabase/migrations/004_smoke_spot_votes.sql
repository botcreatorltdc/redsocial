begin;

create table if not exists public.smoke_spot_votes (
  id uuid primary key default gen_random_uuid(),
  spot_id uuid not null references public.smoke_spots(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  value smallint not null check (value in (-1, 1)),
  created_at timestamptz not null default now(),
  unique (spot_id, user_id)
);

create index if not exists idx_smoke_spot_votes_spot_id
  on public.smoke_spot_votes (spot_id);

alter table public.smoke_spot_votes enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='smoke_spot_votes' and policyname='smoke_spot_votes_select_all_auth'
  ) then
    create policy "smoke_spot_votes_select_all_auth"
      on public.smoke_spot_votes
      for select
      to authenticated
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='smoke_spot_votes' and policyname='smoke_spot_votes_insert_own'
  ) then
    create policy "smoke_spot_votes_insert_own"
      on public.smoke_spot_votes
      for insert
      to authenticated
      with check (user_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='smoke_spot_votes' and policyname='smoke_spot_votes_update_own'
  ) then
    create policy "smoke_spot_votes_update_own"
      on public.smoke_spot_votes
      for update
      to authenticated
      using (user_id = auth.uid())
      with check (user_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='smoke_spot_votes' and policyname='smoke_spot_votes_delete_own'
  ) then
    create policy "smoke_spot_votes_delete_own"
      on public.smoke_spot_votes
      for delete
      to authenticated
      using (user_id = auth.uid());
  end if;
end $$;

commit;
