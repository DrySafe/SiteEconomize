import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, MapPin } from "lucide-react";
import { formatDate, isPast, type EventEntry } from "@/lib/event-validation";
export function EventCard({ entry }: { entry: EventEntry }) {
  const past = isPast(entry);
  return (
    <article className="event-card">
      <Link
        href={`/cursos-e-eventos/${entry.slug}`}
        className="event-image"
        tabIndex={-1}
        aria-hidden="true"
      >
        <Image
          src={entry.image || "/images/Logo-PNG.png"}
          unoptimized={entry.image.startsWith("/media/")}
          alt=""
          fill
          sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw"
        />
        <span className="image-category">{entry.category}</span>
        {past && <span className="archive-badge">Arquivo</span>}
      </Link>
      <div className="event-card-body">
        <p className="event-meta">
          {entry.eventDate
            ? formatDate(entry.eventDate)
            : `Publicado em ${formatDate(entry.publishedAt)}`}
        </p>
        <h3>
          <Link href={`/cursos-e-eventos/${entry.slug}`}>{entry.title}</Link>
        </h3>
        <p>{entry.excerpt}</p>
        <div className="event-card-bottom">
          <span>
            <MapPin size={14} />
            {entry.location || "GRUPO E"}
          </span>
          <Link
            href={`/cursos-e-eventos/${entry.slug}`}
            aria-label={`Leia mais: ${entry.title}`}
          >
            <ArrowUpRight size={21} />
          </Link>
        </div>
      </div>
    </article>
  );
}
