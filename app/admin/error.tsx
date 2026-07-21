"use client";

import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin] Page error", error);
  }, [error]);

  return (
    <main className="mx-auto max-w-2xl px-6 py-20">
      <div className="card p-10 text-center">
        <span className="label-upper text-danger">Operazione non riuscita</span>
        <h1 className="page-title mt-3">Controlla i dati e riprova</h1>
        <p className="mt-4 text-sm text-muted">
          {error.message || "Si è verificato un errore imprevisto."}
        </p>
        <button type="button" onClick={reset} className="btn-primary mt-8">
          Riprova
        </button>
      </div>
    </main>
  );
}
