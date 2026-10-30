# Configurar o novo Supabase do GRUPO E

Projeto informado: **rjcovpfddmwwetqlrnas**  
URL: `https://rjcovpfddmwwetqlrnas.supabase.co`

Esta preparação configura a aplicação existente. O painel atual ainda usa um administrador definido por variáveis de ambiente. Contas individuais com Supabase Auth, permissões por função e aprovação de conteúdos fazem parte da evolução aprovada e ainda precisam ser implementadas.

## 1. Criar o arquivo para inserir as chaves

Na pasta do projeto, com Node.js 24 e dependências instaladas:

```sh
npm ci
npm run env:setup
```

O comando cria **.env.local** a partir de **.env.example**. Se o arquivo já existir, ele não será sobrescrito. Nesse caso, compare com o modelo e atualize manualmente a URL e os campos necessários.

Abra **.env.local** no editor e preencha:

| Campo | O que colocar |
| --- | --- |
| SUPABASE_URL | A URL do novo projeto, já preenchida no modelo. |
| SUPABASE_SECRET_KEY | A **Secret key** do novo projeto, disponível em Project Settings → API Keys. |
| ADMIN_EMAIL | E-mail para entrar no painel administrativo atual. |
| ADMIN_PASSWORD_HASH | Hash gerado pelo comando descrito abaixo. |

Não copie chaves do projeto antigo para o novo. A chave secreta começa com `sb_secret_`. A senha do banco e a chave pública não a substituem. Se usar a chave legada `service_role`, cadastre **SUPABASE_SERVICE_ROLE_KEY** em vez de **SUPABASE_SECRET_KEY**.

**.env.local já é ignorado pelo Git. O arquivo .env.example deve continuar sem credenciais reais.**

## 2. Preparar o administrador atual

Execute em um terminal interativo:

```sh
npm run admin:setup
```

Informe o e-mail desejado e crie uma senha com pelo menos 12 caracteres. A entrada da senha fica oculta. Copie **ADMIN_EMAIL** e **ADMIN_PASSWORD_HASH** exibidos pelo comando para o **.env.local**.

A senha de acesso ao site é diferente da senha da sua conta Supabase. O comando gera as credenciais, mas não as grava automaticamente nem cria uma conta no Supabase Auth. Guarde a senha no seu gerenciador de senhas.

## 3. Chave pública reservada para Supabase Auth

O modelo também inclui:

- **NEXT_PUBLIC_SUPABASE_URL**: URL pública do mesmo projeto.
- **NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY**: **Publishable key**, com prefixo `sb_publishable_`.

Esses campos estão reservados para a implementação das contas individuais e podem ficar sem chave por enquanto. Preenchê-los não ativa o novo login.

**Nunca coloque Secret key ou service_role em uma variável NEXT_PUBLIC_.** Para o fluxo atual, não é necessário cadastrar DATABASE_URL, senha de Postgres, JWT secret ou token pessoal de acesso do Supabase.

## 4. Preparar o banco e as imagens

No **novo projeto**, abra o SQL Editor e execute o arquivo:

`supabase/migrations/20261001210502_grupo_e_supabase.sql`

O arquivo prepara as tabelas do painel atual, regras de acesso e o bucket privado de imagens. Ele também importa cinco cursos históricos como arquivo; não copie usuários ou sessões antigos.

Depois, confira no SQL Editor:

```sql
select count(*) from public.grupo_e_events;
select id, public, file_size_limit
from storage.buckets
where id = 'grupo-e-eventos';
```

Em um projeto novo são esperados cinco conteúdos iniciais e um bucket privado com limite de 3 MB. Executar a migração não transfere automaticamente dados ou imagens que existam no projeto antigo.

Se a conexão Supabase usada pelo assistente não mostrar o novo projeto, conceda acesso a esse projeto na conexão **Site Grupo E** antes de solicitar aplicação ou validação automática.

## 5. Configurar a Vercel

Abra o projeto **grupoe** e vá a **Settings → Environment Variables**.

Para **Production**, cadastre as quatro variáveis obrigatórias da tabela acima com valores do novo projeto. Guarde **SUPABASE_SECRET_KEY** e **ADMIN_PASSWORD_HASH** como Secret/Sensitive, quando a interface oferecer essa opção. A URL não é secreta.

Os campos públicos reservados podem ser cadastrados quando a autenticação individual for implementada. Os números de WhatsApp são opcionais e já têm referência no modelo; confirme antes de publicar.

Não coloque valores fictícios nas variáveis de produção. Atualize URL e chave em conjunto, depois da preparação do banco. Alterações de variáveis exigem **Redeploy** para valer.

Para testes locais e de Preview, prefira um projeto Supabase separado. Não vincule automaticamente previews de código não aprovado ao banco de produção.

A Vercel não recebe as variáveis apenas porque o arquivo .env.example foi enviado ao GitHub. Elas precisam ser cadastradas na hospedagem. Não adicione chaves reais ao código, a commits ou a mensagens de chat.

## 6. Conferir a configuração

```sh
npm run env:check
npm run dev
```

**env:check** valida a presença e o formato dos campos usados pelo painel atual, sem exibir os valores. Ele lê **.env.local** e variáveis do processo; valores do processo têm prioridade. Ele não carrega as demais variantes de arquivos .env do Next.js.

Esse comando **não confirma** que a chave é válida, que pertence ao projeto ou que as tabelas estão prontas. A confirmação funcional exige:

1. Abrir o site e conferir os conteúdos.
2. Entrar em **/admin**.
3. Salvar um rascunho com imagem.
4. Publicar e abrir o conteúdo no site.
5. Sair e verificar que o painel exige login novamente.

## Limites desta configuração

- O endereço do novo projeto foi fornecido pelo responsável.
- A configuração não cria usuários, perfis, regras novas de aprovação ou credenciais automaticamente.
- Não há senha padrão nem chave embutida.
- A Vercel e o Supabase só estão conectados operacionalmente após o teste com credenciais válidas.
