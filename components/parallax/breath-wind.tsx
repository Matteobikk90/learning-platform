import { BREATH_WIND_VARIANTS } from "@/constants/breath-wind";
import type { BreathWindProps } from "@/types/breath-wind";

export function BreathWind({ gust }: BreathWindProps) {
  if (!gust) return null;

  const variant = BREATH_WIND_VARIANTS[gust.variantIndex];

  return (
    <div
      key={gust.id}
      className="breath-wind"
      data-direction={gust.direction}
      data-position={gust.position}
      aria-hidden="true">
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
