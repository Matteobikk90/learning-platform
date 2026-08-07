export type BreathWindDirection = "from-left" | "from-right";

export type BreathWindPosition = "high" | "middle" | "low";

export type BreathWindVariant = {
  paths: readonly string[];
};

export type BreathGust = {
  direction: BreathWindDirection;
  id: number;
  position: BreathWindPosition;
  variantIndex: number;
};

export type BreathWindProps = {
  gust: BreathGust | null;
};
