import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{
    courseId?: string;
  }>;
}) {
  const { courseId } = await searchParams;

  const course = courseId
    ? await prisma.course.findUnique({
        where: {
          id: courseId,
        },
      })
    : null;

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
      <div className="card w-full px-10 py-14">
        <p className="label-upper">Pagamento completato</p>

        <h1 className="font-display mt-4 text-5xl text-white">
          Grazie per il tuo acquisto
        </h1>

        <p className="mt-6 text-muted">
          {course
            ? `Hai acquistato "${course.title}".`
            : "Il corso è stato aggiunto al tuo profilo."}
        </p>

        <div className="mt-10 flex justify-center">
          {course ? (
            <Link
              href={`/profile/courses/${course.id}`}
              className="btn-primary">
              Vai al corso
            </Link>
          ) : (
            <Link href="/profile" className="btn-primary">
              Vai al profilo
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
