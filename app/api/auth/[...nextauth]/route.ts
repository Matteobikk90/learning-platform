import { authOptions } from "@/lib/auth";
import { consumeRateLimit, getRequestIp } from "@/lib/rate-limit";
import { NextResponse } from "next/server";
import NextAuth from "next-auth";

const handler = NextAuth(authOptions);

export { handler as GET };

// next-auth accepts both JSON and form-encoded sign-in bodies, so the rate
// limiter must read the email from whichever format the request uses.
async function readSignInBody(
  request: Request
): Promise<{ email?: string; json?: string }> {
  try {
    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      const body: unknown = await request.clone().json();

      if (!body || typeof body !== "object") return {};

      const { email, json } = body as Record<string, unknown>;

      return {
        email: typeof email === "string" ? email : undefined,
        json: typeof json === "string" ? json : undefined,
      };
    }

    const formData = await request.clone().formData();
    const email = formData.get("email");
    const json = formData.get("json");

    return {
      email: typeof email === "string" ? email : undefined,
      json: typeof json === "string" ? json : undefined,
    };
  } catch {
    return {};
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ nextauth: string[] }> }
) {
  const { nextauth } = await context.params;

  if (nextauth[0] === "signin" && nextauth[1] === "email") {
    const { email, json } = await readSignInBody(request);

    const checks = [
      consumeRateLimit({
        scope: "magic-link-ip",
        value: getRequestIp(request),
        limit: 10,
        windowSeconds: 15 * 60,
      }),
    ];

    if (email?.trim()) {
      checks.push(
        consumeRateLimit({
          scope: "magic-link-email",
          value: email,
          limit: 3,
          windowSeconds: 15 * 60,
        })
      );
    }

    const limits = await Promise.all(checks);

    if (limits.some((limit) => !limit.allowed)) {
      const retryAfter = Math.max(
        ...limits.map((limit) => limit.retryAfterSeconds)
      );
      const url = new URL("/login?error=RateLimit", request.url).toString();
      const headers = { "Retry-After": String(retryAfter) };

      // Mirror next-auth's own response contract: JSON for its client
      // (json=true), a redirect for plain form posts.
      return json === "true"
        ? NextResponse.json({ url }, { status: 429, headers })
        : NextResponse.redirect(url, { status: 302, headers });
    }
  }

  return handler(request, context);
}
