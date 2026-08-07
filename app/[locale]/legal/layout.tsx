import type { Metadata } from "next";

import type { LayoutProps } from "@/types/routes";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function LegalLayout({ children }: LayoutProps) {
  return children;
}
