import { DeleteModuleButton } from "@/components/delete-module-button";
import { ModuleEditForm } from "@/components/module-edit-form";
import { VideoPlayer } from "@/components/video-player";
import { VideoUpload } from "@/components/video-upload";
import {
  getVideoState,
  getVideoStatusMessageKey,
} from "@/functions/video/get-video-state";
import { Link } from "@/i18n/navigation";
import { formatDuration } from "@/lib/format-duration";
import { createPlaybackTokens } from "@/lib/mux";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import type { ModuleRouteProps } from "@/types/routes";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

export default async function ModuleDetailPage({ params }: ModuleRouteProps) {
  await requireAdmin();
  const [t, tVideo] = await Promise.all([
    getTranslations("Admin"),
    getTranslations("Video"),
  ]);

  const { id, moduleId } = await params;

  const courseModule = await prisma.module.findUnique({
    where: { id: moduleId },
    include: { course: true },
  });

  if (!courseModule || courseModule.courseId !== id) notFound();

  const videoState = getVideoState(courseModule);
  const videoStatus = tVideo(getVideoStatusMessageKey(courseModule));
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
          {t("module", {
            number: String(courseModule.order).padStart(2, "0"),
          })}
        </span>
        <h1 className="page-title">{courseModule.title}</h1>
        <p className="text-sm text-muted">
          {t("duration", {
            duration:
              courseModule.durationSeconds > 0
                ? formatDuration(courseModule.durationSeconds)
                : t("durationFromVideo"),
          })}
          {" · "}
          {videoStatus}
        </p>
      </div>

      <div className="space-y-6">
        <div className="card p-8">
          <span className="label-upper">{t("details")}</span>
          <ModuleEditForm
            moduleId={courseModule.id}
            title={courseModule.title}
            order={courseModule.order}
            durationSeconds={courseModule.durationSeconds}
          />
        </div>

        <div className="card p-8">
          <span className="label-upper">{t("video")}</span>

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
                  {t("replaceVideo")}
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
                {t("uploadVideo")}
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
          <span className="form-label text-danger">{t("dangerZone")}</span>
          <p className="text-sm text-muted mb-4">
            {t("deleteModuleDescription")}
          </p>
          <DeleteModuleButton
            moduleId={courseModule.id}
          />
        </div>
      </div>
    </main>
  );
}
