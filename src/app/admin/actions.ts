"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import {
  requireAdmin,
  createSession,
  destroySession,
  allowLogin,
  resetLoginAttempts,
} from "@/lib/auth";
import { verifyPassword } from "@/lib/password";
import { getEvents, saveEvent, deleteEvent } from "@/lib/db";
import { databaseConfigured } from "@/lib/supabase";
import { uploadImage, removeImage } from "@/lib/media";
import {
  slugify,
  validateEntry,
  type EventEntry,
} from "@/lib/event-validation";
export type FormResult = { error?: string };
export async function login(
  _state: FormResult,
  form: FormData,
): Promise<FormResult> {
  if (
    !databaseConfigured() ||
    !process.env.ADMIN_EMAIL ||
    !process.env.ADMIN_PASSWORD_HASH
  )
    return {
      error:
        "O administrador ainda não foi configurado. Siga o guia de configuração do projeto.",
    };
  let allowed: boolean;
  try {
    allowed = await allowLogin();
  } catch {
    return {
      error:
        "Não foi possível conectar ao banco. Confira a configuração do Supabase antes de entrar.",
    };
  }
  if (!allowed)
    return {
      error: "Muitas tentativas. Aguarde 15 minutos antes de tentar novamente.",
    };
  const email = String(form.get("email") || "")
      .trim()
      .toLowerCase(),
    password = String(form.get("password") || "");
  if (password.length > 512) return { error: "E-mail ou senha incorretos." };
  const valid = verifyPassword(password, process.env.ADMIN_PASSWORD_HASH);
  if (!valid || email !== process.env.ADMIN_EMAIL.trim().toLowerCase())
    return { error: "E-mail ou senha incorretos." };
  try {
    await resetLoginAttempts();
    await createSession();
  } catch {
    return {
      error:
        "Não foi possível iniciar a sessão. Tente novamente ou confira a configuração do Supabase.",
    };
  }
  redirect("/admin");
}
export async function logout() {
  await destroySession();
  redirect("/admin/login");
}
export async function save(
  _state: FormResult,
  form: FormData,
): Promise<FormResult> {
  await requireAdmin();
  const all = await getEvents(true);
  const requestedId = String(form.get("id") || "");
  const old = all.find((e) => e.id === requestedId);
  if (requestedId && !old)
    return { error: "Este conteúdo não existe mais. Volte ao painel." };
  let entry: EventEntry;
  let uploaded = "";
  try {
    const fields = validateEntry(form);
    const id = old?.id || randomUUID();
    const slug = old?.slug || `${slugify(fields.title)}-${id.slice(0, 8)}`;
    let image = old?.image || "";
    const file = form.get("image");
    if (file instanceof File && file.size)
      image = uploaded = await uploadImage(file);
    entry = {
      ...fields,
      id,
      slug,
      image,
      publishedAt: old?.publishedAt || new Date().toISOString(),
    };
    await saveEvent(entry);
  } catch (error) {
    if (uploaded) await removeImage(uploaded);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Não foi possível salvar. Tente novamente.",
    };
  }
  if (uploaded && old?.image) await removeImage(old.image);
  revalidatePath("/");
  revalidatePath("/cursos-e-eventos");
  revalidatePath(`/cursos-e-eventos/${entry.slug}`);
  revalidatePath("/admin");
  redirect("/admin?saved=1");
}
export async function remove(form: FormData) {
  await requireAdmin();
  const id = String(form.get("id") || "");
  const entry = (await getEvents(true)).find((e) => e.id === id);
  if (!entry) return;
  await deleteEvent(id);
  await removeImage(entry.image);
  revalidatePath("/");
  revalidatePath("/cursos-e-eventos");
  revalidatePath(`/cursos-e-eventos/${entry.slug}`);
  revalidatePath("/admin");
}
