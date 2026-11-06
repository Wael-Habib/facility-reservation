import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { locale as rootLocale } from "next/root-params";
import { routing } from "./routing";

// Locale priority:
// 1. explicit override, e.g. getTranslations({ locale }) in a server action or email
// 2. the [locale] root segment (next/root-params, keeps pages static)
// 3. default locale
export default getRequestConfig(async ({ locale }) => {
  let resolved = locale;
  if (!resolved) {
    const fromSegment = await rootLocale();
    resolved = hasLocale(routing.locales, fromSegment) ? fromSegment : routing.defaultLocale;
  }
  if (!hasLocale(routing.locales, resolved)) resolved = routing.defaultLocale;

  return {
    locale: resolved,
    messages: (await import(`../../messages/${resolved}.json`)).default,
    timeZone: "Africa/Tunis",
  };
});
