import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRight,
  ArrowDown,
  Package,
  Store,
  ShoppingCart,
  ChefHat,
  Boxes,
  Leaf,
  Truck,
  Check,
  MoveUpRight,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Reveal } from "@/components/reveal";
import { EventCard } from "@/components/event-card";
import { SegmentMarquee } from "@/components/segment-marquee";
import { HeroTags } from "@/components/hero-tags";
import { companies, units, contacts, whatsapp } from "@/lib/content";
import { getEvents } from "@/lib/db";
export const dynamic = "force-dynamic";
const icons: Record<string, typeof Package> = {
  package: Package,
  store: Store,
  cart: ShoppingCart,
  chef: ChefHat,
  boxes: Boxes,
  leaf: Leaf,
  truck: Truck,
};
export default async function Home() {
  const events = (await getEvents()).slice(0, 3);
  return (
    <>
      <SiteHeader />
      <main id="conteudo">
        <section className="hero container">
          <div className="hero-content">
            <span className="eyebrow">
              <span className="status-dot" /> DE SERGIPE, PARA NOVAS
              POSSIBILIDADES
            </span>
            <h1>
              Conectamos
              <br />o que seu negócio
              <br />
              precisa para <em>crescer.</em>
            </h1>
            <p>
              Alimentos, embalagens, varejo e logística.
              <br />
              Um grupo, muitas soluções. A mesma dedicação
              <br className="desktop-break" /> a quem produz, empreende e
              transforma.
            </p>
            <div className="hero-actions">
              <a
                href={whatsapp()}
                className="button button-dark"
                target="_blank"
                rel="noopener noreferrer"
              >
                Converse com um especialista <ArrowUpRight size={19} />
              </a>
              <Link href="#empresas" className="text-link">
                Conheça o grupo <ArrowDown size={17} />
              </Link>
            </div>
            <div className="hero-origin">
              <span className="origin-line" />
              <span>
                Desde 2005 construindo conexões
                <br />
                <strong>que transformam negócios e vidas.</strong>
              </span>
            </div>
          </div>
          <div className="hero-visual">
            <div className="visual-grid" />
            <span className="visual-top-label">
              <strong>GRUPO E</strong>
              <br />
              MUITAS POSSIBILIDADES.
            </span>
            <div className="hero-symbol">
              <Image
                src="/images/Logo-PNG.png"
                alt="Símbolo do GRUPO E"
                width={380}
                height={382}
                priority
              />
            </div>
            <HeroTags />
            <div className="visual-bottom">
              <span>Qualidade em cada conexão.</span>
              <MoveUpRight size={36} />
            </div>
          </div>
        </section>
        <SegmentMarquee />
        <section id="sobre" className="container section about" data-reveal>
          <div>
            <span className="eyebrow">01 / NOSSA ESSÊNCIA</span>
            <h2>
              Mais que empresas.
              <br />
              <span className="muted">Um grupo de possibilidades.</span>
            </h2>
          </div>
          <div className="about-copy">
            <p className="large-copy">
              Acreditamos no poder de quem transforma. Um ingrediente em uma
              receita. Uma ideia em um negócio. Uma conexão em crescimento.
            </p>
            <p>
              Nossa história começou em 2005, em uma loja de embalagens de
              apenas 36 m² em Nossa Senhora da Glória. Hoje, integramos
              diferentes operações para apoiar toda a cadeia de abastecimento —
              com qualidade, proximidade e eficiência.
            </p>
            <div className="about-stats">
              <div>
                <b>2005</b>
                <span>O início da nossa história</span>
              </div>
              <div>
                <b>7</b>
                <span>Frentes de atuação conectadas</span>
              </div>
            </div>
          </div>
        </section>
        <section id="empresas" className="companies-section section">
          <div className="container">
            <div className="section-heading" data-reveal>
              <div>
                <span className="eyebrow">02 / NOSSO ECOSSISTEMA</span>
                <h2>
                  Diferentes especialidades.
                  <br />A mesma excelência.
                </h2>
              </div>
              <p>
                Do campo ao balcão, da embalagem à entrega.
                <br />
                Conheça as conexões que formam o GRUPO E.
              </p>
            </div>
            <div className="companies-grid">
              {companies.map((c, i) => {
                const Icon = icons[c.icon];
                return (
                  <article
                    className={`company-card ${i === 0 ? "featured-company" : ""}`}
                    key={c.name}
                    data-reveal
                  >
                    <div className="company-top">
                      <Icon size={29} strokeWidth={1.5} />
                      <span>0{i + 1}</span>
                    </div>
                    <span className="eyebrow">{c.type}</span>
                    <h3>{c.name}</h3>
                    <p>{c.description}</p>
                    <a
                      href={whatsapp(
                        `Olá! Gostaria de saber mais sobre ${c.name}.`,
                        ["store", "cart", "chef"].includes(c.icon)
                          ? contacts.lojas
                          : contacts.embala,
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="company-link"
                    >
                      Fale com a equipe <ArrowUpRight size={19} />
                    </a>
                  </article>
                );
              })}
              <div className="company-manifesto" data-reveal>
                <span>
                  Uma conexão.
                  <br />
                  <em>Infinitas possibilidades.</em>
                </span>
                <Image
                  src="/images/Logo-PNG.png"
                  alt=""
                  width={85}
                  height={85}
                />
              </div>
            </div>
          </div>
        </section>
        <section className="container section benefits" data-reveal>
          <span className="eyebrow">03 / AO LADO DO SEU NEGÓCIO</span>
          <div className="section-heading">
            <h2>
              A parceria certa
              <br />
              faz toda a diferença.
            </h2>
            <p>
              Entendemos sua rotina.
              <br />E trabalhamos para fazer parte da sua evolução.
            </p>
          </div>
          <div className="benefit-grid">
            {[
              {
                n: "01",
                title: "Soluções que se completam",
                text: "Insumos, embalagens e abastecimento em um ecossistema que acompanha sua operação.",
              },
              {
                n: "02",
                title: "Proximidade de verdade",
                text: "Equipe que escuta, entende seu segmento e orienta o atendimento para sua necessidade.",
              },
              {
                n: "03",
                title: "Logística integrada",
                text: "Distribuição e transporte próprios para conectar a cadeia de abastecimento com eficiência.",
              },
              {
                n: "04",
                title: "Conhecimento que transforma",
                text: "Cursos e encontros para desenvolver técnicas, compartilhar experiências e abrir possibilidades.",
              },
            ].map((b) => (
              <div key={b.n}>
                <span className="benefit-number">
                  {b.n}
                  <Check size={18} />
                </span>
                <h3>{b.title}</h3>
                <p>{b.text}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="history-band">
          <div className="container" data-reveal>
            <div>
              <span className="eyebrow">
                CRESCER FAZ PARTE DA NOSSA HISTÓRIA
              </span>
              <h2>
                De uma pequena loja
                <br />a um grupo que conecta.
              </h2>
              <p>
                Uma trajetória construída com trabalho,
                <br />
                visão e compromisso com as pessoas.
              </p>
            </div>
            <div className="timeline">
              {[
                ["2005", "Nasce a Embala Center", "Nossa Senhora da Glória"],
                ["2010", "A primeira Economize", "Expansão para Aracaju"],
                ["2018", "E-Transportes", "Uma logística própria"],
                ["2025", "Hiper Economize", "Uma nova experiência"],
              ].map(([year, title, subtitle]) => (
                <div key={year}>
                  <b>{year}</b>
                  <span>
                    <strong>{title}</strong>
                    <small>{subtitle}</small>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section id="unidades" className="container section" data-reveal>
          <div className="section-heading">
            <div>
              <span className="eyebrow">04 / PERTO DE VOCÊ</span>
              <h2>Encontre sua próxima conexão.</h2>
            </div>
            <p>
              Escolha sua unidade e converse com nossa equipe
              <br />
              sobre localização, horários e atendimento.
            </p>
          </div>
          <div className="units-grid">
            {units.map((u) => (
              <article key={u.name} className="unit-card">
                <Store size={25} strokeWidth={1.5} />
                <span className="eyebrow">{u.city}</span>
                <h3>{u.name}</h3>
                <p>{u.detail}</p>
                <a
                  href={whatsapp(
                    `Olá! Quero informações sobre a unidade ${u.name}, em ${u.city}.`,
                    contacts.lojas,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Consultar unidade <ArrowUpRight size={18} />
                </a>
              </article>
            ))}
          </div>
        </section>
        <section className="courses-preview section">
          <div className="container">
            <div className="section-heading" data-reveal>
              <div>
                <span className="eyebrow">05 / CONHECIMENTO EM MOVIMENTO</span>
                <h2>
                  Novas ideias.
                  <br />
                  Novos sabores. Novos caminhos.
                </h2>
              </div>
              <Link href="/cursos-e-eventos" className="button button-outline">
                Explore cursos & eventos <ArrowUpRight size={18} />
              </Link>
            </div>
            <div className="events-grid">
              {events.map((entry) => (
                <EventCard key={entry.id} entry={entry} />
              ))}
            </div>
          </div>
        </section>
        <section className="container section faq" data-reveal>
          <div>
            <span className="eyebrow">VAMOS FACILITAR</span>
            <h2>
              Respostas para
              <br />o próximo passo.
            </h2>
            <p>
              Não encontrou o que precisa?
              <br />
              <a href={whatsapp()} target="_blank" rel="noopener noreferrer">
                Converse com a gente <ArrowUpRight size={14} />
              </a>
            </p>
          </div>
          <div>
            {[
              [
                "Quem pode comprar com o GRUPO E?",
                "Atendemos negócios de panificação, confeitaria, açaí, sorvetes, pizzarias, restaurantes, lanchonetes, hamburguerias e outros segmentos de FOOD SERVICE. Nossas operações de varejo também atendem consumidores.",
              ],
              [
                "Como solicitar um orçamento?",
                "Clique em “Converse com um especialista” para falar pelo WhatsApp da Embala Center. Informe seu segmento, cidade e os produtos que procura para direcionarmos o atendimento.",
              ],
              [
                "Vocês fazem entregas?",
                "O grupo possui operações de distribuição e transporte. Consulte a equipe sobre área atendida, prazo, condições e disponibilidade para sua cidade.",
              ],
              [
                "Como participar dos cursos e eventos?",
                "Na página Cursos & eventos, abra o conteúdo desejado. Quando houver uma nova turma publicada, você encontrará a data, o local e o caminho de inscrição. Os conteúdos antigos ficam identificados como arquivo.",
              ],
            ].map(([q, a]) => (
              <details key={q}>
                <summary>
                  {q}
                  <span>+</span>
                </summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="final-cta">
          <div className="container" data-reveal>
            <span className="eyebrow">A PRÓXIMA CONEXÃO COMEÇA AQUI</span>
            <h2>
              Vamos crescer <em>juntos?</em>
            </h2>
            <div>
              <p>
                Conte o que seu negócio precisa.
                <br />
                Nossa equipe ajuda você a encontrar o caminho.
              </p>
              <a
                href={whatsapp()}
                target="_blank"
                rel="noopener noreferrer"
                className="button button-yellow"
              >
                Converse pelo WhatsApp <ArrowUpRight size={20} />
              </a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
      <Reveal />
    </>
  );
}
