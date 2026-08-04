"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

export default function LoginPage() {
  const locale = useLocale();
  const t = useTranslations("Auth");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    setSubmitting(true);
    setError(null);

    try {
      const result = await signIn("email", {
        email: email.trim(),
        callbackUrl: `/${locale}/profile`,
        redirect: false,
      });

      if (!result?.ok) {
        setError(
          result?.status === 429
            ? t("rateLimited")
            : t("sendFailed")
        );
        setSubmitting(false);
        return;
      }

      router.push("/verify-request");
    } catch {
      setError(t("sendFailed"));
      setSubmitting(false);
    }
  }

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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="form-label">
              {t("email")}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              disabled={submitting}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={t("emailPlaceholder")}
              className="form-input"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full disabled:cursor-wait disabled:opacity-60">
            {submitting ? t("sending") : t("sendMagicLink")}
          </button>

          {error && (
            <p className="text-sm text-danger" role="alert">
              {error}
            </p>
          )}
        </form>
      </div>
    </main>
  );
}
