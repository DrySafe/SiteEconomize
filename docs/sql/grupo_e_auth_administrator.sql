create table public.grupo_e_admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','manager','editor')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.grupo_e_admin_users enable row level security;
revoke all on public.grupo_e_admin_users from public, anon, authenticated;
grant all on public.grupo_e_admin_users to service_role;
alter table public.grupo_e_sessions add column user_id uuid references auth.users(id) on delete cascade;
alter table public.grupo_e_sessions add column auth_version timestamptz;
create index grupo_e_sessions_user_idx on public.grupo_e_sessions(user_id);
insert into public.grupo_e_admin_users(user_id,role)
select id,'admin' from auth.users where lower(email)='contato@lojaseconomize.com.br' and email_confirmed_at is not null;
