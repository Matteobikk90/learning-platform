import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import Link from "next/link";

export default async function AdminCoursesPage() {
  await requireAdmin();

  const courses = await prisma.course.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="p-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Courses</h1>
          <p className="mt-2 text-gray-600">Manage platform courses.</p>
        </div>

        <Link
          href="/admin/courses/new"
          className="rounded-md bg-black px-4 py-2 text-white">
          New course
        </Link>
      </div>

      <div className="rounded-lg border">
        {courses.length === 0 ? (
          <p className="p-6 text-gray-600">No courses yet.</p>
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
                <div className="text-sm font-medium">
                  €{(course.price / 100).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
