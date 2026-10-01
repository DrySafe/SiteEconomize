import "server-only";
import type { EventEntry } from "./event-validation";
import { seed } from "./seed";
import { databaseConfigured, supabase } from "./supabase";
export async function getEvents(includeDrafts = false): Promise<EventEntry[]> {
  // Permite visualizar o institucional antes da configuração, sem gravar em disco.
  // Erros de um banco configurado nunca são mascarados por conteúdo de demonstração.
  if (!databaseConfigured() && !includeDrafts)
    return [...seed].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  let query = supabase()
    .from("grupo_e_events")
    .select("data")
    .order("published_at", { ascending: false });
  if (!includeDrafts) query = query.eq("status", "published");
  const { data, error } = await query;
  if (error)
    throw new Error(
      "Não foi possível consultar os conteúdos. Confira a migração e as credenciais do Supabase.",
    );
  return (data || []).map((row) => row.data as EventEntry);
}
export async function getEvent(
  slug: string,
  includeDrafts = false,
): Promise<EventEntry | undefined> {
  if (!databaseConfigured() && !includeDrafts)
    return seed.find((entry) => entry.slug === slug);
  let query = supabase().from("grupo_e_events").select("data").eq("slug", slug);
  if (!includeDrafts) query = query.eq("status", "published");
  const { data, error } = await query.maybeSingle();
  if (error) throw new Error("Não foi possível consultar este conteúdo.");
  return data?.data as EventEntry | undefined;
}
export async function saveEvent(entry: EventEntry) {
  const { error } = await supabase().from("grupo_e_events").upsert(
    {
      id: entry.id,
      slug: entry.slug,
      status: entry.status,
      published_at: entry.publishedAt,
      data: entry,
    },
    { onConflict: "id" },
  );
  if (error)
    throw new Error(
      "Não foi possível salvar no banco. Confira a configuração do Supabase.",
    );
}
export async function deleteEvent(id: string) {
  const { error } = await supabase()
    .from("grupo_e_events")
    .delete()
    .eq("id", id);
  if (error) throw new Error("Não foi possível excluir o conteúdo.");
}
