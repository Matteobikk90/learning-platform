import { requireAdmin } from "@/lib/session";
import type { LayoutProps } from "@/types/routes";

export default async function AdminLayout({
  children,
}: LayoutProps) {
  await requireAdmin();

  return <>{children}</>;
}
