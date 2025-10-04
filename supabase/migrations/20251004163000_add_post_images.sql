-- Add optional image url to posts
alter table if exists public.posts
  add column if not exists image_url text;

-- Storage bucket for post images
insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Public read for post images'
  ) then
    create policy "Public read for post images" on storage.objects
      for select using ( bucket_id = 'post-images' );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Upload post image for owner'
  ) then
    create policy "Upload post image for owner" on storage.objects
      for insert with check ( bucket_id = 'post-images' and auth.uid() = owner );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Update post image for owner'
  ) then
    create policy "Update post image for owner" on storage.objects
      for update using ( bucket_id = 'post-images' and auth.uid() = owner );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Delete post image for owner'
  ) then
    create policy "Delete post image for owner" on storage.objects
      for delete using ( bucket_id = 'post-images' and auth.uid() = owner );
  end if;
end $$;
