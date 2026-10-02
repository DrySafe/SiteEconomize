import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "GRUPO E | Conexões que transformam negócios",
    template: "%s | GRUPO E",
  },
  description:
    "Da distribuição ao FOOD SERVICE, o GRUPO E conecta alimentos, embalagens, varejo e logística em Sergipe.",
  icons: { icon: "/images/Logo-PNG.png" },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <a className="skip-link" href="#conteudo">
          Pular para o conteúdo
        </a>
        {children}
      </body>
    </html>
  );
}
