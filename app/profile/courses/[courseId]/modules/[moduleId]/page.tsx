import { VideoPlayer } from "@/components/video-player";
import { formatDuration } from "@/lib/format-duration";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function ProfileModulePage({
  params,
}: {
  params: Promise<{
    courseId: string;
    moduleId: string;
  }>;
}) {
  const session = await requireAuth();
  const { courseId, moduleId } = await params;

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email!,
    },
  });

  if (!user) {
    redirect("/login");
  }

  const purchase = await prisma.purchase.findFirst({
    where: {
      userId: user.id,
      courseId,
    },
  });

  if (!purchase) {
    notFound();
  }

  const courseModule = await prisma.module.findUnique({
    where: {
      id: moduleId,
    },
    include: {
      course: true,
    },
  });

  if (!courseModule || courseModule.courseId !== courseId) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-5xl p-10">
      <Link
        href={`/profile/courses/${courseId}`}
        className="text-sm text-gray-600">
        ← Back to course
      </Link>

      <div className="mt-6">
        <p className="text-sm text-gray-500">{courseModule.course.title}</p>
        <h1 className="mt-2 text-3xl font-bold">
          {courseModule.order}. {courseModule.title}
        </h1>

        <p className="mt-2 text-sm text-gray-600">
          Duration: {formatDuration(courseModule.durationSeconds)}
        </p>
      </div>

      <section className="mt-8">
        {courseModule.videoPlaybackId ? (
          <VideoPlayer
            playbackId={courseModule.videoPlaybackId}
            title={courseModule.title}
          />
        ) : (
          <div className="rounded-lg border p-6">
            <p className="text-gray-600">Video is not available yet.</p>
          </div>
        )}
      </section>
    </main>
  );
}
