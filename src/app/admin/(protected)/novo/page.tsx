import { EventForm } from "@/components/admin/event-form";
import { requireAdmin } from "@/lib/auth";
export default async function NewEvent() {
  await requireAdmin();
  return <EventForm />;
}
