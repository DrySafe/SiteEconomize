# GRUPO E — Briefing para gestores

**Arquivo:** [Briefing-GRUPO-E-Gestores.xlsx](./Briefing-GRUPO-E-Gestores.xlsx)

Modelo de coleta e aprovação de informações do site, preparado em 30/10/2026. Documento em linguagem simples, com identidade visual clara, detalhes em bordô e campos de resposta em areia clara.

## Preenchimento

1. Baixe o arquivo e abra no Microsoft Excel para desktop.
2. Comece pela aba **00 Comece aqui** e salve uma cópia.
3. Preencha os campos em areia clara. As perguntas e os textos existentes são referências protegidas.
4. Cada gestor preenche a aba da sua empresa; a pessoa que coordena o projeto consolida as demais abas.
5. Use as listas de seleção para confirmar, alterar ou retirar informações.
6. Para respostas longas, use **Alt + Enter** e aumente a altura da linha, se necessário.
7. Envie logotipos, fotos e documentos em uma pasta compartilhada. Informe os links na aba **15 Materiais**.
8. Complete a aba **16 Aprovação** e encaminhe a cópia preenchida.

## Conteúdo

- Objetivo do site, público, contatos e responsáveis.
- Paleta de cores com amostras, preferências visuais e exemplos de linguagem.
- Relação das sete empresas presentes no projeto, com campos para confirmar os nomes oficiais e acrescentar outras.
- Fichas individuais: área atendida, produtos e serviços, texto institucional, telefone, WhatsApp, e-mail, endereço e referências.
- Revisão das unidades, inclusive as quatro operações informadas como encerradas.
- Revisão das seções da página, atividades do grupo e segmentos de clientes.
- **46 blocos de textos atuais** para manter, alterar ou remover; as sete descrições de empresas constam nas respectivas fichas.
- Cursos e eventos, publicação administrativa, inscrição e exemplo de cadastro.
- Materiais, imagens, referências, pendências e aprovação.
- Duas fichas reservadas para empresas adicionais.

São 19 abas. Nem todas precisam ser preenchidas pela mesma pessoa.

## Proteção

As abas têm proteção contra edição do conteúdo fixo, remoção de linhas/colunas e alterações de imagens; os campos de resposta estão desbloqueados. A estrutura do arquivo está protegida para evitar excluir ou renomear abas por acidente. A altura das linhas pode ser ajustada para facilitar a leitura.

A proteção é **sem senha** e serve para evitar acidentes, não para proteger informações confidenciais. Caso a equipe precise adaptar o modelo: **Revisão > Desproteger Planilha**; para a estrutura, **Revisão > Proteger Pasta de Trabalho**.

Não há macros, fórmulas nem conexões externas. Os links do índice são internos. Não inclua senhas de administrador nem credenciais.

## Base consultada

Código do projeto no GitHub em 30/10/2026, commit [d75df54](https://github.com/DrySafe/SiteEconomize/tree/d75df54d12826e76f8195cb6b8f427cc8406786f).

- Página inicial: `src/app/page.tsx`
- Empresas, unidades e contatos: `src/lib/content.ts`
- Cabeçalho e rodapé: `src/components/site-header.tsx`, `src/components/site-footer.tsx`
- Cursos e eventos: `src/app/cursos-e-eventos/page.tsx`
- Cores: `src/app/globals.css` e paleta enviada pelo solicitante
- Símbolo oficial: `public/images/Logo-PNG.png`

Os dados de referência **precisam ser confirmados pelos gestores**. A consulta ao código não confirma os dados comerciais nem a versão atualmente publicada. Textos de eventos individuais, carregados do banco de dados, não foram inventariados. A ficha de eventos permite recolher os dados corretos para futuras publicações.

## Verificações do arquivo

Conferidos: integridade do pacote ZIP/OOXML, estrutura dos XMLs, 19 planilhas protegidas, 185 listas de seleção apontando para campos desbloqueados, células mescladas sem sobreposição e logotipo incorporado. Abertura e renderização no Excel não puderam ser verificadas nesta sessão, pois o ambiente de execução estava indisponível.
