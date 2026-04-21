begin;

create table if not exists public.inventory_audit_logs (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  actor_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid null references public.products(id) on delete set null,
  action text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_inventory_audit_logs_club_id_created_at
  on public.inventory_audit_logs (club_id, created_at desc);

alter table public.inventory_audit_logs enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='inventory_audit_logs' and policyname='inventory_audit_select_own_club'
  ) then
    create policy "inventory_audit_select_own_club"
      on public.inventory_audit_logs
      for select
      to authenticated
      using (
        exists (
          select 1
          from public.clubs c
          where c.id = inventory_audit_logs.club_id
            and c.owner_id = auth.uid()
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='inventory_audit_logs' and policyname='inventory_audit_insert_own_club'
  ) then
    create policy "inventory_audit_insert_own_club"
      on public.inventory_audit_logs
      for insert
      to authenticated
      with check (
        actor_id = auth.uid()
        and exists (
          select 1
          from public.clubs c
          where c.id = inventory_audit_logs.club_id
            and c.owner_id = auth.uid()
        )
      );
  end if;
end $$;

commit;
