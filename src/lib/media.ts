import "server-only";
import { randomUUID } from "node:crypto";
import { supabase } from "./supabase";
export const mediaBucket = "grupo-e-eventos";
export async function uploadImage(file: File) {
  if (file.size > 3 * 1024 * 1024)
    throw new Error("A imagem deve ter no máximo 3 MB.");
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
  const path = `${id}.${jpeg ? "jpg" : png ? "png" : "webp"}`;
  const type = jpeg ? "image/jpeg" : png ? "image/png" : "image/webp";
  const { error } = await supabase()
    .storage.from(mediaBucket)
    .upload(path, bytes, { contentType: type, upsert: false });
  if (error)
    throw new Error(
      "Não foi possível enviar a imagem. Confira o bucket grupo-e-eventos no Supabase.",
    );
  const metadata = await supabase()
    .from("grupo_e_media")
    .insert({ id, storage_path: path, content_type: type });
  if (metadata.error) {
    await supabase().storage.from(mediaBucket).remove([path]);
    throw new Error("Não foi possível registrar a capa.");
  }
  return `/media/${id}`;
}
export async function removeImage(image: string) {
  const id = image.match(/^\/media\/([a-f0-9-]{36})$/)?.[1];
  if (!id) return;
  const { data, error } = await supabase()
    .from("grupo_e_media")
    .select("storage_path")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return;
  const removed = await supabase()
    .storage.from(mediaBucket)
    .remove([data.storage_path]);
  if (!removed.error)
    await supabase().from("grupo_e_media").delete().eq("id", id);
}
