import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { contacts, whatsapp } from "@/lib/content";
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-top">
        <div>
          <Link href="/" className="brand">
            <Image src="/images/Logo-PNG.png" width={48} height={48} alt="" />
            <span>
              GRUPO <b>E</b>
            </span>
          </Link>
          <p>
            Conectamos pessoas, negócios
            <br />e possibilidades desde 2005.
          </p>
        </div>
        <div>
          <h3>Explore</h3>
          <Link href="/#sobre">O grupo</Link>
          <Link href="/#empresas">Nossas empresas</Link>
          <Link href="/cursos-e-eventos">Cursos & eventos</Link>
          <Link href="/#unidades">Encontre uma unidade</Link>
        </div>
        <div>
          <h3>Vamos conversar</h3>
          <a
            href={whatsapp(undefined, contacts.lojas)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Economize · (79) 99861-3913 <ArrowUpRight size={14} />
          </a>
          <a href={whatsapp()} target="_blank" rel="noopener noreferrer">
            Embala Center · (79) 99682-6742 <ArrowUpRight size={14} />
          </a>
          <a href={`mailto:${contacts.email}`}>{contacts.email}</a>
        </div>
        <div>
          <h3>Nossa origem</h3>
          <p>
            Rua José Reis, 70
            <br />
            Sebastião Lopes da Silva
            <br />
            Nossa Senhora da Glória · SE
            <br />
            CEP 49680-000
          </p>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>
          © {new Date().getFullYear()} GRUPO E. Todos os direitos reservados.
        </span>
        <Link href="/privacidade">Privacidade</Link>
        <Link href="/admin">Área administrativa</Link>
        <span>Feito para conectar.</span>
      </div>
    </footer>
  );
}
