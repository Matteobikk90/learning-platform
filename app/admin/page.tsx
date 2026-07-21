import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import Link from "next/link";

export default async function AdminPage() {
  await requireAdmin();

  const [courses, modules, users, purchases] = await Promise.all([
    prisma.course.count(),
    prisma.module.count(),
    prisma.user.count(),
    prisma.purchase.aggregate({
      _count: { id: true },
      _sum: { amountTotal: true },
    }),
  ]);

  const revenue = purchases._sum.amountTotal ?? 0;

  const stats = [
    { label: "Corsi", value: courses },
    { label: "Moduli", value: modules },
    { label: "Utenti", value: users },
    { label: "Acquisti", value: purchases._count.id },
    {
      label: "Fatturato",
      value: `€${(revenue / 100).toLocaleString("it-IT", { minimumFractionDigits: 2 })}`,
    },
  ];

  return (
    <main className="mx-auto max-w-5xl px-6 py-14">
      <div className="mb-10">
        <span className="label-upper">Dashboard</span>
        <h1 className="page-title">Amministrazione</h1>
        <p className="text-sm text-muted">
          Gestisci i contenuti della piattaforma.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
        {stats.map(({ label, value }) => (
          <div
            key={label}
            className="bg-surface border border-stroke rounded-xl p-5">
            <p className="font-mono text-[0.7rem] tracking-[0.2em] uppercase text-muted mb-2">
              {label}
            </p>
            <p className="font-display text-[1.75rem] font-medium text-white leading-none">
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="card">
        <Link
          href="/admin/courses"
          className="list-row no-underline hover:bg-white/5 transition-colors">
          <div>
            <h2 className="list-row-title mb-0.5">Corsi</h2>
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
