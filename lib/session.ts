import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { cache } from "react";

export const getAppSession = cache(() => getServerSession(authOptions));

export async function requireAuth() {
  const session = await getAppSession();

  if (!session?.user?.id || !session.user.email) {
    redirect("/login");
  }

  return session;
}

export async function requireAdmin() {
  const session = await requireAuth();

  if (session.user?.role !== "ADMIN") {
    redirect("/profile");
  }

  return session;
}

export async function getApiAdmin() {
  const session = await getAppSession();
  return session?.user?.role === "ADMIN" ? session.user : null;
}
