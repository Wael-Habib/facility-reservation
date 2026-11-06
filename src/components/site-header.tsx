import { getTranslations } from "next-intl/server";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { Link } from "@/i18n/navigation";

export async function SiteHeader() {
  const t = await getTranslations();

  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4">
        <Link href="/" className="font-heading font-semibold">
          {t("Metadata.title")}
        </Link>
        <LocaleSwitcher
          label={t("LocaleSwitcher.label")}
          names={{
            fr: t("LocaleSwitcher.fr"),
            ar: t("LocaleSwitcher.ar"),
            en: t("LocaleSwitcher.en"),
          }}
        />
      </div>
    </header>
  );
}
