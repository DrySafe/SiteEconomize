import Link from "next/link";
import Image from "next/image";
import { LogOut, ArrowUpRight } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { logout } from "../actions";
export const metadata = {
  title: "Painel de conteúdos",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  return (
    <div className="admin-shell">
      <header className="admin-header">
        <Link href="/admin" className="brand">
          <Image src="/images/Logo-PNG.png" alt="" width={37} height={37} />
          <span>
            GRUPO <b>E</b>
            <small>PAINEL DE CONTEÚDOS</small>
          </span>
        </Link>
        <div>
          <Link href="/cursos-e-eventos" target="_blank" className="text-link">
            Ver site <ArrowUpRight size={16} />
          </Link>
          <form action={logout}>
            <button className="button button-outline">
              Sair <LogOut size={16} />
            </button>
          </form>
        </div>
      </header>
      <main id="conteudo" className="admin-container">
        {children}
      </main>
    </div>
  );
}
