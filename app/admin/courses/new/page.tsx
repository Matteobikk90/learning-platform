import { CourseImageUpload } from "@/components/course-image-upload";
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
        <h1 className="font-display text-[2.75rem] font-normal text-navy mb-2">
          Nuovo corso
        </h1>
      </div>

      <div className="card p-8">
        <form action={createCourse} className="space-y-6">
          <div>
            <label className="form-label">Titolo</label>
            <input name="title" required className="form-input" />
          </div>
          <div>
            <label className="form-label">Descrizione</label>
            <textarea
              name="description"
              rows={4}
              className="form-input"
            />
          </div>
          <div>
            <label className="form-label">Prezzo (€)</label>
            <input
              name="price"
              type="number"
              min="0"
              step="0.01"
              required
              placeholder="49.99"
              className="form-input"
            />
          </div>
          <div>
            <label className="form-label">Immagine di copertina</label>
            <CourseImageUpload />
          </div>
          <button type="submit" className="btn-primary">
            Crea corso
          </button>
        </form>
      </div>
    </main>
  );
}
