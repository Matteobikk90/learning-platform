import type { SignInBody } from "@/types/auth";

export async function readSignInBody(request: Request): Promise<SignInBody> {
  try {
    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      const body: unknown = await request.clone().json();

      if (!body || typeof body !== "object") return {};

      const { callbackUrl, email, json } = body as Record<string, unknown>;

      return {
        ...(typeof callbackUrl === "string" ? { callbackUrl } : {}),
        email: typeof email === "string" ? email : undefined,
        json: typeof json === "string" ? json : undefined,
      };
    }

    const formData = await request.clone().formData();
    const callbackUrl = formData.get("callbackUrl");
    const email = formData.get("email");
    const json = formData.get("json");

    return {
      ...(typeof callbackUrl === "string" ? { callbackUrl } : {}),
      email: typeof email === "string" ? email : undefined,
      json: typeof json === "string" ? json : undefined,
    };
  } catch {
    return {};
  }
}
