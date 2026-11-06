import { defineRouting } from "next-intl/routing";

// French is the default: most Tunisian hotel staff and many guests read it first.
// Arabic is rendered right to left (see rtlLocales).
export const routing = defineRouting({
  locales: ["fr", "ar", "en"],
  defaultLocale: "fr",
  localePrefix: "always",
});

export type AppLocale = (typeof routing.locales)[number];

const rtlLocales: readonly AppLocale[] = ["ar"];

export function directionOf(locale: AppLocale): "rtl" | "ltr" {
  return rtlLocales.includes(locale) ? "rtl" : "ltr";
}
