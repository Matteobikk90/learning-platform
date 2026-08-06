import { LoginForm } from "@/components/login-form";
import { getSafeAuthCallbackUrl } from "@/functions/auth/get-safe-auth-callback-url";
import type { LoginRouteProps } from "@/types/routes";
import { getLocale, getTranslations } from "next-intl/server";

export default async function LoginPage({ searchParams }: LoginRouteProps) {
  const [{ callbackUrl }, locale, t] = await Promise.all([
    searchParams,
    getLocale(),
    getTranslations("Auth"),
  ]);
  const safeCallbackUrl = getSafeAuthCallbackUrl(locale, callbackUrl);

  return (
    <main className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-6 py-16">
      <span className="label-upper text-center">{t("loginEyebrow")}</span>

      <h1 className="page-title leading-[1.15] mb-3 text-center">
        {t("welcome")}
      </h1>

      <p className="text-sm text-muted text-center mb-10 leading-relaxed">
        {t("loginDescription")}
      </p>

      <div className="card p-8">
        <LoginForm callbackUrl={safeCallbackUrl} />
      </div>
    </main>
  );
}
