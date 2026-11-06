import type { Metadata } from "next";
import localFont from "next/font/local";
import { notFound } from "next/navigation";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { DirectionProvider } from "@/components/ui/direction";
import { directionOf, routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import "../globals.css";

// All fonts are self-hosted: no request to Google per visitor.
// Noto Sans Arabic (OFL, Arabic subset only) sits after Geist in the font stack, so Latin text
// stays in Geist and the browser only downloads the Arabic file when a page shows Arabic glyphs.
const notoArabic = localFont({
  src: "../fonts/NotoSansArabic-Variable-arabic.woff2",
  weight: "100 900",
  variable: "--font-arabic",
  display: "swap",
  preload: false,
  declarations: [
    {
      prop: "unicode-range",
      value:
        "U+0600-06FF,U+0750-077F,U+0870-088E,U+0890-0891,U+0897-08E1,U+08E3-08FF,U+200C-200E,U+2010-2011,U+204F,U+2E41,U+FB50-FDFF,U+FE70-FE74,U+FE76-FEFC",
    },
  ],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata");
  return {
    title: { default: t("title"), template: `%s | ${t("title")}` },
    description: t("description"),
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const dir = directionOf(locale);

  return (
    <html
      lang={locale}
      dir={dir}
      className={cn("h-full antialiased", GeistSans.variable, GeistMono.variable, notoArabic.variable)}
    >
      <body className="flex min-h-full flex-col">
        {/* Client components only get the message namespaces they use. */}
        <NextIntlClientProvider messages={null}>
          <DirectionProvider dir={dir}>{children}</DirectionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
