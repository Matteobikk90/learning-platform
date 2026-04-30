import { requireAdmin } from "@/lib/session";

export default async function AdminPage() {
  await requireAdmin();

  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold">Admin</h1>
      <p className="mt-4">Only admins can see this page.</p>
    </main>
  );
}
