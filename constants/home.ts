export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export const SECTION_REVEAL_KEYFRAMES: Keyframe[] = [
  { opacity: 0.5, transform: "translateY(18px)" },
  { opacity: 1, transform: "translateY(0)" },
];

export const SECTION_REVEAL_OPTIONS: KeyframeAnimationOptions = {
  duration: 650,
  easing: "cubic-bezier(0.22, 1, 0.36, 1)",
};
