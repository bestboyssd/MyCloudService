-- Incremental Supabase policy fix for My Cloud Service
-- Run this if your bucket already exists and delete/upload policies need to be corrected.

insert into storage.buckets (id, name, public)
values ('files', 'files', true)
on conflict (id) do nothing;

update storage.buckets
set public = true
where id = 'files';

drop policy if exists "Allow anonymous uploads" on storage.objects;
drop policy if exists "Allow anonymous select" on storage.objects;
drop policy if exists "Allow authenticated delete" on storage.objects;
drop policy if exists "Public read access for files bucket" on storage.objects;
drop policy if exists "Anonymous uploads to files bucket" on storage.objects;
drop policy if exists "Anonymous deletes from files bucket" on storage.objects;

create policy "Public read access for files bucket"
on storage.objects
for select
to public
using (bucket_id = 'files');

create policy "Anonymous uploads to files bucket"
on storage.objects
for insert
to public
with check (bucket_id = 'files');

create policy "Anonymous deletes from files bucket"
on storage.objects
for delete
to public
using (bucket_id = 'files');

-- Note:
-- This allows anonymous delete for every object in the public `files` bucket.
-- Keep it only if you want browser-side anonymous delete to work.
