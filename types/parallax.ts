import type { ReactNode, RefObject } from "react";

export type SectionId = "hero" | "benefici" | "corsi" | "chi-sono" | "faq";

export type Course = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  coverImageUrl: string | null;
};

export type ParallaxProps = {
  courses: Course[];
  footer: ReactNode;
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

export type BeneficiSectionProps = BaseSectionProps & {
  scrollContainerRef: RefObject<HTMLDivElement | null>;
};

export type BenefitContent = {
  title: string;
  body: string;
};

export type FaqContent = {
  question: string;
  answer: string;
};

export type TestimonialContent = {
  name: string;
  text: string;
};

export type ParallaxNavProps = {
  active: SectionId;
  isDark: boolean;
  scrollTo: (id: SectionId) => void;
};
