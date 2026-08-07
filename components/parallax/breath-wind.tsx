import { BREATH_WIND_VARIANTS } from "@/constants/breath-wind";
import type { BreathWindProps } from "@/types/parallax";

export function BreathWind({ section }: BreathWindProps) {
  const variant = BREATH_WIND_VARIANTS[section];

  if (!variant) return null;

  return (
    <div className="breath-wind" data-section={section} aria-hidden="true">
      <svg
        viewBox="0 0 1440 360"
        preserveAspectRatio="xMidYMid meet"
        focusable="false">
        {variant.paths.map((path, index) => (
          <path
            key={path}
            d={path}
            pathLength="1"
            className={`breath-wind-path breath-wind-path-${index + 1}`}
          />
        ))}
      </svg>
    </div>
  );
}
