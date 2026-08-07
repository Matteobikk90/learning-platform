import {
  BREATH_WIND_COOLDOWN_MAX_MS,
  BREATH_WIND_COOLDOWN_MIN_MS,
  BREATH_WIND_POSITIONS,
  BREATH_WIND_VARIANTS,
} from "@/constants/breath-wind";
import type { BreathGust } from "@/types/breath-wind";

export function createBreathGust(id: number): BreathGust {
  return {
    id,
    position: pickRandom(BREATH_WIND_POSITIONS),
    variantIndex: Math.floor(Math.random() * BREATH_WIND_VARIANTS.length),
  };
}

export function getBreathWindCooldown() {
  return (
    BREATH_WIND_COOLDOWN_MIN_MS +
    Math.random() *
      (BREATH_WIND_COOLDOWN_MAX_MS - BREATH_WIND_COOLDOWN_MIN_MS)
  );
}

function pickRandom<T>(items: readonly T[]) {
  return items[Math.floor(Math.random() * items.length)];
}
