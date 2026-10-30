import "server-only";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createHash, randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { databaseConfigured, supabase } from "./supabase";
const hash = (value: string) =>
  createHash("sha256").update(value).digest("hex");
export function administratorLoginConfigured() {
  return databaseConfigured() && !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
}
async function authorizedAdministrator(userId: string) {
  const { data: profile, error } = await supabase()
    .from("grupo_e_admin_users")
    .select("role, active")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error("Não foi possível verificar a autorização administrativa.");
  if (!profile?.active || profile.role !== "admin") return null;
  const { data, error: userError } = await supabase().auth.admin.getUserById(userId);
  if (userError || !data.user?.email_confirmed_at || !data.user.updated_at) return null;
  const bannedUntil = (data.user as typeof data.user & { banned_until?: string }).banned_until;
  if (bannedUntil && new Date(bannedUntil).getTime() > Date.now()) return null;
  return data.user;
}
export async function signInAdministrator(email: string, password: string) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("O acesso via Supabase Auth ainda não foi configurado.");
  // Um cliente por tentativa: nunca muda a identidade do cliente privilegiado compartilhado.
  const auth = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const { data, error } = await auth.auth.signInWithPassword({ email, password });
  if (error || !data.user) return null;
  const user = await authorizedAdministrator(data.user.id);
  return user?.id || null;
}
export async function authenticated() {
  const token = (await cookies()).get("grupo-e-session")?.value;
  if (!token || !databaseConfigured()) return false;
  const { data, error } = await supabase()
    .from("grupo_e_sessions")
    .select("expires_at, user_id, auth_version")
    .eq("token", hash(token))
    .maybeSingle();
  if (error)
    throw new Error("Não foi possível verificar a sessão administrativa.");
  if (!data?.user_id || !data.auth_version || new Date(data.expires_at).getTime() <= Date.now()) return false;
  const user = await authorizedAdministrator(data.user_id);
  // Mudanças de senha/conta invalidam a sessão da aplicação.
  return !!user?.updated_at && new Date(user.updated_at).getTime() === new Date(data.auth_version).getTime();
}
export async function requireAdmin() {
  if (!(await authenticated())) redirect("/admin/login");
}
export async function createSession(userId: string) {
  const user = await authorizedAdministrator(userId);
  if (!user?.updated_at) throw new Error("Este usuário não tem acesso administrativo.");
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
      user_id: userId,
      auth_version: user.updated_at,
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
