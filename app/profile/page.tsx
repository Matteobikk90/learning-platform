import Link from "next/link";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";

export default async function CoursesPage() {
  const session = await requireAuth();

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: {
      purchases: {
        include: { course: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) redirect("/login");

  const courses = user.purchases.map((p) => p.course);

  return (
    <main className="mx-auto max-w-5xl px-6 py-14">
      <div className="mb-10">
        <span className="label-upper">Profilo</span>
        <h1 className="font-display text-[2.75rem] font-normal text-navy mb-2">
          I miei corsi
        </h1>
        <p className="text-sm text-muted">Continua il tuo percorso di pratica.</p>
      </div>

      <div className="card">
        {courses.length === 0 ? (
          <div className="px-8 py-12 text-center text-muted">
            <p className="font-display text-xl mb-1">Nessun corso ancora</p>
            <p className="text-sm">I tuoi corsi acquistati appariranno qui.</p>
          </div>
        ) : (
          courses.map((course) => (
            <div key={course.id} className="list-row">
              <div>
                <h2 className="font-display text-[1.375rem] font-medium text-navy mb-1">
                  {course.title}
                </h2>
                {course.description && (
                  <p className="text-sm text-muted leading-snug">
                    {course.description}
                  </p>
                )}
              </div>
              <Link href={`/profile/courses/${course.id}`} className="btn-primary">
                Apri
              </Link>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
