"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app] Root rendering failed", error);
  }, [error]);

  return (
    <html lang="it">
      <body>
        <main
          style={{
            margin: "15vh auto",
            maxWidth: 560,
            padding: 24,
            textAlign: "center",
          }}>
          <h1>Qualcosa non ha funzionato</h1>
          <p>Riprova tra qualche istante.</p>
          <button type="button" onClick={reset}>
            Riprova
          </button>
        </main>
      </body>
    </html>
  );
}
