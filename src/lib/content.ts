export const contacts = {
  lojas: process.env.NEXT_PUBLIC_WHATSAPP_LOJAS || "5579998613913",
  embala: process.env.NEXT_PUBLIC_WHATSAPP_EMBALACENTER || "5579996826742",
  email: "contato@grupoenordeste.com.br",
};
export function whatsapp(
  message = "Olá! Vim pelo site do GRUPO E e gostaria de conversar com um especialista.",
  number = contacts.embala,
) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
export const companies = [
  {
    name: "Embala Center",
    type: "DISTRIBUIÇÃO",
    description:
      "Alimentos, insumos e embalagens para quem transforma ingredientes em negócios.",
    icon: "package",
  },
  {
    name: "Lojas Economize",
    type: "VAREJO ESPECIALIZADO",
    description:
      "Tudo para o FOOD SERVICE, perto de você. Em Aracaju, Glória e Lagarto.",
    icon: "store",
  },
  {
    name: "Hiper Economize",
    type: "SUPERMERCADO",
    description:
      "Uma experiência completa de compra, com supermercado e linha FOOD SERVICE em Aracaju.",
    icon: "cart",
  },
  {
    name: "Restaurante & Delicatessen",
    type: "GASTRONOMIA",
    description:
      "Sabor e conveniência dentro do Hiper Economize, da refeição aos pequenos momentos.",
    icon: "chef",
  },
  {
    name: "Estrela Atacado",
    type: "ATACADO BALCÃO",
    description:
      "Compra no balcão para abastecer seu negócio com praticidade em Nossa Senhora da Glória.",
    icon: "boxes",
  },
  {
    name: "Fazenda Encanto",
    type: "AGROPECUÁRIA",
    description:
      "Criação de bovinos premiados em Nossa Senhora da Glória. Qualidade que começa no campo.",
    icon: "leaf",
  },
  {
    name: "E-Transportes",
    type: "LOGÍSTICA",
    description:
      "Transporte rodoviário que conecta operações e dá eficiência à cadeia de abastecimento.",
    icon: "truck",
  },
];
export const units = [
  {
    name: "Economize Centro",
    city: "Aracaju",
    detail: "Insumos e embalagens para FOOD SERVICE",
  },
  {
    name: "Hiper Economize",
    city: "Aracaju",
    detail: "Av. Getúlio Vargas · Supermercado, restaurante e delicatessen",
  },
  {
    name: "Economize Glória",
    city: "Nossa Senhora da Glória",
    detail: "Centro · Insumos e embalagens",
  },
  {
    name: "Economize Lagarto",
    city: "Lagarto",
    detail: "Centro · Insumos e embalagens",
  },
];
