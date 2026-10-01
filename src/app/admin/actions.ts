"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import {
  requireAdmin,
  createSession,
  destroySession,
  allowLogin,
} from "@/lib/auth";
import { verifyPassword } from "@/lib/password";
import { db, getEvents, saveEvent } from "@/lib/db";
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
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD_HASH)
    return {
      error:
        "O administrador ainda não foi configurado. Siga o guia de configuração do projeto.",
    };
  if (!allowLogin())
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
  db().prepare("DELETE FROM attempts WHERE key=?").run("admin");
  await createSession();
  redirect("/admin");
}
export async function logout() {
  await destroySession();
  redirect("/admin/login");
}
async function uploadImage(file: File) {
  if (file.size > 5 * 1024 * 1024)
    throw new Error("A imagem deve ter no máximo 5 MB.");
  const bytes = Buffer.from(await file.arrayBuffer());
  const jpeg =
    bytes.length > 3 &&
    bytes[0] === 255 &&
    bytes[1] === 216 &&
    bytes[2] === 255;
  const png = bytes
    .subarray(0, 8)
    .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  const webp =
    bytes.subarray(0, 4).toString() === "RIFF" &&
    bytes.subarray(8, 12).toString() === "WEBP";
  if (!jpeg && !png && !webp)
    throw new Error("Envie uma imagem JPG, PNG ou WebP válida.");
  const id = randomUUID();
  db()
    .prepare("INSERT INTO media(id,type,data) VALUES(?,?,?)")
    .run(id, jpeg ? "image/jpeg" : png ? "image/png" : "image/webp", bytes);
  return `/media/${id}`;
}
export async function save(
  _state: FormResult,
  form: FormData,
): Promise<FormResult> {
  await requireAdmin();
  const all = getEvents(true);
  const requestedId = String(form.get("id") || "");
  const old = all.find((e) => e.id === requestedId);
  if (requestedId && !old)
    return { error: "Este conteúdo não existe mais. Volte ao painel." };
  let entry: EventEntry;
  try {
    const fields = validateEntry(form);
    const id = old?.id || randomUUID();
    const slug = old?.slug || `${slugify(fields.title)}-${id.slice(0, 8)}`;
    let image = old?.image || "";
    const file = form.get("image");
    if (file instanceof File && file.size) image = await uploadImage(file);
    entry = {
      ...fields,
      id,
      slug,
      image,
      publishedAt: old?.publishedAt || new Date().toISOString(),
    };
    saveEvent(entry);
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Não foi possível salvar. Tente novamente.",
    };
  }
  revalidatePath("/");
  revalidatePath("/cursos-e-eventos");
  revalidatePath(`/cursos-e-eventos/${entry.slug}`);
  revalidatePath("/admin");
  redirect("/admin?saved=1");
}
export async function remove(form: FormData) {
  await requireAdmin();
  const id = String(form.get("id") || "");
  const entry = getEvents(true).find((e) => e.id === id);
  if (!entry) return;
  db().prepare("DELETE FROM events WHERE id=?").run(id);
  revalidatePath("/");
  revalidatePath("/cursos-e-eventos");
  revalidatePath(`/cursos-e-eventos/${entry.slug}`);
  revalidatePath("/admin");
}
