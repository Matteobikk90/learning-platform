import type { ReactNode } from "react";

export type HomeSectionsProps = {
  children: ReactNode;
};

export type Course = {
  id: string;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
};

export type CorsiSectionProps = {
  courses: Course[];
};

export type CourseBannerProps = {
  course: Course;
};

export type BenefitContent = {
  title: string;
  body: string;
};

export type FaqContent = {
  question: string;
  answer: string;
};
