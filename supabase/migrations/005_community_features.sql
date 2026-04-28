begin;

create table if not exists public.user_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null check (target_type in ('club', 'spot')),
  target_id uuid not null,
  created_at timestamptz not null default now(),
  unique (user_id, target_type, target_id)
);

create table if not exists public.smoke_spot_media (
  id uuid primary key default gen_random_uuid(),
  spot_id uuid not null references public.smoke_spots(id) on delete cascade,
  image_url text not null,
  tags text[] not null default '{}',
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.smoke_spot_reports (
  id uuid primary key default gen_random_uuid(),
  spot_id uuid not null references public.smoke_spots(id) on delete cascade,
  reporter_id uuid not null references auth.users(id) on delete cascade,
  reason text not null,
  status text not null default 'open' check (status in ('open','reviewing','resolved','dismissed')),
  created_at timestamptz not null default now()
);

create table if not exists public.review_replies (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.reviews(id) on delete cascade,
  club_id uuid not null references public.clubs(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  reply_text text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (review_id, club_id)
);

create table if not exists public.club_interactions (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  user_id uuid null references auth.users(id) on delete set null,
  event_type text not null check (event_type in ('profile_view','menu_view','favorite','review')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.user_favorites enable row level security;
alter table public.smoke_spot_media enable row level security;
alter table public.smoke_spot_reports enable row level security;
alter table public.review_replies enable row level security;
alter table public.club_interactions enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='user_favorites' and policyname='user_favorites_select_own'
  ) then
    create policy "user_favorites_select_own" on public.user_favorites for select to authenticated using (user_id = auth.uid());
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='user_favorites' and policyname='user_favorites_insert_own'
  ) then
    create policy "user_favorites_insert_own" on public.user_favorites for insert to authenticated with check (user_id = auth.uid());
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='user_favorites' and policyname='user_favorites_delete_own'
  ) then
    create policy "user_favorites_delete_own" on public.user_favorites for delete to authenticated using (user_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='smoke_spot_media' and policyname='smoke_spot_media_select_auth'
  ) then
    create policy "smoke_spot_media_select_auth" on public.smoke_spot_media for select to authenticated using (true);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='smoke_spot_media' and policyname='smoke_spot_media_insert_own'
  ) then
    create policy "smoke_spot_media_insert_own" on public.smoke_spot_media for insert to authenticated with check (created_by = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='smoke_spot_reports' and policyname='smoke_spot_reports_insert_auth'
  ) then
    create policy "smoke_spot_reports_insert_auth" on public.smoke_spot_reports for insert to authenticated with check (reporter_id = auth.uid());
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='smoke_spot_reports' and policyname='smoke_spot_reports_select_auth'
  ) then
    create policy "smoke_spot_reports_select_auth" on public.smoke_spot_reports for select to authenticated using (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='review_replies' and policyname='review_replies_select_auth'
  ) then
    create policy "review_replies_select_auth" on public.review_replies for select to authenticated using (true);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='review_replies' and policyname='review_replies_upsert_club_owner'
  ) then
    create policy "review_replies_upsert_club_owner" on public.review_replies for all to authenticated
      using (exists (select 1 from public.clubs c where c.id = review_replies.club_id and c.owner_id = auth.uid()))
      with check (exists (select 1 from public.clubs c where c.id = review_replies.club_id and c.owner_id = auth.uid()));
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='club_interactions' and policyname='club_interactions_select_club_owner'
  ) then
    create policy "club_interactions_select_club_owner" on public.club_interactions for select to authenticated
      using (exists (select 1 from public.clubs c where c.id = club_interactions.club_id and c.owner_id = auth.uid()));
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='club_interactions' and policyname='club_interactions_insert_auth'
  ) then
    create policy "club_interactions_insert_auth" on public.club_interactions for insert to authenticated with check (true);
  end if;
end $$;

commit;
