import createMiddleware from "next-intl/middleware";

import { routing } from "@/i18n/routing";

export default createMiddleware(routing);

// "monitoring" is the Sentry tunnel route (see constants/sentry.ts).
export const config = {
  matcher: "/((?!api|monitoring|_next|_vercel|.*\\..*).*)",
};
