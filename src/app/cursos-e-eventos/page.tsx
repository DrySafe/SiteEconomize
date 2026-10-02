import type { Metadata } from "next";
import { ArrowDown, BookOpen } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { EventBrowser } from "@/components/event-browser";
import { getEvents } from "@/lib/db";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Cursos & eventos",
  description:
    "Aprendizado, encontros e inspiração para quem produz. Explore os cursos e eventos do GRUPO E.",
};
export default async function Blog() {
  return (
    <>
      <SiteHeader />
      <main id="conteudo">
        <section className="blog-hero">
          <div className="container">
            <div>
              <span className="eyebrow">CONHECIMENTO EM MOVIMENTO</span>
              <h1>
                Aprender.
                <br />
                Criar. <em>Transformar.</em>
              </h1>
              <p>
                Cursos, encontros e inspiração para quem
                <br />
                quer ir além no FOOD SERVICE.
              </p>
              <a href="#explorar" className="text-link">
                Explore os conteúdos <ArrowDown size={18} />
              </a>
            </div>
            <div className="blog-hero-art" aria-hidden="true">
              <span className="art-circle">
                <BookOpen size={80} strokeWidth={1} />
              </span>
              <span className="art-caption">
                NOVAS IDEIAS.
                <br />
                NOVAS POSSIBILIDADES.
              </span>
              <span className="art-plus">+</span>
            </div>
          </div>
        </section>
        <section id="explorar" className="container section blog-section">
          <EventBrowser entries={await getEvents()} />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
