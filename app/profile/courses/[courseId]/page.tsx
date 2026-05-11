import { formatDuration } from "@/lib/format-duration";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function ProfileCoursePage({
  params,
}: {
  params: Promise<{
    courseId: string;
  }>;
}) {
  const session = await requireAuth();
  const { courseId } = await params;

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
    include: {
      course: {
        include: {
          modules: {
            orderBy: {
              order: "asc",
            },
          },
        },
      },
    },
  });

  if (!purchase) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-5xl p-10">
      <Link href="/profile" className="text-sm text-gray-600">
        ← Back to profile
      </Link>

      <div className="mt-6">
        <h1 className="text-3xl font-bold">{purchase.course.title}</h1>

        {purchase.course.description && (
          <p className="mt-2 text-gray-600">{purchase.course.description}</p>
        )}
      </div>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold">Modules</h2>

        <div className="mt-4 rounded-lg border">
          {purchase.course.modules.length === 0 ? (
            <p className="p-6 text-gray-600">No modules available yet.</p>
          ) : (
            <div className="divide-y">
              {purchase.course.modules.map((module) => (
                <div
                  key={module.id}
                  className="flex items-center justify-between p-6">
                  <div>
                    <h3 className="font-semibold">
                      {module.order}. {module.title}
                    </h3>

                    <p className="mt-1 text-sm text-gray-600">
                      {formatDuration(module.durationSeconds)}
                    </p>

                    {!module.videoPlaybackId && (
                      <p className="mt-1 text-sm text-gray-500">
                        Video not ready yet.
                      </p>
                    )}
                  </div>

                  <Link
                    href={`/profile/courses/${purchase.course.id}/modules/${module.id}`}
                    className="rounded-md bg-black px-4 py-2 text-sm text-white">
                    Open module
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
