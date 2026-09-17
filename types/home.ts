import type { ReactNode } from "react";

export type HomeSectionsProps = {
  children: ReactNode;
};

export type Course = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  coverImageUrl: string | null;
};

export type CorsiSectionProps = {
  courses: Course[];
  isAdmin: boolean;
  purchasedSet: Set<string>;
};

export type CourseBannerProps = {
  course: Course;
  isAdmin: boolean;
  purchased: boolean;
};

export type BenefitContent = {
  title: string;
  body: string;
};

export type FaqContent = {
  question: string;
  answer: string;
};
