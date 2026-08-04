import { CourseImageUpload } from "@/components/course-image-upload";
import { SubmitButton } from "@/components/submit-button";
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
        <form action={createCourse} className="space-y-6">
          <div>
            <label htmlFor="course-title" className="form-label">Titolo</label>
            <input id="course-title" name="title" required maxLength={120} className="form-input" />
          </div>
          <div>
            <label htmlFor="course-description" className="form-label">Descrizione</label>
            <textarea
              id="course-description"
              name="description"
              rows={4}
              className="form-input"
            />
          </div>
          <div>
            <label htmlFor="course-price" className="form-label">Prezzo (€)</label>
            <input
              id="course-price"
              name="price"
              type="number"
              min="0.50"
              step="0.01"
              required
              placeholder="49.99"
              className="form-input"
            />
          </div>
          <div>
            <span className="form-label">Immagine di copertina</span>
            <CourseImageUpload />
          </div>
          <SubmitButton pendingLabel="Creazione…">
            Crea corso
          </SubmitButton>
        </form>
      </div>
    </main>
  );
}
