# GRUPO E

Site institucional e blog de cursos e eventos, com painel administrativo. Next.js 16, React, TypeScript e Tailwind CSS v4. Fonte Inter hospedada junto ao projeto.

## Vercel + Supabase

O projeto usa **Supabase Postgres** para eventos e sessões, e **Supabase Storage** para capas. Não depende de disco local e é compatível com as funções da Vercel. Requer Node.js 24.x.

### 1. Preparar o banco

No projeto `xqytfpihewumqtovnqyb`, abra o SQL Editor e execute todo o conteúdo de `supabase/migrations/20261001210502_grupo_e_supabase.sql`. A migração cria tabelas com prefixo `grupo_e_`, regras RLS, um bucket privado `grupo-e-eventos` e os cinco cursos históricos. Ela não apaga tabelas de outros sistemas e pode ser repetida sem sobrescrever os conteúdos importados ou editados.

Com Supabase CLI autenticado, a alternativa é `supabase link --project-ref xqytfpihewumqtovnqyb` seguido de `supabase db push`. Não use as duas alternativas no mesmo fluxo sem reconciliar o histórico de migração.

### 2. Configurar a Vercel

Em **Settings → Environment Variables**, adicione para **Production** e **Preview**:

| Variável              | Valor                                                  |
| --------------------- | ------------------------------------------------------ |
| `SUPABASE_URL`        | `https://xqytfpihewumqtovnqyb.supabase.co`             |
| `SUPABASE_SECRET_KEY` | Chave secreta obtida em Supabase → Settings → API Keys |
| `ADMIN_EMAIL`         | E-mail escolhido para o administrador do site          |
| `ADMIN_PASSWORD_HASH` | Hash gerado com `npm run admin:setup`                  |

A chave secreta começa com `sb_secret_`. O projeto aceita `SUPABASE_SERVICE_ROLE_KEY` para a chave `service_role` legada, se necessário. **A chave publishable/anon não substitui a chave secreta nesta implementação.** Nunca acrescente `NEXT_PUBLIC_` ao nome da chave secreta e nunca a envie em chat, GitHub ou código frontend. A chave não é a senha do banco.

O login do site usa suas próprias credenciais de administrador, distintas da conta usada para entrar no painel Supabase. Não há cadastro público nem senha padrão. Gere o hash localmente, com entrada oculta e senha de pelo menos 12 caracteres; guarde as credenciais no seu gerenciador de senhas.

Em **Settings → Build and Deployment**: Next.js, raiz do repositório, `npm ci`, `npm run build`, saída padrão e Node.js 24.x. Faça **Redeploy** após salvar as variáveis. `DATA_DIR` deixou de ser utilizada e pode ser removida.

Sem URL/chave configuradas, as páginas públicas exibem os cursos históricos do projeto e o login fica indisponível. Isso permite conferir o institucional durante a configuração. Com o banco configurado, erros de conexão não são mascarados por esse conteúdo e devem ser corrigidos.

### 3. Verificar o banco

Depois da migração, execute no SQL Editor:

```sql
select count(*) from public.grupo_e_events;
select id, public, file_size_limit from storage.buckets where id = 'grupo-e-eventos';
```

São esperados cinco conteúdos iniciais e bucket privado com limite de 3 MB. Entre em `/admin`, crie um rascunho com capa, publique e confirme a página no blog. Conteúdos e sessões persistem em novos deploys; não ficam em `/tmp`.

## Executar localmente

```sh
npm ci
cp .env.example .env.local
npm run admin:setup
# Preencha a URL/chave e copie ADMIN_EMAIL/ADMIN_PASSWORD_HASH para .env.local.
npm run dev
```

Abra `/` para o institucional, `/cursos-e-eventos` para o blog e `/admin` para administrar. Nunca envie `.env.local` ao repositório.

## Cadastrar um encontro

1. Acesse `/admin` e faça login.
2. Clique em **Novo conteúdo**.
3. Informe título, resumo e texto; envie uma capa JPG, PNG ou WebP de até 3 MB.
4. Escolha categoria e visibilidade. Um rascunho fica acessível somente no painel.
5. Para cursos/eventos novos, informe data e horário de Brasília, local, instrutor e link HTTPS de inscrição (opcional). Sem link, o atendimento segue para o WhatsApp.
6. Salve. A publicação aparece no blog e tem sua própria página. O painel permite editar e excluir com confirmação.

Marque **Conteúdo de arquivo** para encontros antigos sem data de realização confirmada. O site sinaliza arquivo e não oferece inscrições para eventos passados. Dicas e novidades não exigem data de encontro. O texto é renderizado como texto simples, sem HTML.

## Segurança e persistência

A chave Supabase é usada exclusivamente no servidor, em módulo `server-only`. O site filtra o acesso público para conteúdos publicados. RLS permite leitura de eventos publicados por `anon`/`authenticated` e impede escrita direta. Sessões, tentativas de login e metadados de imagens não têm acesso público. As alterações são autenticadas nas Server Actions antes do uso da chave privilegiada.

A senha é armazenada como hash scrypt nas variáveis do servidor. Sessões aleatórias são armazenadas como hash no Postgres, com cookie HttpOnly/SameSite e Secure em produção, expiração de oito horas e revogação no logout. O limite de dez tentativas em quinze minutos é aplicado com uma função SQL de atualização atômica, acessível apenas ao servidor.

O bucket de imagens é privado. A rota `/media/[id]` serve uma capa pública apenas quando associada a um conteúdo publicado; imagens de rascunhos exigem sessão administrativa. As imagens não passam pelo cache de otimização do Next.js e são servidas com `no-store`, para respeitar a mudança de visibilidade. Substituição e exclusão fazem limpeza das capas anteriores. O limite de 3 MB considera o limite de payload das funções Vercel.

Configure backups do Postgres e do Storage conforme o plano do Supabase. Rotação da senha administrativa: gere outro hash, atualize a variável e revogue as sessões existentes na tabela `grupo_e_sessions`. Use HTTPS.

## Verificações

```sh
npm run test
npm run test:schema
npm run typecheck
npm run build
npm run verify
```

`test:schema` aplica a migração em um Postgres isolado (PGlite) e verifica RLS, acesso restrito, importação e limite de login. `verify` usa Chromium (`CHROMIUM_PATH`, padrão `/usr/bin/chromium`) e uma API Supabase HTTP isolada para testar login, upload, rascunho, publicação, exclusão e logout. Esses testes **não confirmam** conexão ou políticas no projeto Supabase real. A validação real depende de acesso à conta e às credenciais configuradas na hospedagem.

## Fontes do conteúdo

Dados extraídos do ZIP fornecido pelo cliente: páginas **Economize**, **Sobre** e **Cursos e Eventos** de grupoenordeste.com.br. História: origem em 2005 em Nossa Senhora da Glória, primeira Economize em 2010, E-Transportes em 2018 e Hiper Economize em 2025. Não reutilizamos a contagem antiga de lojas nem o número de colaboradores como indicadores atuais.

Unidades exibidas seguem a relação atual fornecida pelo cliente. Siqueira Campos, Augusto Franco, Estância e Festas foram excluídas. Paulo Afonso não foi incluída, pois não consta da relação atual confirmada no briefing. Endereços específicos e horários não foram inventados: o visitante consulta a equipe.

Cinco conteúdos de cursos foram importados como arquivo histórico. Suas datas são **de publicação**, não de realização. A cópia contém resumos; os textos identificam essa limitação. Não foram criados depoimentos, avaliações ou métricas sem comprovação.

Contatos importados, **pendentes de confirmação antes da publicação**:

- Economize: +55 (79) 99861-3913.
- Embala Center: +55 (79) 99682-6742.
- contato@grupoenordeste.com.br.

Os números podem ser alterados em `NEXT_PUBLIC_WHATSAPP_LOJAS` e `NEXT_PUBLIC_WHATSAPP_EMBALACENTER`, seguidos de uma nova compilação. Revise também o texto de contato no rodapé ao alterar números. As fotos institucionais enviadas são logos e um retrato: o hero usa a identidade real da marca. Para uma próxima edição, forneça fotos das lojas, distribuição, frota, fazenda e produção.
