"use client";
import { useActionState, useState } from "react";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { login } from "@/app/admin/actions";
export function LoginForm({ configured }: { configured: boolean }) {
  const [state, action, pending] = useActionState(login, {});
  const [email, setEmail] = useState("");
  return (
    <form action={action} className="login-form">
      <div className="login-icon">
        <LockKeyhole size={23} />
      </div>
      <span className="eyebrow">ÁREA ADMINISTRATIVA</span>
      <h1>Bom ter você aqui.</h1>
      <p>Entre para cuidar dos cursos e eventos do GRUPO E.</p>
      {!configured && (
        <div className="notice">
          O acesso ainda precisa ser configurado. Consulte o README do projeto
          para criar suas credenciais.
        </div>
      )}
      <label>
        E-mail
        <input
          type="email"
          name="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          autoComplete="username"
          placeholder="seu@email.com"
          maxLength={254}
        />
      </label>
      <label>
        Senha
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          maxLength={512}
          placeholder="Sua senha"
        />
      </label>
      {state.error && (
        <p className="form-error" role="alert">
          {state.error}
        </p>
      )}
      <button className="button button-dark" disabled={pending || !configured}>
        {pending ? "Entrando…" : "Entrar no painel"}
        <ArrowRight size={18} />
      </button>
      <small>Área exclusiva para administradores autorizados.</small>
    </form>
  );
}
