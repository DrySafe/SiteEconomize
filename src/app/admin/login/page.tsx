import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { authenticated } from "@/lib/auth";
import { databaseConfigured } from "@/lib/supabase";
import { LoginForm } from "@/components/admin/login-form";
export const metadata = {
  title: "Acesso administrativo",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";
export default async function Login() {
  if (await authenticated()) redirect("/admin");
  return (
    <main id="conteudo" className="login-page">
      <aside>
        <Link href="/" className="brand">
          <Image src="/images/Logo-PNG.png" alt="" width={46} height={46} />
          <span>
            GRUPO <b>E</b>
          </span>
        </Link>
        <div>
          <span className="eyebrow">CONHECIMENTO EM MOVIMENTO</span>
          <h2>
            Compartilhe ideias.
            <br />
            Conecte pessoas.
            <br />
            <em>Crie possibilidades.</em>
          </h2>
        </div>
        <span>Seu espaço para fazer o conhecimento acontecer.</span>
      </aside>
      <div className="login-side">
        <LoginForm
          configured={
            !!(
              databaseConfigured() &&
              process.env.ADMIN_EMAIL &&
              process.env.ADMIN_PASSWORD_HASH
            )
          }
        />
        <Link href="/" className="text-link">
          ← Voltar ao site
        </Link>
      </div>
    </main>
  );
}
