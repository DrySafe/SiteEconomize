import type { EventEntry } from "./event-validation";
const course = (
  id: string,
  title: string,
  excerpt: string,
  image: string,
  instructor: string,
  publishedAt: string,
): EventEntry => ({
  id,
  slug: id,
  title,
  excerpt,
  body:
    excerpt +
    "\n\nAprendizado e troca de experiências para ampliar o repertório de quem trabalha com produção food.\n\nEste encontro faz parte do nosso arquivo. Converse com nossa equipe para conhecer as próximas oportunidades de aprendizado no Centro Culinário Hiper Economize.",
  image,
  category: "Cursos",
  location: "Centro Culinário Hiper Economize · Aracaju",
  instructor,
  publishedAt,
  eventDate: "",
  registrationUrl: "",
  status: "published",
  archived: true,
});
export const seed: EventEntry[] = [
  course(
    "caixa-presente-dia-das-maes",
    "Caixa presente Dia das Mães com Viviane Resende",
    "Biscoitos e chocolates personalizados para encantar no sabor e na apresentação. Uma aula de caixa presente para o Dia das Mães no Centro Culinário Hiper Economize.",
    "/images/Curso-Viviane-Resende-e1746023502355.png",
    "Viviane Resende",
    "2025-04-30T12:00:00Z",
  ),
  course(
    "bolo-de-puba-e-leite",
    "Bolo de puba e bolo de leite com Viviane Resende",
    "Tradição e sabor do Nordeste: uma aula presencial sobre bolo de puba e bolo de leite com Viviane Resende, para enriquecer seu repertório de receitas.",
    "/images/Curso-Viviane-Resende-26-Hiper-e1746022747643.png",
    "Viviane Resende",
    "2025-04-30T12:00:00Z",
  ),
  course(
    "licor-artesanal",
    "Licor artesanal com Ana Carla",
    "Sabor, aroma e apresentação: uma aula presencial sobre licor artesanal com Ana Carla, para ampliar seu repertório de produção.",
    "/images/Curso-Ana-Carla-e1746023007188.png",
    "Ana Carla",
    "2025-04-30T12:00:00Z",
  ),
  course(
    "festa-na-caixa",
    "Festa na caixa com Thaiane Bispo",
    "Uma proposta criativa para o Dia dos Namorados. Festa na caixa combina sabor e apresentação para surpreender no presente e nas vendas.",
    "/images/Curso-Thaiane-Bispo-e1746022358335.png",
    "Thaiane Bispo",
    "2025-04-30T12:00:00Z",
  ),
  course(
    "dia-dos-namorados",
    "Criações para o Dia dos Namorados",
    "Uma aula presencial com a chef Priscila Costa, dedicada a transformar amor em sabor no Centro Culinário Hiper Economize.",
    "/images/WhatsApp-Image-2025-04-30-at-12.41.38-e1746205981220.jpeg",
    "Chef Priscila Costa",
    "2025-05-02T12:00:00Z",
  ),
];
