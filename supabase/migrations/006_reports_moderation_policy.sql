begin;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='smoke_spot_reports' and policyname='smoke_spot_reports_update_auth'
  ) then
    create policy "smoke_spot_reports_update_auth"
      on public.smoke_spot_reports
      for update
      to authenticated
      using (true)
      with check (status in ('open','reviewing','resolved','dismissed'));
  end if;
end $$;

commit;
