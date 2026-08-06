"use client";

import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { useRouter } from "@/i18n/navigation";
import type { LoginFormProps } from "@/types/auth";

export function LoginForm({ callbackUrl }: LoginFormProps) {
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
        callbackUrl,
        redirect: false,
      });

      if (!result?.ok) {
        setError(
          result?.status === 429 ? t("rateLimited") : t("sendFailed")
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
  );
}
