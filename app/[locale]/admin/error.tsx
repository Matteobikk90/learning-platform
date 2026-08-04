"use client";

import type { ErrorPageProps } from "@/types/errors";
import { useEffect } from "react";
import { useTranslations } from "next-intl";

export default function AdminError({
  error,
  reset,
}: ErrorPageProps) {
  const t = useTranslations("Errors");

  useEffect(() => {
    console.error("[admin] Page error", error);
  }, [error]);

  return (
    <main className="mx-auto max-w-2xl px-6 py-20">
      <div className="card p-10 text-center">
        <span className="label-upper text-danger">{t("adminLabel")}</span>
        <h1 className="page-title mt-3">{t("adminTitle")}</h1>
        <p className="mt-4 text-sm text-muted">
          {error.message || t("unexpected")}
        </p>
        <button type="button" onClick={reset} className="btn-primary mt-8">
          {t("retry")}
        </button>
      </div>
    </main>
  );
}
