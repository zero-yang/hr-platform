-- Run this in Supabase SQL Editor for the project used by NEXT_PUBLIC_SUPABASE_URL.
-- The browser uses the anon/publishable key, so SQL Editor as postgres can see rows
-- even when the app receives [] unless RLS policies allow the anon role.

alter table public.job_post enable row level security;
alter table public.talent_pool enable row level security;

drop policy if exists "Allow anon read job posts" on public.job_post;
create policy "Allow anon read job posts"
on public.job_post
for select
to anon
using (true);

drop policy if exists "Allow anon insert talent records" on public.talent_pool;
create policy "Allow anon insert talent records"
on public.talent_pool
for insert
to anon
with check (true);

drop policy if exists "Allow anon read talent records" on public.talent_pool;
create policy "Allow anon read talent records"
on public.talent_pool
for select
to anon
using (true);
