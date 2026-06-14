import { updateCourse } from "@/app/admin/courses/[id]/edit/update-course";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const course = await prisma.course.findUnique({ where: { id } });

  if (!course) notFound();

  return (
    <main className="mx-auto max-w-2xl px-6 py-14">
      <Link href="/admin/courses" className="back-link">
        ← Corsi
      </Link>

      <div className="mb-10">
        <span className="label-upper">Admin</span>
        <h1 className="font-display text-[2.75rem] font-normal text-navy mb-2">
          Modifica corso
        </h1>
      </div>

      <div className="card p-8">
        <form action={updateCourse} className="space-y-6">
          <input type="hidden" name="id" value={course.id} />

          <div>
            <label className="form-label">Titolo</label>
            <input
              name="title"
              defaultValue={course.title}
              required
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label">Descrizione</label>
            <textarea
              name="description"
              defaultValue={course.description ?? ""}
              rows={4}
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label">Prezzo (centesimi)</label>
            <input
              type="number"
              name="price"
              defaultValue={course.price}
              required
              className="form-input"
            />
          </div>

          <button type="submit" className="btn-primary">
            Salva modifiche
          </button>
        </form>
      </div>
    </main>
  );
}
