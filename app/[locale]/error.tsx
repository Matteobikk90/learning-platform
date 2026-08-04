"use client";

import type { ErrorPageProps } from "@/types/errors";
import { useEffect } from "react";
import { useTranslations } from "next-intl";

export default function ErrorPage({
  error,
  reset,
}: ErrorPageProps) {
  const t = useTranslations("Errors");

  useEffect(() => {
    console.error("[app] Rendering failed", error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-6 py-16 text-center">
      <span className="label-upper">{t("label")}</span>
      <h1 className="page-title">{t("title")}</h1>
      <p className="mb-8 text-sm text-muted">
        {t("description")}
      </p>
      <button type="button" onClick={reset} className="btn-primary">
        {t("retry")}
      </button>
    </main>
  );
}
