export type SectionId = "hero" | "benefici" | "corsi" | "chi-sono" | "faq";

export type Course = {
  id: string;
  title: string;
  description: string | null;
  price: number;
};

export type ParallaxProps = {
  courses: Course[];
  purchasedIds: string[];
};

export type BaseSectionProps = {
  visible: Set<SectionId>;
};

export type HeroSectionProps = BaseSectionProps & {
  scrollTo: (id: SectionId) => void;
};

export type CorsiSectionProps = BaseSectionProps & {
  courses: Course[];
  purchasedSet: Set<string>;
};

export type ParallaxNavProps = {
  active: SectionId;
  isDark: boolean;
  scrollTo: (id: SectionId) => void;
};
