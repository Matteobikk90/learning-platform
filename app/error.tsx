"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app] Rendering failed", error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-6 py-16 text-center">
      <span className="label-upper">Errore</span>
      <h1 className="page-title">Qualcosa non ha funzionato</h1>
      <p className="mb-8 text-sm text-muted">
        Riprova: se il problema continua, torna alla home e ripeti l’operazione.
      </p>
      <button type="button" onClick={reset} className="btn-primary">
        Riprova
      </button>
    </main>
  );
}
