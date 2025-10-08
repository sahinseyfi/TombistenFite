do
$$
begin
  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'Enable read for users'
  ) then
    drop policy "Enable read for users" on public.profiles;
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'Enable read for owners'
  ) then
    create policy "Enable read for owners" on public.profiles
      for select using (auth.uid() = id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'Enable read for all'
  ) then
    create policy "Enable read for all" on public.profiles
      for select using (true);
  end if;
end
$$;
