"use client";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, ArrowUpRight } from "lucide-react";
import { EventCard } from "./event-card";
import { categories, isPast, type EventEntry } from "@/lib/event-validation";
import { contacts, whatsapp } from "@/lib/content";
export function EventBrowser({ entries }: { entries: EventEntry[] }) {
  const [query, setQuery] = useState(""),
    [category, setCategory] = useState("Todos"),
    [period, setPeriod] = useState("Todos"),
    [limit, setLimit] = useState(6);
  const results = useMemo(
    () =>
      entries.filter(
        (e) =>
          (category === "Todos" || e.category === category) &&
          (period === "Todos" ||
            (period === "Próximos" ? !isPast(e) : isPast(e))) &&
          `${e.title} ${e.excerpt} ${e.location} ${e.instructor}`
            .toLocaleLowerCase("pt-BR")
            .includes(query.toLocaleLowerCase("pt-BR")),
      ),
    [entries, query, category, period],
  );
  return (
    <>
      <div className="blog-tools">
        <div className="category-tabs" aria-label="Categorias">
          {["Todos", ...categories].map((c) => (
            <button
              key={c}
              aria-pressed={category === c}
              className={category === c ? "active" : ""}
              onClick={() => {
                setCategory(c);
                setLimit(6);
              }}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="blog-search">
          <label className="search-input">
            <Search size={18} />
            <input
              aria-label="Buscar cursos e eventos"
              placeholder="O que você quer aprender?"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setLimit(6);
              }}
            />
          </label>
          <label className="period-select">
            <SlidersHorizontal size={16} />
            <select
              aria-label="Filtrar por período"
              value={period}
              onChange={(e) => {
                setPeriod(e.target.value);
                setLimit(6);
              }}
            >
              <option>Todos</option>
              <option>Próximos</option>
              <option>Arquivo</option>
            </select>
          </label>
        </div>
      </div>
      <div className="results-info" aria-live="polite">
        <span>
          {results.length}{" "}
          {results.length === 1
            ? "conteúdo encontrado"
            : "conteúdos encontrados"}
        </span>
        <span>Conhecimento que faz seu negócio crescer.</span>
      </div>
      {results.length ? (
        <div className="events-grid">
          {results.slice(0, limit).map((e) => (
            <EventCard entry={e} key={e.id} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Search size={36} />
          <h2>
            {period === "Próximos"
              ? "Novos encontros vêm por aí."
              : "Nenhum conteúdo encontrado."}
          </h2>
          <p>
            {period === "Próximos"
              ? "Fale com nossa equipe para saber das próximas turmas."
              : "Experimente outro termo ou remova os filtros."}
          </p>
          <button
            className="button button-outline"
            onClick={() => {
              setQuery("");
              setCategory("Todos");
              setPeriod("Todos");
            }}
          >
            Limpar filtros
          </button>
        </div>
      )}
      {limit < results.length && (
        <div className="load-more">
          <button
            className="button button-outline"
            onClick={() => setLimit(limit + 6)}
          >
            Ver mais conteúdos
          </button>
        </div>
      )}
      <aside className="learning-callout">
        <div>
          <span className="eyebrow">SEU PRÓXIMO PASSO</span>
          <h2>
            Aprender hoje.
            <br />
            Transformar amanhã.
          </h2>
          <p>Quer saber das próximas turmas? Converse com a nossa equipe.</p>
        </div>
        <a
          href={whatsapp(
            "Olá! Quero saber dos próximos cursos e eventos do GRUPO E.",
            contacts.lojas,
          )}
          className="button button-yellow"
          target="_blank"
          rel="noopener noreferrer"
        >
          Quero saber das novidades <ArrowUpRight size={18} />
        </a>
      </aside>
    </>
  );
}
