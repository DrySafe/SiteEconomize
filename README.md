# GRUPO E

Site institucional e blog de cursos e eventos, com painel administrativo. Next.js 16, React, TypeScript e Tailwind CSS v4. Fonte Inter hospedada junto ao projeto.

## Executar

Requer Node.js 24 LTS (SQLite nativo).

```sh
npm ci
cp .env.example .env.local
npm run admin:setup
# Copie ADMIN_EMAIL e ADMIN_PASSWORD_HASH gerados para .env.local.
npm run dev
```

Abra `/` para o institucional, `/cursos-e-eventos` para o blog e `/admin` para administrar. O login fica indisponível até as credenciais serem configuradas. Não há senha padrão. O comando de configuração lê a senha com entrada oculta; use pelo menos 12 caracteres.

## Cadastrar um encontro

1. Acesse `/admin` e faça login.
2. Clique em **Novo conteúdo**.
3. Informe título, resumo e texto; envie uma capa JPG, PNG ou WebP de até 5 MB.
4. Escolha categoria e visibilidade. Um rascunho fica acessível somente no painel.
5. Para cursos/eventos novos, informe data e horário de Brasília, local, instrutor e link HTTPS de inscrição (opcional). Sem link, o atendimento segue para o WhatsApp.
6. Salve. A publicação aparece no blog e tem sua própria página. O painel permite editar e excluir com confirmação.

Marque **Conteúdo de arquivo** para encontros antigos sem data de realização confirmada. O site sinaliza arquivo e não oferece inscrições para eventos passados. Dicas e novidades não exigem data de encontro. O texto é renderizado como texto simples, sem HTML.

## Segurança e persistência

Credenciais configuradas no servidor; senha armazenada como hash scrypt. Sessões aleatórias armazenadas como hash no banco, cookie HttpOnly/SameSite e Secure em produção, duração de oito horas e revogação no logout. Ações de alteração validam a autenticação no servidor. Next.js verifica a origem nas Server Actions. Login limitado a dez tentativas por janela de quinze minutos, persistido no SQLite. O limite é compartilhado para a conta única de administrador.

O banco SQLite e as imagens enviadas ficam em `DATA_DIR/grupo-e.sqlite`. **A hospedagem precisa de Node.js e disco persistente**, por exemplo um VPS ou contêiner com volume. Esta implementação não pode ser publicada em hospedagem puramente estática ou em funções com disco efêmero. Use uma instância; múltiplas réplicas precisam de banco compartilhado e armazenamento de objetos.

Faça backups consistentes do SQLite, incluindo as capas. Exemplo com SQLite CLI: `sqlite3 data/grupo-e.sqlite ".backup '/caminho/backup.sqlite'"`. Não copie apenas o arquivo principal com o aplicativo escrevendo e ignore o WAL. Execute o servidor com acesso restrito ao diretório de dados e use HTTPS. Não envie `.env.local` nem o banco ao GitHub. Rotação de senha: gere outro hash, atualize o ambiente, reinicie o servidor e revogue as sessões existentes no banco.

## Produção e verificações

```sh
npm run test
npm run typecheck
npm run build
npm start
```

## Fontes do conteúdo

Dados extraídos do ZIP fornecido pelo cliente: páginas **Economize**, **Sobre** e **Cursos e Eventos** de grupoenordeste.com.br. História: origem em 2005 em Nossa Senhora da Glória, primeira Economize em 2010, E-Transportes em 2018 e Hiper Economize em 2025. Não reutilizamos a contagem antiga de lojas nem o número de colaboradores como indicadores atuais.

Unidades exibidas seguem a relação atual fornecida pelo cliente. Siqueira Campos, Augusto Franco, Estância e Festas foram excluídas. Paulo Afonso não foi incluída, pois não consta da relação atual confirmada no briefing. Endereços específicos e horários não foram inventados: o visitante consulta a equipe.

Cinco conteúdos de cursos foram importados como arquivo histórico. Suas datas são **de publicação**, não de realização. A cópia contém resumos; os textos identificam essa limitação. Não foram criados depoimentos, avaliações ou métricas sem comprovação.

Contatos importados, **pendentes de confirmação antes da publicação**:

- Economize: +55 (79) 99861-3913.
- Embala Center: +55 (79) 99682-6742.
- contato@grupoenordeste.com.br.

Os números podem ser alterados em `NEXT_PUBLIC_WHATSAPP_LOJAS` e `NEXT_PUBLIC_WHATSAPP_EMBALACENTER`, seguidos de uma nova compilação. Revise também o texto de contato no rodapé ao alterar números. As fotos institucionais enviadas são logos e um retrato: o hero usa a identidade real da marca. Para uma próxima edição, forneça fotos das lojas, distribuição, frota, fazenda e produção.
