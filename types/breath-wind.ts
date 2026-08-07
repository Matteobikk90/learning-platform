export type BreathWindPosition = "high" | "middle" | "low";

export type BreathWindPath = {
  d: string;
  length: number;
};

export type BreathWindVariant = {
  paths: readonly BreathWindPath[];
};

export type BreathGust = {
  id: number;
  position: BreathWindPosition;
  variantIndex: number;
};

export type BreathWindProps = {
  gust: BreathGust | null;
};
