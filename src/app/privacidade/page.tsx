import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
export const metadata = { title: "Privacidade" };
export default function Privacy() {
  return (
    <>
      <SiteHeader />
      <main id="conteudo" className="container section privacy-page">
        <span className="eyebrow">TRANSPARÊNCIA</span>
        <h1>Sua privacidade importa.</h1>
        <p>
          Este site apresenta informações institucionais e conteúdos do GRUPO E.
          A consulta às páginas públicas não exige cadastro e não utiliza
          cookies de publicidade ou analytics nesta versão.
        </p>
        <h2>Contato e inscrições</h2>
        <p>
          Ao clicar nos botões de WhatsApp ou em um link externo de inscrição,
          você acessa serviços de terceiros, que possuem suas próprias políticas
          de privacidade. Compartilhe somente as informações necessárias ao
          atendimento.
        </p>
        <h2>Área administrativa</h2>
        <p>
          O acesso administrativo utiliza um cookie essencial, protegido e
          temporário, para manter a sessão de quem gerencia os conteúdos. A
          sessão expira em até oito horas ou ao sair do painel.
        </p>
        <h2>Fale com o grupo</h2>
        <p>
          Para dúvidas sobre o tratamento de informações fornecidas no
          atendimento, entre em contato pelo e-mail{" "}
          <a href="mailto:contato@grupoenordeste.com.br">
            contato@grupoenordeste.com.br
          </a>
          .
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
