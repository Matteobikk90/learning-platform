import { DeleteModuleButton } from "@/components/delete-module-button";
import { VideoPlayer } from "@/components/video-player";
import { VideoUpload } from "@/components/video-upload";
import { updateModule } from "@/features/modules/actions";
import { formatDuration } from "@/lib/format-duration";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ModuleDetailPage({
  params,
}: {
  params: Promise<{ id: string; moduleId: string }>;
}) {
  await requireAdmin();

  const { id, moduleId } = await params;

  const courseModule = await prisma.module.findUnique({
    where: { id: moduleId },
    include: { course: true },
  });

  if (!courseModule || courseModule.courseId !== id) notFound();

  const videoStatus = courseModule.videoPlaybackId
    ? "Video pronto"
    : courseModule.muxUploadId
    ? "Video in elaborazione"
    : "Nessun video caricato";

  return (
    <main className="mx-auto max-w-4xl px-6 py-14">
      <Link
        href={`/admin/courses/${id}/modules`}
        className="back-link">
        ← {courseModule.course.title}
      </Link>

      <div className="mb-10">
        <span className="label-upper">
          Modulo {String(courseModule.order).padStart(2, "0")}
        </span>
        <h1 className="page-title">{courseModule.title}</h1>
        <p className="text-sm text-muted">
          Durata: {formatDuration(courseModule.durationSeconds)}
          {" · "}
          {videoStatus}
        </p>
      </div>

      <div className="space-y-6">
        {/* Dettagli */}
        <div className="card p-8">
          <span className="label-upper">Dettagli</span>
          <form action={updateModule} className="mt-4 space-y-5">
            <input type="hidden" name="moduleId" value={courseModule.id} />
            <input type="hidden" name="courseId" value={courseModule.courseId} />
            <div>
              <label className="form-label">Titolo</label>
              <input name="title" required defaultValue={courseModule.title} className="form-input" />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="form-label">Ordine</label>
                <input name="order" type="number" min="1" required defaultValue={courseModule.order} className="form-input" />
              </div>
              <div className="flex-1">
                <label className="form-label">Durata (secondi)</label>
                <input name="durationSeconds" type="number" min="1" required defaultValue={courseModule.durationSeconds} className="form-input" />
              </div>
            </div>
            <button type="submit" className="btn-primary">Salva</button>
          </form>
        </div>

        {/* Video */}
        <div className="card p-8">
          <span className="label-upper">Video</span>

          {courseModule.videoPlaybackId ? (
            <>
              <div className="mt-4">
                <VideoPlayer
                  playbackId={courseModule.videoPlaybackId}
                  title={courseModule.title}
                />
              </div>
              <div className="mt-6 pt-6 border-t border-stroke">
                <p className="text-sm text-muted mb-4">
                  Sostituisci il video corrente con uno nuovo.
                </p>
                <VideoUpload moduleId={courseModule.id} />
              </div>
            </>
          ) : (
            <div className="mt-4">
              <p className="text-sm text-muted mb-4">
                Carica un video per questo modulo.
              </p>
              <VideoUpload moduleId={courseModule.id} />
              {courseModule.muxUploadId && (
                <p className="mt-3 text-sm text-subtle">
                  Il video è in elaborazione. Aggiorna la pagina tra qualche
                  secondo.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Danger zone */}
        <div className="card p-8 border-red-200/70">
          <span className="form-label text-danger">Zona pericolosa</span>
          <p className="text-sm text-muted mb-4">
            Elimina questo modulo definitivamente. I dati di avanzamento
            associati verranno anch&apos;essi eliminati.
          </p>
          <DeleteModuleButton
            moduleId={courseModule.id}
            courseId={courseModule.courseId}
          />
        </div>
      </div>
    </main>
  );
}
