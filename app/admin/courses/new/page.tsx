import { CourseForm } from "@/components/course-form";
import { createCourse } from "@/features/courses/actions";
import { requireAdmin } from "@/lib/session";
import Link from "next/link";

export default async function NewCoursePage() {
  await requireAdmin();

  return (
    <main className="mx-auto max-w-2xl px-6 py-14">
      <Link href="/admin/courses" className="back-link">
        ← Corsi
      </Link>

      <div className="mb-10">
        <span className="label-upper">Admin</span>
        <h1 className="page-title">Nuovo corso</h1>
      </div>

      <div className="card p-8">
        <CourseForm
          action={createCourse}
          submitLabel="Crea corso"
          pendingLabel="Creazione…"
        />
      </div>
    </main>
  );
}
