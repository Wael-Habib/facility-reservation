import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Locale routing only: redirects "/" to "/fr" (or the browser's language) and sets the locale cookie.
// Never put authorization here: every server route and action checks the session itself.
export default createMiddleware(routing);

export const config = {
  // Skip API routes, Next internals, Vercel internals and any path with a file extension.
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
