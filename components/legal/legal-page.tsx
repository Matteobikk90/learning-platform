import type { LegalPageProps } from "@/types/legal";

export function LegalPage({
  action,
  draftNotice,
  eyebrow,
  sections,
  title,
  updatedAt,
  updatedLabel,
}: LegalPageProps) {
  return (
    <main className="mx-auto max-w-3xl px-6 py-14 sm:py-20">
      <div className="mb-10">
        <span className="label-upper">{eyebrow}</span>
        <h1 className="page-title">{title}</h1>
        <p className="mt-4 rounded-md border border-danger/30 bg-danger/5 p-4 text-sm leading-relaxed text-danger">
          {draftNotice}
        </p>
        <p className="mt-4 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-subtle">
          {updatedLabel}: {updatedAt}
        </p>
      </div>

      <div className="card divide-y divide-stroke">
        {sections.map((section) => (
          <section key={section.title} className="px-6 py-7 sm:px-9 sm:py-9">
            <h2 className="font-display text-2xl text-white">
              {section.title}
            </h2>
            <div className="mt-4 space-y-4 text-sm leading-7 text-muted">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}
      </div>

      {action && <div className="mt-8">{action}</div>}
    </main>
  );
}
