import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-6 py-16 text-center">
      <span className="label-upper">404</span>
      <h1 className="page-title">Pagina non trovata</h1>
      <p className="mb-8 text-sm text-muted">
        La pagina che stai cercando non esiste o non è più disponibile.
      </p>
      <Link href="/" className="btn-primary">
        Torna alla home
      </Link>
    </main>
  );
}
