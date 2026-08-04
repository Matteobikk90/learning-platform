"use client";

import { GLOBAL_ERROR_MESSAGES } from "@/constants/i18n";
import { useCurrentLocale } from "@/hooks/use-current-locale";
import type { ErrorPageProps } from "@/types/errors";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: ErrorPageProps) {
  const locale = useCurrentLocale();
  const messages = GLOBAL_ERROR_MESSAGES[locale];

  useEffect(() => {
    console.error("[app] Root rendering failed", error);
  }, [error]);

  return (
    <html lang={locale}>
      <body>
        <main
          style={{
            margin: "15vh auto",
            maxWidth: 560,
            padding: 24,
            textAlign: "center",
          }}>
          <h1>{messages.title}</h1>
          <p>{messages.description}</p>
          <button type="button" onClick={reset}>
            {messages.retry}
          </button>
        </main>
      </body>
    </html>
  );
}
