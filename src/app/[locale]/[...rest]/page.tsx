import { notFound } from "next/navigation";

// Unknown paths under a locale render the localized [locale]/not-found.tsx with HTTP 404.
// Known limitation (Next 16 + cacheComponents): this route is served from a fallback shell, so the
// localized 404 content appears after client hydration. Status code and noindex are correct.
export default function CatchAllPage() {
  notFound();
}
