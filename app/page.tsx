import { prisma } from "@/lib/prisma";

export default async function Home() {
  const courses = await prisma.course.findMany();

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      {/* Hero */}
      <section className="mb-16 text-center">
        <span className="label-upper justify-center">Piattaforma di apprendimento</span>
        <h1 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] font-light leading-[1.1] text-navy mb-6">
          Scopri il tuo percorso
          <br />
          <em>nello yoga</em>
        </h1>
        <p className="text-[0.9375rem] text-muted max-w-[36ch] mx-auto leading-[1.7]">
          Corsi pensati per guidarti in ogni fase della pratica, dal primo
          respiro alla consapevolezza profonda.
        </p>
      </section>

      {/* Courses */}
      <section>
        <p className="text-[0.7rem] font-semibold tracking-widest uppercase text-muted mb-6">
          Corsi disponibili ({courses.length})
        </p>

        {courses.length === 0 ? (
          <div className="card px-8 py-16 text-center text-muted">
            Nessun corso disponibile al momento.
          </div>
        ) : (
          <div className="card divide-y divide-stroke">
            {courses.map((course) => (
              <div key={course.id} className="list-row">
                <div>
                  <h3 className="font-display text-2xl font-medium text-navy mb-1">
                    {course.title}
                  </h3>
                  {course.description && (
                    <p className="text-sm text-muted leading-relaxed">
                      {course.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
