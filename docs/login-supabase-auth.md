# Integração do login com Supabase Auth

Esta alteração é preparada em uma branch de teste, sem publicar no domínio principal.

O login valida e-mail e senha com Supabase Auth. Além da identidade confirmada, exige uma autorização ativa com role admin na tabela grupo_e_admin_users. Usuários criados em Auth não ganham privilégios automaticamente. Manager/editor estão reservados para a implementação do fluxo de aprovação.

As sessões da aplicação continuam com cookie HttpOnly/Secure e token aleatório armazenado como hash. Agora estão vinculadas ao usuário do Auth; a autorização é conferida em cada acesso. Mudanças no updated_at da conta invalidam a sessão; desativar a autorização também bloqueia o acesso, e excluir o usuário remove suas sessões por chave estrangeira. As credenciais ADMIN_EMAIL e ADMIN_PASSWORD_HASH deixam de autenticar nesta branch.

Configuração necessária: SUPABASE_URL, SUPABASE_SECRET_KEY e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. A Secret key é usada somente pelo servidor. O cliente de autenticação é criado separadamente em cada tentativa para preservar a identidade do cliente privilegiado usado nos acessos ao banco.

A migração grupo_e_auth_administrator já foi aplicada no novo Supabase. A tabela de autorização e as colunas adicionais de sessões não alteram a versão antiga do site. O administrador inicial foi selecionado por e-mail confirmado, sem senha embutida ou modificada.

Antes de publicar: conferir o formulário habilitado na prévia, login com senha correta, rejeição de senha incorreta e de usuário sem autorização, proteção dos rascunhos, upload, edição, logout e manutenção das páginas públicas. A senha real é informada somente pelo usuário na tela de login.
