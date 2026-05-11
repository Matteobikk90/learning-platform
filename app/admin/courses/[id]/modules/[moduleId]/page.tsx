import Link from "next/link";
import { notFound } from "next/navigation";

import { VideoPlayer } from "@/components/video-player";
import { VideoUpload } from "@/components/video-upload";
import { formatDuration } from "@/lib/format-duration";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

type ModuleDetailPageProps = {
  params: Promise<{
    id: string;
    moduleId: string;
  }>;
};

export default async function ModuleDetailPage({
  params,
}: ModuleDetailPageProps) {
  await requireAdmin();

  const { id, moduleId } = await params;

  const courseModule = await prisma.module.findUnique({
    where: {
      id: moduleId,
    },
    include: {
      course: true,
    },
  });

  if (!courseModule || courseModule.courseId !== id) {
    notFound();
  }

  const videoStatus = courseModule.videoPlaybackId
    ? "Video ready"
    : courseModule.muxUploadId
    ? "Video processing"
    : "No video uploaded";

  return (
    <main className="mx-auto max-w-4xl p-10">
      <Link
        href={`/admin/courses/${id}/modules`}
        className="text-sm text-gray-600">
        ← Back to modules
      </Link>

      <div className="mt-6">
        <p className="text-sm text-gray-500">{courseModule.course.title}</p>
        <h1 className="mt-2 text-3xl font-bold">{courseModule.title}</h1>

        <div className="mt-4 grid gap-2 text-sm text-gray-600">
          <p>Order: {courseModule.order}</p>
          <p>Duration: {formatDuration(courseModule.durationSeconds)}</p>
          <p>Status: {videoStatus}</p>
        </div>
      </div>

      <section className="mt-8 rounded-lg border p-6">
        <h2 className="text-xl font-semibold">Video</h2>

        {courseModule.videoPlaybackId ? (
          <>
            <VideoPlayer
              playbackId={courseModule.videoPlaybackId}
              title={courseModule.title}
            />

            <div className="mt-6 border-t pt-6">
              <p className="mb-4 text-sm text-gray-600">
                Replace the current video with a new one.
              </p>

              <VideoUpload moduleId={courseModule.id} />
            </div>
          </>
        ) : (
          <div className="mt-4">
            <p className="mb-4 text-sm text-gray-600">
              Upload a video for this module.
            </p>

            <VideoUpload moduleId={courseModule.id} />

            {courseModule.muxUploadId && (
              <p className="mt-3 text-sm text-gray-500">
                Video is processing. Refresh this page in a few seconds.
              </p>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
