import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Padaria Pão Quente — Delivery",
  description:
    "Pães, salgados, doces, bolos e bebidas fresquinhos com entrega rápida em José Bonifácio - SP. Peça pelo WhatsApp.",
  openGraph: {
    title: "Padaria Pão Quente — Delivery",
    description: "Peça pães e quitutes fresquinhos pelo WhatsApp.",
    type: "website",
    locale: "pt_BR",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
