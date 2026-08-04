import { MAGIC_LINK_RATE_LIMIT } from "@/constants/auth";
import { readSignInBody } from "@/functions/auth/read-sign-in-body";
import { getLocaleFromUrl } from "@/functions/i18n/get-locale-from-url";
import { authOptions } from "@/lib/auth";
import { consumeRateLimit, getRequestIp } from "@/lib/rate-limit";
import type { NextAuthRouteContext } from "@/types/routes";
import { NextResponse } from "next/server";
import NextAuth from "next-auth";

const handler = NextAuth(authOptions);

export { handler as GET };

export async function POST(
  request: Request,
  context: NextAuthRouteContext
) {
  const { nextauth } = await context.params;

  if (nextauth[0] === "signin" && nextauth[1] === "email") {
    const { callbackUrl, email, json } = await readSignInBody(request);

    const checks = [
      consumeRateLimit({
        scope: "magic-link-ip",
        value: getRequestIp(request),
        limit: MAGIC_LINK_RATE_LIMIT.ip,
        windowSeconds: MAGIC_LINK_RATE_LIMIT.windowSeconds,
      }),
    ];

    if (email?.trim()) {
      checks.push(
        consumeRateLimit({
          scope: "magic-link-email",
          value: email,
          limit: MAGIC_LINK_RATE_LIMIT.email,
          windowSeconds: MAGIC_LINK_RATE_LIMIT.windowSeconds,
        })
      );
    }

    const limits = await Promise.all(checks);

    if (limits.some((limit) => !limit.allowed)) {
      const retryAfter = Math.max(
        ...limits.map((limit) => limit.retryAfterSeconds)
      );
      const locale = getLocaleFromUrl(callbackUrl ?? request.headers.get("referer"));
      const url = new URL(
        `/${locale}/login?error=RateLimit`,
        request.url
      ).toString();
      const headers = { "Retry-After": String(retryAfter) };

      return json === "true"
        ? NextResponse.json({ url }, { status: 429, headers })
        : NextResponse.redirect(url, { status: 302, headers });
    }
  }

  return handler(request, context);
}
