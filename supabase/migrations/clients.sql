create table if not exists public.clients (
  id uuid primary key,
  company text not null,
  email text,
  phone text,
  country text,
  logo_url text,
  logo_path text,
  created_at timestamptz not null default now(),
  created_by uuid not null
);

alter table public.clients enable row level security;

drop policy if exists "clients_select_authenticated" on public.clients;
create policy "clients_select_authenticated"
on public.clients
for select
to authenticated
using (true);

drop policy if exists "clients_insert_admin" on public.clients;
create policy "clients_insert_admin"
on public.clients
for insert
to authenticated
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'Admin'
  )
);

drop policy if exists "clients_update_admin" on public.clients;
create policy "clients_update_admin"
on public.clients
for update
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'Admin'
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'Admin'
  )
);

drop policy if exists "clients_delete_admin" on public.clients;
create policy "clients_delete_admin"
on public.clients
for delete
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'Admin'
  )
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'clients',
  'clients',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "clients_storage_select_public" on storage.objects;
create policy "clients_storage_select_public"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'clients');

drop policy if exists "clients_storage_insert_admin" on storage.objects;
create policy "clients_storage_insert_admin"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'clients'
  and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'Admin'
  )
);

drop policy if exists "clients_storage_update_admin" on storage.objects;
create policy "clients_storage_update_admin"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'clients'
  and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'Admin'
  )
)
with check (
  bucket_id = 'clients'
  and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'Admin'
  )
);

drop policy if exists "clients_storage_delete_admin" on storage.objects;
create policy "clients_storage_delete_admin"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'clients'
  and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'Admin'
  )
);

