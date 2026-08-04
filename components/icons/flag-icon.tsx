import type { FlagIconProps } from "@/types/icons";

export function FlagIcon({
  locale,
  className = "h-3 w-[1.125rem]",
}: FlagIconProps) {
  return (
    <span
      className={`inline-flex shrink-0 overflow-hidden rounded-[2px] ring-1 ring-current/20 ${className}`}
      aria-hidden="true">
      {locale === "it" ? <ItalianFlag /> : <BritishFlag />}
    </span>
  );
}

function ItalianFlag() {
  return (
    <svg viewBox="0 0 24 16" className="size-full">
      <path fill="#009246" d="M0 0h8v16H0z" />
      <path fill="#fff" d="M8 0h8v16H8z" />
      <path fill="#ce2b37" d="M16 0h8v16h-8z" />
    </svg>
  );
}

function BritishFlag() {
  return (
    <svg viewBox="0 0 24 16" className="size-full">
      <path fill="#012169" d="M0 0h24v16H0z" />
      <path d="M0 0l24 16M24 0L0 16" stroke="#fff" strokeWidth="3.5" />
      <path d="M0 0l24 16M24 0L0 16" stroke="#c8102e" strokeWidth="1.5" />
      <path d="M12 0v16M0 8h24" stroke="#fff" strokeWidth="5" />
      <path d="M12 0v16M0 8h24" stroke="#c8102e" strokeWidth="2.75" />
    </svg>
  );
}
