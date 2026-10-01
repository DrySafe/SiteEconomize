export const categories = ["Cursos", "Eventos", "Dicas", "Novidades"] as const;
export type Category = (typeof categories)[number];
export type EventEntry = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: Category;
  location: string;
  instructor: string;
  eventDate: string;
  publishedAt: string;
  image: string;
  registrationUrl: string;
  status: "draft" | "published";
  archived: boolean;
};
export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 90);
}
export function safeLink(value: string) {
  if (!value) return "";
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password)
      throw new Error();
    return url.href;
  } catch {
    throw new Error("O link de inscrição deve começar com https://.");
  }
}
export function validateEntry(form: FormData) {
  const get = (key: string, max: number) => {
    const value = String(form.get(key) || "").trim();
    if (value.length > max)
      throw new Error(`O campo ${key} excede o limite de caracteres.`);
    return value;
  };
  const title = get("title", 160),
    excerpt = get("excerpt", 320),
    body = get("body", 20000);
  if (title.length < 5 || excerpt.length < 15 || body.length < 30)
    throw new Error(
      "Preencha o título (5 caracteres), resumo (15) e conteúdo (30).",
    );
  const category = get("category", 30) as Category;
  if (!categories.includes(category))
    throw new Error("Selecione uma categoria válida.");
  const status = get("status", 20);
  if (!["draft", "published"].includes(status))
    throw new Error("Status inválido.");
  const archived = form.get("archived") === "on";
  const date = get("eventDate", 30);
  let eventDate = "";
  if (date) {
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(date))
      throw new Error("Data inválida.");
    const parsed = new Date(`${date}:00-03:00`);
    if (!Number.isFinite(parsed.getTime())) throw new Error("Data inválida.");
    if (
      new Date(parsed.getTime() - 3 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 16) !== date
    )
      throw new Error("Data inválida.");
    eventDate = parsed.toISOString();
  }
  if (
    status === "published" &&
    !archived &&
    ["Cursos", "Eventos"].includes(category) &&
    !eventDate
  )
    throw new Error(
      "Informe a data e o horário antes de publicar um curso ou evento.",
    );
  return {
    title,
    excerpt,
    body,
    category,
    status: status as EventEntry["status"],
    archived,
    eventDate,
    location: get("location", 160),
    instructor: get("instructor", 120),
    registrationUrl: safeLink(get("registrationUrl", 2000)),
  };
}
export function isPast(entry: Pick<EventEntry, "archived" | "eventDate">) {
  return (
    entry.archived ||
    !!(entry.eventDate && new Date(entry.eventDate).getTime() < Date.now())
  );
}
export function formatDate(value: string, time = false) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    ...(time ? { hour: "2-digit", minute: "2-digit" } : {}),
    timeZone: "America/Sao_Paulo",
  }).format(new Date(value));
}
