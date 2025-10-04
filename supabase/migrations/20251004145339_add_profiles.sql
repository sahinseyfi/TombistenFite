-- Profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Policies: owner can select/insert/update own row (idempotent)
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'Enable read for users'
  ) then
    create policy "Enable read for users" on public.profiles
      for select using ( auth.uid() = id );
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'Enable insert for users'
  ) then
    create policy "Enable insert for users" on public.profiles
      for insert with check ( auth.uid() = id );
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'Enable update for users'
  ) then
    create policy "Enable update for users" on public.profiles
      for update using ( auth.uid() = id );
  end if;
end $$;
