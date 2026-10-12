-- My Cloud Service storage setup
-- Run this in the Supabase SQL editor for the project that owns the `files` bucket.

insert into storage.buckets (id, name, public)
values ('files', 'files', true)
on conflict (id) do nothing;

update storage.buckets
set public = true
where id = 'files';

drop policy if exists "Public read access for files bucket" on storage.objects;
create policy "Public read access for files bucket"
on storage.objects
for select
to public
using (bucket_id = 'files');

drop policy if exists "Anonymous uploads to files bucket" on storage.objects;
create policy "Anonymous uploads to files bucket"
on storage.objects
for insert
to public
with check (bucket_id = 'files');

drop policy if exists "Anonymous deletes from files bucket" on storage.objects;
create policy "Anonymous deletes from files bucket"
on storage.objects
for delete
to public
using (bucket_id = 'files');

-- Optional hardening note:
-- The delete policy above allows any anonymous visitor to remove objects in the public bucket.
-- If that is too permissive for production, replace it with an authenticated or service-role flow.
