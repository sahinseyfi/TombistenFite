-- Posts table (public readable, owners can insert/update/delete)
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamp with time zone default now()
);

alter table public.posts enable row level security;

-- RLS policies (idempotent)
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'posts' and policyname = 'Read posts for all'
  ) then
    create policy "Read posts for all" on public.posts
      for select using ( true );
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'posts' and policyname = 'Insert own posts'
  ) then
    create policy "Insert own posts" on public.posts
      for insert with check ( auth.uid() = author_id );
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'posts' and policyname = 'Update own posts'
  ) then
    create policy "Update own posts" on public.posts
      for update using ( auth.uid() = author_id );
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'posts' and policyname = 'Delete own posts'
  ) then
    create policy "Delete own posts" on public.posts
      for delete using ( auth.uid() = author_id );
  end if;
end $$;
