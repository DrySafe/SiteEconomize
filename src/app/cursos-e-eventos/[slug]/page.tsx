import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ArrowLeft,
  ArrowUpRight,
  MapPin,
  CalendarDays,
  UserRound,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { EventCard } from "@/components/event-card";
import { getEvent, getEvents } from "@/lib/db";
import { formatDate, isPast } from "@/lib/event-validation";
import { contacts, whatsapp } from "@/lib/content";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const entry = await getEvent((await params).slug);
  return {
    title: entry?.title || "Conteúdo não encontrado",
    description: entry?.excerpt,
  };
}
export default async function Detail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const entry = await getEvent((await params).slug);
  if (!entry) notFound();
  const past = isPast(entry);
  const related = (await getEvents())
    .filter((e) => e.id !== entry.id && e.category === entry.category)
    .slice(0, 3);
  return (
    <>
      <SiteHeader />
      <main id="conteudo" className="container article-page">
        <Link href="/cursos-e-eventos" className="text-link back-link">
          <ArrowLeft size={16} />
          Todos os conteúdos
        </Link>
        <div className="article-header">
          <span className="eyebrow">
            {entry.category} {past ? " / ARQUIVO" : ""}
          </span>
          <h1>{entry.title}</h1>
          <p>{entry.excerpt}</p>
          <span className="event-meta">
            Publicado em {formatDate(entry.publishedAt)}
          </span>
        </div>
        <div className="article-layout">
          <article>
            <div className="article-cover">
              <Image
                src={entry.image || "/images/Logo-PNG.png"}
                unoptimized={entry.image.startsWith("/media/")}
                alt={`Material de divulgação: ${entry.title}`}
                fill
                sizes="(max-width: 900px) 100vw, 65vw"
                priority
              />
            </div>
            <div className="article-body">
              {entry.body.split(/\n\s*\n/).map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </article>
          <aside className="event-info">
            <h2>{past ? "Sobre este conteúdo" : "Planeje sua participação"}</h2>
            {past && (
              <p className="archive-notice">
                Este conteúdo faz parte do nosso arquivo. Não representa uma
                turma com inscrições abertas.
              </p>
            )}
            {entry.eventDate && (
              <div>
                <CalendarDays size={20} />
                <span>
                  <small>DATA E HORÁRIO</small>
                  {formatDate(entry.eventDate, true)}
                  <small>Horário de Brasília</small>
                </span>
              </div>
            )}
            {entry.location && (
              <div>
                <MapPin size={20} />
                <span>
                  <small>LOCAL</small>
                  {entry.location}
                </span>
              </div>
            )}
            {entry.instructor && (
              <div>
                <UserRound size={20} />
                <span>
                  <small>COM QUEM</small>
                  {entry.instructor}
                </span>
              </div>
            )}
            <a
              className="button button-dark"
              href={
                !past && entry.registrationUrl
                  ? entry.registrationUrl
                  : whatsapp(
                      past
                        ? "Olá! Gostaria de saber das próximas turmas do GRUPO E."
                        : `Olá! Quero saber mais sobre ${entry.title}.`,
                      contacts.lojas,
                    )
              }
              target="_blank"
              rel="noopener noreferrer"
            >
              {past
                ? "Conheça as próximas turmas"
                : entry.registrationUrl
                  ? "Quero me inscrever"
                  : "Fale com a equipe"}
              <ArrowUpRight size={17} />
            </a>
          </aside>
        </div>
        {related.length > 0 && (
          <section className="section">
            <div className="section-heading">
              <h2>Continue explorando.</h2>
            </div>
            <div className="events-grid">
              {related.map((e) => (
                <EventCard entry={e} key={e.id} />
              ))}
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
