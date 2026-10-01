-- Aplicar no projeto xqytfpihewumqtovnqyb. Nenhuma tabela existente é removida.
create table if not exists public.grupo_e_events (
  id text primary key,
  slug text unique not null,
  status text not null check (status in ('draft', 'published')),
  published_at timestamptz not null,
  data jsonb not null,
  constraint grupo_e_events_consistent check (
    data ?& array['id','slug','status'] and
    data->>'id' = id and data->>'slug' = slug and data->>'status' = status
  )
);
create index if not exists grupo_e_events_published_idx on public.grupo_e_events(published_at desc) where status = 'published';
create table if not exists public.grupo_e_sessions (
  token text primary key check (token ~ '^[a-f0-9]{64}$'),
  expires_at timestamptz not null
);
create index if not exists grupo_e_sessions_expiry_idx on public.grupo_e_sessions(expires_at);
create table if not exists public.grupo_e_login_attempts (
  key text primary key,
  count integer not null check (count between 1 and 10),
  expires_at timestamptz not null
);
create table if not exists public.grupo_e_media (
  id uuid primary key,
  storage_path text unique not null,
  content_type text not null check (content_type in ('image/jpeg','image/png','image/webp'))
);

alter table public.grupo_e_events enable row level security;
alter table public.grupo_e_sessions enable row level security;
alter table public.grupo_e_login_attempts enable row level security;
alter table public.grupo_e_media enable row level security;
revoke all on public.grupo_e_events, public.grupo_e_sessions, public.grupo_e_login_attempts, public.grupo_e_media from anon, authenticated;
grant select on public.grupo_e_events to anon, authenticated;
grant all on public.grupo_e_events, public.grupo_e_sessions, public.grupo_e_login_attempts, public.grupo_e_media to service_role;
drop policy if exists grupo_e_public_events on public.grupo_e_events;
create policy grupo_e_public_events on public.grupo_e_events for select to anon, authenticated using (status = 'published');
-- Sessões, metadados de imagens e tentativas são exclusivos do servidor (service_role).

create or replace function public.grupo_e_allow_login()
returns boolean language plpgsql security invoker set search_path = '' as $$
declare updated_count integer;
begin
  insert into public.grupo_e_login_attempts(key, count, expires_at)
  values ('admin', 1, now() + interval '15 minutes')
  on conflict (key) do update set
    count = case when grupo_e_login_attempts.expires_at <= now() then 1 else grupo_e_login_attempts.count + 1 end,
    expires_at = case when grupo_e_login_attempts.expires_at <= now() then now() + interval '15 minutes' else grupo_e_login_attempts.expires_at end
  where grupo_e_login_attempts.expires_at <= now() or grupo_e_login_attempts.count < 10
  returning count into updated_count;
  return updated_count is not null;
end;
$$;
revoke all on function public.grupo_e_allow_login() from public, anon, authenticated;
grant execute on function public.grupo_e_allow_login() to service_role;

-- Bucket privado; upload e download são feitos no servidor após autorização.
insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('grupo-e-eventos', 'grupo-e-eventos', false, 3145728, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

-- Conteúdos históricos fornecidos pelo cliente; não substitui edições existentes.
insert into public.grupo_e_events(id,slug,status,published_at,data) values
('caixa-presente-dia-das-maes','caixa-presente-dia-das-maes','published','2025-04-30T12:00:00Z','{"id":"caixa-presente-dia-das-maes","slug":"caixa-presente-dia-das-maes","title":"Caixa presente Dia das Mães com Viviane Resende","excerpt":"Biscoitos e chocolates personalizados para encantar no sabor e na apresentação. Uma aula de caixa presente para o Dia das Mães no Centro Culinário Hiper Economize.","body":"Biscoitos e chocolates personalizados para encantar no sabor e na apresentação. Uma aula de caixa presente para o Dia das Mães no Centro Culinário Hiper Economize.\n\nAprendizado e troca de experiências para ampliar o repertório de quem trabalha com produção food.\n\nEste encontro faz parte do nosso arquivo. Converse com nossa equipe para conhecer as próximas oportunidades de aprendizado no Centro Culinário Hiper Economize.","image":"/images/Curso-Viviane-Resende-e1746023502355.png","category":"Cursos","location":"Centro Culinário Hiper Economize · Aracaju","instructor":"Viviane Resende","publishedAt":"2025-04-30T12:00:00Z","eventDate":"","registrationUrl":"","status":"published","archived":true}'::jsonb),
('bolo-de-puba-e-leite','bolo-de-puba-e-leite','published','2025-04-30T12:00:00Z','{"id":"bolo-de-puba-e-leite","slug":"bolo-de-puba-e-leite","title":"Bolo de puba e bolo de leite com Viviane Resende","excerpt":"Tradição e sabor do Nordeste: uma aula presencial sobre bolo de puba e bolo de leite com Viviane Resende, para enriquecer seu repertório de receitas.","body":"Tradição e sabor do Nordeste: uma aula presencial sobre bolo de puba e bolo de leite com Viviane Resende, para enriquecer seu repertório de receitas.\n\nAprendizado e troca de experiências para ampliar o repertório de quem trabalha com produção food.\n\nEste encontro faz parte do nosso arquivo. Converse com nossa equipe para conhecer as próximas oportunidades de aprendizado no Centro Culinário Hiper Economize.","image":"/images/Curso-Viviane-Resende-26-Hiper-e1746022747643.png","category":"Cursos","location":"Centro Culinário Hiper Economize · Aracaju","instructor":"Viviane Resende","publishedAt":"2025-04-30T12:00:00Z","eventDate":"","registrationUrl":"","status":"published","archived":true}'::jsonb),
('licor-artesanal','licor-artesanal','published','2025-04-30T12:00:00Z','{"id":"licor-artesanal","slug":"licor-artesanal","title":"Licor artesanal com Ana Carla","excerpt":"Sabor, aroma e apresentação: uma aula presencial sobre licor artesanal com Ana Carla, para ampliar seu repertório de produção.","body":"Sabor, aroma e apresentação: uma aula presencial sobre licor artesanal com Ana Carla, para ampliar seu repertório de produção.\n\nAprendizado e troca de experiências para ampliar o repertório de quem trabalha com produção food.\n\nEste encontro faz parte do nosso arquivo. Converse com nossa equipe para conhecer as próximas oportunidades de aprendizado no Centro Culinário Hiper Economize.","image":"/images/Curso-Ana-Carla-e1746023007188.png","category":"Cursos","location":"Centro Culinário Hiper Economize · Aracaju","instructor":"Ana Carla","publishedAt":"2025-04-30T12:00:00Z","eventDate":"","registrationUrl":"","status":"published","archived":true}'::jsonb),
('festa-na-caixa','festa-na-caixa','published','2025-04-30T12:00:00Z','{"id":"festa-na-caixa","slug":"festa-na-caixa","title":"Festa na caixa com Thaiane Bispo","excerpt":"Uma proposta criativa para o Dia dos Namorados. Festa na caixa combina sabor e apresentação para surpreender no presente e nas vendas.","body":"Uma proposta criativa para o Dia dos Namorados. Festa na caixa combina sabor e apresentação para surpreender no presente e nas vendas.\n\nAprendizado e troca de experiências para ampliar o repertório de quem trabalha com produção food.\n\nEste encontro faz parte do nosso arquivo. Converse com nossa equipe para conhecer as próximas oportunidades de aprendizado no Centro Culinário Hiper Economize.","image":"/images/Curso-Thaiane-Bispo-e1746022358335.png","category":"Cursos","location":"Centro Culinário Hiper Economize · Aracaju","instructor":"Thaiane Bispo","publishedAt":"2025-04-30T12:00:00Z","eventDate":"","registrationUrl":"","status":"published","archived":true}'::jsonb),
('dia-dos-namorados','dia-dos-namorados','published','2025-05-02T12:00:00Z','{"id":"dia-dos-namorados","slug":"dia-dos-namorados","title":"Criações para o Dia dos Namorados","excerpt":"Uma aula presencial com a chef Priscila Costa, dedicada a transformar amor em sabor no Centro Culinário Hiper Economize.","body":"Uma aula presencial com a chef Priscila Costa, dedicada a transformar amor em sabor no Centro Culinário Hiper Economize.\n\nAprendizado e troca de experiências para ampliar o repertório de quem trabalha com produção food.\n\nEste encontro faz parte do nosso arquivo. Converse com nossa equipe para conhecer as próximas oportunidades de aprendizado no Centro Culinário Hiper Economize.","image":"/images/WhatsApp-Image-2025-04-30-at-12.41.38-e1746205981220.jpeg","category":"Cursos","location":"Centro Culinário Hiper Economize · Aracaju","instructor":"Chef Priscila Costa","publishedAt":"2025-05-02T12:00:00Z","eventDate":"","registrationUrl":"","status":"published","archived":true}'::jsonb)
on conflict (id) do nothing;
