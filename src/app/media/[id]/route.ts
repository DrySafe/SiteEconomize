import { db } from "@/lib/db";
export const runtime = "nodejs";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!/^[a-f0-9-]{36}$/.test(id)) return new Response(null, { status: 404 });
  const row = db().prepare("SELECT type,data FROM media WHERE id=?").get(id) as
    { type: string; data: Uint8Array } | undefined;
  if (!row) return new Response(null, { status: 404 });
  return new Response(new Uint8Array(row.data), {
    headers: {
      "Content-Type": row.type,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
