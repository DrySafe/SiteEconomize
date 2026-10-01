import "server-only";
import { cookies } from "next/headers";
import { createHash, randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { databaseConfigured, supabase } from "./supabase";
const hash = (value: string) =>
  createHash("sha256").update(value).digest("hex");
export async function authenticated() {
  const token = (await cookies()).get("grupo-e-session")?.value;
  if (!token || !databaseConfigured()) return false;
  const { data, error } = await supabase()
    .from("grupo_e_sessions")
    .select("expires_at")
    .eq("token", hash(token))
    .maybeSingle();
  if (error)
    throw new Error("Não foi possível verificar a sessão administrativa.");
  return !!data && new Date(data.expires_at).getTime() > Date.now();
}
export async function requireAdmin() {
  if (!(await authenticated())) redirect("/admin/login");
}
export async function createSession() {
  const token = randomBytes(32).toString("hex");
  const cleanup = await supabase()
    .from("grupo_e_sessions")
    .delete()
    .lt("expires_at", new Date().toISOString());
  if (cleanup.error) throw new Error("Não foi possível preparar a sessão.");
  const { error } = await supabase()
    .from("grupo_e_sessions")
    .insert({
      token: hash(token),
      expires_at: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    });
  if (error) throw new Error("Não foi possível criar a sessão administrativa.");
  (await cookies()).set("grupo-e-session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 8 * 60 * 60,
  });
}
export async function destroySession() {
  const jar = await cookies();
  const token = jar.get("grupo-e-session")?.value;
  if (token && databaseConfigured()) {
    const { error } = await supabase()
      .from("grupo_e_sessions")
      .delete()
      .eq("token", hash(token));
    if (error)
      throw new Error("Não foi possível encerrar a sessão. Tente novamente.");
  }
  jar.delete("grupo-e-session");
}
export async function allowLogin() {
  const { data, error } = await supabase().rpc("grupo_e_allow_login");
  if (error)
    throw new Error(
      "Não foi possível verificar o acesso. Confira a migração do banco.",
    );
  return data === true;
}
export async function resetLoginAttempts() {
  const { error } = await supabase()
    .from("grupo_e_login_attempts")
    .delete()
    .eq("key", "admin");
  if (error) throw new Error("Não foi possível concluir o login.");
}
