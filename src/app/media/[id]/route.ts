import { supabase, databaseConfigured } from "@/lib/supabase";
import { authenticated } from "@/lib/auth";
import { mediaBucket } from "@/lib/media";
export const runtime = "nodejs";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!/^[a-f0-9-]{36}$/.test(id) || !databaseConfigured())
    return new Response(null, { status: 404 });
  const published = await supabase()
    .from("grupo_e_events")
    .select("id")
    .eq("status", "published")
    .eq("data->>image", `/media/${id}`)
    .limit(1);
  if (published.error) return new Response(null, { status: 503 });
  if (!published.data?.length && !(await authenticated()))
    return new Response(null, { status: 404 });
  const { data, error } = await supabase()
    .from("grupo_e_media")
    .select("storage_path,content_type")
    .eq("id", id)
    .maybeSingle();
  if (error) return new Response(null, { status: 503 });
  if (!data) return new Response(null, { status: 404 });
  const download = await supabase()
    .storage.from(mediaBucket)
    .download(data.storage_path);
  if (download.error || !download.data)
    return new Response(null, { status: 503 });
  return new Response(await download.data.arrayBuffer(), {
    headers: {
      "Content-Type": data.content_type,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
