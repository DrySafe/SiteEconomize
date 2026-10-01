"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { whatsapp } from "@/lib/content";
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <Link href="/" className="brand" aria-label="GRUPO E — início">
        <Image
          src="/images/Logo-PNG.png"
          alt=""
          width={42}
          height={42}
          priority
        />
        <span>
          GRUPO <b>E</b>
          <small>CONEXÕES QUE TRANSFORMAM</small>
        </span>
      </Link>
      <nav
        aria-label="Menu principal"
        className={open ? "navigation is-open" : "navigation"}
      >
        <Link href="/#sobre" onClick={() => setOpen(false)}>
          O grupo
        </Link>
        <Link href="/#empresas" onClick={() => setOpen(false)}>
          Nossas empresas
        </Link>
        <Link href="/#unidades" onClick={() => setOpen(false)}>
          Unidades
        </Link>
        <Link href="/cursos-e-eventos" onClick={() => setOpen(false)}>
          Cursos & eventos
        </Link>
      </nav>
      <a
        className="button button-dark header-cta"
        href={whatsapp()}
        target="_blank"
        rel="noopener noreferrer"
      >
        Vamos conversar <ArrowUpRight size={17} />
      </a>
      <button
        className="menu-toggle"
        aria-label={open ? "Fechar menu" : "Abrir menu"}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {open ? <X /> : <Menu />}
      </button>
    </header>
  );
}
