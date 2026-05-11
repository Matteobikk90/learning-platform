import Link from "next/link";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";

export default async function CoursesPage() {
  const session = await requireAuth();

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email!,
    },
    include: {
      purchases: {
        include: {
          course: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const courses = user.purchases.map((purchase) => purchase.course);

  return (
    <main className="mx-auto max-w-5xl p-10">
      <div>
        <h1 className="text-3xl font-bold">My courses</h1>
        <p className="mt-2 text-gray-600">Continue your learning path.</p>
      </div>

      <div className="mt-8 rounded-lg border">
        {courses.length === 0 ? (
          <p className="p-6 text-gray-600">You do not have any courses yet.</p>
        ) : (
          <div className="divide-y">
            {courses.map((course) => (
              <div
                key={course.id}
                className="flex items-center justify-between p-6">
                <div>
                  <h2 className="font-semibold">{course.title}</h2>

                  {course.description && (
                    <p className="mt-1 text-sm text-gray-600">
                      {course.description}
                    </p>
                  )}
                </div>

                <Link
                  href={`profile/courses/${course.id}`}
                  className="rounded-md bg-black px-4 py-2 text-sm text-white">
                  Open course
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
