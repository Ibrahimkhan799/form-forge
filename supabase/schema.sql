-- FormForge Supabase schema
-- Enable Anonymous Sign-Ins in Supabase Auth before using the browser client.

create extension if not exists pgcrypto;

create table if not exists public.forms (
  id text primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  published boolean not null default false,
  document jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.submissions (
  id text primary key,
  form_id text not null references public.forms(id) on delete cascade,
  submitter_id uuid references auth.users(id) on delete set null,
  payload jsonb not null,
  completed boolean not null default true,
  submitted_at timestamptz not null default now()
);

create table if not exists public.form_visits (
  id text primary key,
  form_id text not null references public.forms(id) on delete cascade,
  visitor_id uuid references auth.users(id) on delete set null,
  visited_at timestamptz not null default now()
);

create index if not exists forms_owner_updated_idx
  on public.forms(owner_id, updated_at desc);
create index if not exists submissions_form_submitted_idx
  on public.submissions(form_id, submitted_at desc);
create index if not exists visits_form_visited_idx
  on public.form_visits(form_id, visited_at desc);

alter table public.forms enable row level security;
alter table public.submissions enable row level security;
alter table public.form_visits enable row level security;

drop policy if exists "Read owned or published forms" on public.forms;
create policy "Read owned or published forms"
  on public.forms for select
  using (published or owner_id = auth.uid());

drop policy if exists "Create owned forms" on public.forms;
create policy "Create owned forms"
  on public.forms for insert
  with check (owner_id = auth.uid());

drop policy if exists "Update owned forms" on public.forms;
create policy "Update owned forms"
  on public.forms for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

drop policy if exists "Delete owned forms" on public.forms;
create policy "Delete owned forms"
  on public.forms for delete
  using (owner_id = auth.uid());

drop policy if exists "Submit to published forms" on public.submissions;
create policy "Submit to published forms"
  on public.submissions for insert
  with check (
    submitter_id = auth.uid()
    and exists (
      select 1 from public.forms
      where forms.id = form_id and forms.published
    )
  );

drop policy if exists "Owners read form submissions" on public.submissions;
create policy "Owners read form submissions"
  on public.submissions for select
  using (
    exists (
      select 1 from public.forms
      where forms.id = form_id and forms.owner_id = auth.uid()
    )
  );

drop policy if exists "Record visits to published forms" on public.form_visits;
create policy "Record visits to published forms"
  on public.form_visits for insert
  with check (
    visitor_id = auth.uid()
    and exists (
      select 1 from public.forms
      where forms.id = form_id and forms.published
    )
  );

drop policy if exists "Owners read form visits" on public.form_visits;
create policy "Owners read form visits"
  on public.form_visits for select
  using (
    exists (
      select 1 from public.forms
      where forms.id = form_id and forms.owner_id = auth.uid()
    )
  );

insert into storage.buckets (id, name, public, file_size_limit)
values ('formforge-assets', 'formforge-assets', true, 10485760)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit;

drop policy if exists "Authenticated users upload assets" on storage.objects;
create policy "Authenticated users upload assets"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'formforge-assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Public reads FormForge assets" on storage.objects;
create policy "Public reads FormForge assets"
  on storage.objects for select
  using (bucket_id = 'formforge-assets');

drop policy if exists "Users delete own FormForge assets" on storage.objects;
create policy "Users delete own FormForge assets"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'formforge-assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
