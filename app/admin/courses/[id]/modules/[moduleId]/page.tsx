import { DeleteModuleButton } from "@/components/delete-module-button";
import { ModuleEditForm } from "@/components/module-edit-form";
import { VideoPlayer } from "@/components/video-player";
import { VideoUpload } from "@/components/video-upload";
import {
  getVideoState,
  getVideoStatusLabel,
} from "@/functions/video/get-video-state";
import { formatDuration } from "@/lib/format-duration";
import { createPlaybackTokens } from "@/lib/mux";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import type { ModuleRouteProps } from "@/types/routes";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ModuleDetailPage({ params }: ModuleRouteProps) {
  await requireAdmin();

  const { id, moduleId } = await params;

  const courseModule = await prisma.module.findUnique({
    where: { id: moduleId },
    include: { course: true },
  });

  if (!courseModule || courseModule.courseId !== id) notFound();

  const videoState = getVideoState(courseModule);
  const videoStatus = getVideoStatusLabel(courseModule);
  const playbackTokens = courseModule.videoPlaybackId
    ? await createPlaybackTokens(
        courseModule.videoPlaybackId,
        courseModule.videoPlaybackPolicy,
        courseModule.durationSeconds
      )
    : undefined;

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
          Durata: {courseModule.durationSeconds > 0
            ? formatDuration(courseModule.durationSeconds)
            : "da rilevare dal video"}
          {" · "}
          {videoStatus}
        </p>
      </div>

      <div className="space-y-6">
        <div className="card p-8">
          <span className="label-upper">Dettagli</span>
          <ModuleEditForm
            moduleId={courseModule.id}
            title={courseModule.title}
            order={courseModule.order}
            durationSeconds={courseModule.durationSeconds}
          />
        </div>

        <div className="card p-8">
          <span className="label-upper">Video</span>

          {courseModule.videoPlaybackId ? (
            <>
              <div className="mt-4">
                <VideoPlayer
                  playbackId={courseModule.videoPlaybackId}
                  playbackTokens={playbackTokens}
                  title={courseModule.title}
                />
              </div>
              <div className="mt-6 pt-6 border-t border-stroke">
                <p className="text-sm text-muted mb-4">
                  Sostituisci il video corrente con uno nuovo.
                </p>
                <VideoUpload
                  moduleId={courseModule.id}
                  initialStatus={videoState}
                  initialDurationSeconds={courseModule.durationSeconds}
                  initialError={courseModule.videoError}
                />
              </div>
            </>
          ) : (
            <div className="mt-4">
              <p className="text-sm text-muted mb-4">
                Carica un video per questo modulo.
              </p>
              <VideoUpload
                moduleId={courseModule.id}
                initialStatus={videoState}
                initialDurationSeconds={courseModule.durationSeconds}
                initialError={courseModule.videoError}
              />
            </div>
          )}
        </div>

        <div className="card p-8 border-danger/30">
          <span className="form-label text-danger">Zona pericolosa</span>
          <p className="text-sm text-muted mb-4">
            Elimina questo modulo definitivamente. I dati di avanzamento
            associati verranno anch&apos;essi eliminati.
          </p>
          <DeleteModuleButton
            moduleId={courseModule.id}
          />
        </div>
      </div>
    </main>
  );
}
