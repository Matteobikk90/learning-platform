export function CourseCoverPlaceholder() {
  return (
    <div
      className="absolute inset-0 overflow-hidden bg-[#0c1113]"
      aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 82% 42%, rgba(255,255,255,0.16) 0%, rgba(91,121,126,0.12) 22%, transparent 48%), linear-gradient(135deg, #07090a 0%, #152126 56%, #080a0b 100%)",
        }}
      />

      <div className="absolute -right-24 top-1/2 size-80 -translate-y-1/2 rounded-full border border-white/15" />
      <div className="absolute -right-8 top-1/2 size-56 -translate-y-1/2 rounded-full border border-white/20" />
      <div className="absolute right-8 top-1/2 size-32 -translate-y-1/2 rounded-full border border-white/25" />
      <div className="absolute right-23 top-1/2 size-2 -translate-y-1/2 rounded-full bg-white/80 shadow-[0_0_24px_rgba(255,255,255,0.65)]" />

      <div className="absolute inset-y-0 right-[34%] w-px bg-linear-to-b from-transparent via-white/15 to-transparent" />
      <div className="absolute right-8 bottom-7 font-mono text-[0.6rem] uppercase tracking-[0.28em] text-white/35">
        Respiro · Movimento · Presenza
      </div>
    </div>
  );
}
