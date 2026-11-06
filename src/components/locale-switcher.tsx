"use client";

import { useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  names: Record<AppLocale, string>;
};

// Labels come from the server as props, so no messages are shipped to the client.
// Keeps the current page when switching. Search params are not kept yet (add with the search page).
export function LocaleSwitcher({ label, names }: Props) {
  const current = useLocale();
  const pathname = usePathname();

  return (
    <nav aria-label={label} className="flex items-center gap-1 text-sm">
      {routing.locales.map((locale) => (
        <Link
          key={locale}
          href={pathname}
          locale={locale}
          lang={locale}
          hrefLang={locale}
          aria-current={locale === current ? "true" : undefined}
          className={cn(
            "rounded-md px-2 py-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
            locale === current && "bg-muted font-medium text-foreground",
          )}
        >
          {names[locale]}
        </Link>
      ))}
    </nav>
  );
}
