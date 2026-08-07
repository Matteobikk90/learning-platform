export type LegalSection = {
  title: string;
  paragraphs: string[];
};

export type LegalPageProps = {
  eyebrow: string;
  title: string;
  draftNotice: string;
  updatedLabel: string;
  updatedAt: string;
  sections: LegalSection[];
  action?: ReactNode;
};
import type { ReactNode } from "react";
