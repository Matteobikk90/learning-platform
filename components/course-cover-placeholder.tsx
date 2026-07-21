export function CourseCoverPlaceholder() {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      aria-hidden="true">
      <div
        className="course-placeholder-ambient absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 82% 42%, rgba(255,255,255,0.14) 0%, rgba(91,121,126,0.08) 22%, transparent 48%), linear-gradient(135deg, rgba(7,9,10,0.28) 0%, rgba(21,33,38,0.14) 56%, rgba(8,10,11,0.03) 100%)",
        }}
      />

      <div className="course-placeholder-orbit absolute -right-24 top-1/2 size-80 -translate-y-1/2 rounded-full border border-white/15" />
      <div className="course-placeholder-orbit course-placeholder-orbit-medium absolute -right-8 top-1/2 size-56 -translate-y-1/2 rounded-full border border-white/20" />
      <div className="course-placeholder-orbit course-placeholder-orbit-inner absolute right-8 top-1/2 size-32 -translate-y-1/2 rounded-full border border-white/25" />
      <div className="absolute right-23 top-1/2 size-2 -translate-y-1/2 rounded-full bg-white/80 shadow-[0_0_24px_rgba(255,255,255,0.65)]" />

      <div className="course-placeholder-axis absolute inset-y-0 right-[34%] w-px bg-linear-to-b from-transparent via-white/15 to-transparent" />
      <div className="course-placeholder-mantra absolute right-8 bottom-7 font-mono text-[0.6rem] uppercase tracking-[0.28em] text-white/35">
        Respiro · Movimento · Presenza
      </div>
    </div>
  );
}
