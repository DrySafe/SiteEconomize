import Link from "next/link";
import {
  Plus,
  FileText,
  CheckCircle2,
  PenLine,
  ExternalLink,
} from "lucide-react";
import { getEvents } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/event-validation";
import { DeleteButton } from "@/components/admin/delete-button";
export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  await requireAdmin();
  const entries = getEvents(true);
  const saved = (await searchParams).saved;
  return (
    <>
      <div className="admin-page-heading">
        <div>
          <span className="eyebrow">SEU ESPAÇO DE CRIAÇÃO</span>
          <h1>Cursos & eventos</h1>
          <p>Ideias, encontros e conhecimento. Tudo em um só lugar.</p>
        </div>
        <Link href="/admin/novo" className="button button-dark">
          <Plus size={19} />
          Novo conteúdo
        </Link>
      </div>
      {saved && (
        <div className="success-notice" role="status">
          <CheckCircle2 size={18} />
          Conteúdo salvo com sucesso.
        </div>
      )}
      <div className="admin-stats">
        {[
          [FileText, "Conteúdos", entries.length],
          [
            CheckCircle2,
            "Publicados",
            entries.filter((e) => e.status === "published").length,
          ],
          [
            PenLine,
            "Rascunhos",
            entries.filter((e) => e.status === "draft").length,
          ],
        ].map(([Icon, label, total]) => {
          const I = Icon as typeof FileText;
          return (
            <div key={String(label)}>
              <I size={22} />
              <span>{String(label)}</span>
              <b>{String(total)}</b>
            </div>
          );
        })}
      </div>
      <section className="admin-list">
        <div className="admin-list-heading">
          <h2>Seus conteúdos</h2>
          <span>{entries.length} no total</span>
        </div>
        {entries.length ? (
          entries.map((e) => (
            <article key={e.id} className="admin-list-row">
              <div>
                <span className={`publication-status ${e.status}`}>
                  {e.status === "published" ? "Publicado" : "Rascunho"}
                </span>
                <span className="admin-category">
                  {e.category}
                  {e.archived ? " · Arquivo" : ""}
                </span>
                <h3>
                  <Link href={`/admin/editar/${e.id}`}>{e.title}</Link>
                </h3>
                <p>
                  {formatDate(e.publishedAt)}{" "}
                  {e.location ? `· ${e.location}` : ""}
                </p>
              </div>
              <div className="row-actions">
                {e.status === "published" && (
                  <Link
                    className="icon-button"
                    href={`/cursos-e-eventos/${e.slug}`}
                    target="_blank"
                    aria-label={`Ver ${e.title} no site`}
                  >
                    <ExternalLink size={17} />
                  </Link>
                )}
                <Link
                  className="icon-button"
                  href={`/admin/editar/${e.id}`}
                  aria-label={`Editar ${e.title}`}
                >
                  <PenLine size={17} />
                </Link>
                <DeleteButton id={e.id} title={e.title} />
              </div>
            </article>
          ))
        ) : (
          <div className="empty-state">
            <h3>Seu primeiro conteúdo começa aqui.</h3>
            <Link href="/admin/novo" className="button button-dark">
              Criar conteúdo
            </Link>
          </div>
        )}
      </section>
    </>
  );
}
