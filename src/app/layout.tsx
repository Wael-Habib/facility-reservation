import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

// Fonts are self-hosted (no request to Google per visitor).
// Arabic font and the FR / AR / EN switch arrive with i18n in Phase 2.

export const metadata: Metadata = {
  title: { default: "Hôtel Les Oliviers", template: "%s | Hôtel Les Oliviers" },
  description: "Réservez directement au meilleur prix. Hôtel 2 étoiles à Sousse, petit-déjeuner inclus.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
