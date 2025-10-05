-- Post likes table for reactions
create table if not exists public.post_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now(),
  constraint post_likes_unique unique (post_id, user_id)
);

create index if not exists post_likes_post_id_idx on public.post_likes(post_id);
create index if not exists post_likes_user_id_idx on public.post_likes(user_id);

alter table public.post_likes enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'post_likes' and policyname = 'Read likes for all'
  ) then
    create policy "Read likes for all" on public.post_likes
      for select using ( true );
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'post_likes' and policyname = 'Insert own likes'
  ) then
    create policy "Insert own likes" on public.post_likes
      for insert with check ( auth.uid() = user_id );
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'post_likes' and policyname = 'Delete own likes'
  ) then
    create policy "Delete own likes" on public.post_likes
      for delete using ( auth.uid() = user_id );
  end if;
end $$;

-- Post comments table
create table if not exists public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  content text not null check (char_length(trim(content)) > 0 and char_length(content) <= 500),
  created_at timestamp with time zone default now()
);

create index if not exists post_comments_post_id_idx on public.post_comments(post_id);
create index if not exists post_comments_author_id_idx on public.post_comments(author_id);

alter table public.post_comments enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'post_comments' and policyname = 'Read comments for all'
  ) then
    create policy "Read comments for all" on public.post_comments
      for select using ( true );
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'post_comments' and policyname = 'Insert own comments'
  ) then
    create policy "Insert own comments" on public.post_comments
      for insert with check ( auth.uid() = author_id );
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'post_comments' and policyname = 'Update own comments'
  ) then
    create policy "Update own comments" on public.post_comments
      for update using ( auth.uid() = author_id );
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'post_comments' and policyname = 'Delete own comments'
  ) then
    create policy "Delete own comments" on public.post_comments
      for delete using ( auth.uid() = author_id );
  end if;
end $$;
