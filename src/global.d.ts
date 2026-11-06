import type messages from "../messages/fr.json";
import type { routing } from "@/i18n/routing";

// Type-checks translation keys against the French file (the source of truth).
declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof messages;
  }
}
