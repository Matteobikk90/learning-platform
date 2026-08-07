import {
  BREATH_WIND_ANIMATION_DURATION_SECONDS,
  BREATH_WIND_PATH_DELAY_SECONDS,
  BREATH_WIND_STROKE_LAYERS,
  BREATH_WIND_VARIANTS,
} from "@/constants/breath-wind";
import type { BreathWindProps } from "@/types/breath-wind";

export function BreathWind({ gust }: BreathWindProps) {
  if (!gust) return null;

  const variant = BREATH_WIND_VARIANTS[gust.variantIndex];

  return (
    <div
      key={gust.id}
      className="breath-wind"
      data-position={gust.position}
      aria-hidden="true">
      <svg
        viewBox="0 0 1440 400"
        preserveAspectRatio="none"
        focusable="false">
        {variant.paths.map((path, index) => (
          <g key={path.d}>
            {BREATH_WIND_STROKE_LAYERS.map((layer) => {
              const dashLength = Math.round(path.length * layer.dashRatio);

              return (
                <path
                  key={layer.name}
                  d={path.d}
                  strokeDasharray={`${dashLength} ${path.length + 2}`}
                  strokeDashoffset={dashLength}
                  className={`breath-wind-path breath-wind-path-${index + 1} breath-wind-path-${layer.name}`}>
                  <animate
                    attributeName="stroke-dashoffset"
                    begin={`${index * BREATH_WIND_PATH_DELAY_SECONDS}s`}
                    dur={`${BREATH_WIND_ANIMATION_DURATION_SECONDS}s`}
                    from={dashLength}
                    to={dashLength - path.length}
                    fill="freeze"
                  />
                </path>
              );
            })}
          </g>
        ))}
      </svg>
    </div>
  );
}
