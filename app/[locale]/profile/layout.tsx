import { requireLearner } from "@/lib/session";
import type { LayoutProps } from "@/types/routes";

export default async function ProfileLayout({ children }: LayoutProps) {
  await requireLearner();

  return children;
}
