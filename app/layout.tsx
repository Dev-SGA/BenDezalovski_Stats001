import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ben Dezalovski — Stats de Jogo",
  description: "Estatísticas individuais de Ben Dezalovski (Club Ohio) durante o jogo.",
};

export const viewport = {
  themeColor: "#111318",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
