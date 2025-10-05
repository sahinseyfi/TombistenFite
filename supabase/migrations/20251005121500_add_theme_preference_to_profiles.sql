-- Theme preference for user profiles
alter table public.profiles
  add column if not exists theme_preference text check (theme_preference in ('light', 'dark')) default 'light';

update public.profiles
set theme_preference = coalesce(theme_preference, 'light');
