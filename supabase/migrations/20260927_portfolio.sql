create table public.portfolio_profile (
 id integer primary key check (id = 1),
 document jsonb not null check (jsonb_typeof(document) = 'object'),
 revision uuid not null default gen_random_uuid(),
 updated_at timestamptz not null default now()
);
alter table public.portfolio_profile enable row level security;
revoke all on public.portfolio_profile from anon, authenticated;
grant select on public.portfolio_profile to anon, authenticated;
grant all on public.portfolio_profile to service_role;
create policy "Published portfolio is public" on public.portfolio_profile for select to anon, authenticated using (id = 1);
create table public.portfolio_login_attempts (
 id bigint generated always as identity primary key,
 ip_hash text not null,
 created_at timestamptz not null default now()
);
create index portfolio_login_attempts_time on public.portfolio_login_attempts(created_at);
alter table public.portfolio_login_attempts enable row level security;
revoke all on public.portfolio_login_attempts from anon, authenticated;
grant all on public.portfolio_login_attempts to service_role;
grant usage, select on sequence public.portfolio_login_attempts_id_seq to service_role;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('portfolio-assets','portfolio-assets',true,20971520,array['image/jpeg','image/png','application/pdf']);
