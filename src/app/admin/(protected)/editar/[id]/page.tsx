import { notFound } from "next/navigation";
import { EventForm } from "@/components/admin/event-form";
import { getEvents } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
export default async function Edit({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const entry = getEvents(true).find((e) => e.id === id);
  if (!entry) notFound();
  return <EventForm entry={entry} />;
}
