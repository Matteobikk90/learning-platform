import type { NavigationIconProps } from "@/types/icons";

const paths = {
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
    </>
  ),
  login: (
    <>
      <path d="M14 8l4 4-4 4" />
      <path d="M18 12H7" />
      <path d="M10 4H5.5A1.5 1.5 0 0 0 4 5.5v13A1.5 1.5 0 0 0 5.5 20H10" />
    </>
  ),
  logout: (
    <>
      <path d="M10 8l-4 4 4 4" />
      <path d="M6 12h11" />
      <path d="M14 4h4.5A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5H14" />
    </>
  ),
} as const;

export function NavigationIcon({
  name,
  className = "size-5 shrink-0",
}: NavigationIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      focusable="false"
      aria-hidden="true">
      {paths[name]}
    </svg>
  );
}
