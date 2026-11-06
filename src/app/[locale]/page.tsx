import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

// Placeholder home. The real home (hero, room types, why book direct) is Phase 2 step 3.
export default async function HomePage() {
  const t = await getTranslations("Home");

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center gap-6 px-4 py-24">
        <p className="text-sm font-medium text-muted-foreground">{t("eyebrow")}</p>
        <h1 className="max-w-2xl font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
          {t("title")}
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">{t("subtitle")}</p>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="lg" disabled>
            {t("cta")}
            {/* rtl:rotate-180 flips the arrow so it points forward in Arabic. */}
            <ArrowRight data-icon="inline-end" className="rtl:rotate-180" />
          </Button>
          <span className="text-sm text-muted-foreground">{t("comingSoon")}</span>
        </div>
      </main>
    </>
  );
}
