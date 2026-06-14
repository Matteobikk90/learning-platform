import { requireAdmin } from "@/lib/session";
import Link from "next/link";

export default async function AdminPage() {
  await requireAdmin();

  return (
    <main className="mx-auto max-w-5xl px-6 py-14">
      <div className="mb-10">
        <span className="label-upper">Dashboard</span>
        <h1 className="font-display text-[2.75rem] font-normal text-navy mb-2">
          Amministrazione
        </h1>
        <p className="text-sm text-muted">
          Gestisci i contenuti della piattaforma.
        </p>
      </div>

      <div className="card divide-y divide-stroke">
        <Link
          href="/admin/courses"
          className="list-row no-underline group hover:bg-surface transition-colors">
          <div>
            <h2 className="font-display text-xl font-medium text-navy mb-0.5">
              Corsi
            </h2>
            <p className="text-sm text-muted">
              Crea, modifica ed elimina i corsi della piattaforma.
            </p>
          </div>
          <span className="btn-secondary pointer-events-none">Gestisci</span>
        </Link>
      </div>
    </main>
  );
}
