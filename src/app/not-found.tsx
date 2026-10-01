import Link from "next/link";
export default function NotFound() {
  return (
    <main id="conteudo" className="empty-state section">
      <span className="eyebrow">404</span>
      <h1>Essa conexão não foi encontrada.</h1>
      <p>O conteúdo pode ter sido removido ou ainda não estar publicado.</p>
      <Link href="/" className="button button-dark">
        Voltar ao início
      </Link>
    </main>
  );
}
