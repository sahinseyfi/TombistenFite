-- Avatar storage bucket and policies
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Storage RLS policies
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Public read for avatars'
  ) then
    create policy "Public read for avatars" on storage.objects
      for select using ( bucket_id = 'avatars' );
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Upload avatar for owner'
  ) then
    create policy "Upload avatar for owner" on storage.objects
      for insert with check ( bucket_id = 'avatars' and auth.uid() = owner );
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Update avatar for owner'
  ) then
    create policy "Update avatar for owner" on storage.objects
      for update using ( bucket_id = 'avatars' and auth.uid() = owner );
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Delete avatar for owner'
  ) then
    create policy "Delete avatar for owner" on storage.objects
      for delete using ( bucket_id = 'avatars' and auth.uid() = owner );
  end if;
end $$;
