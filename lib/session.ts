import "server-only";

import { getLocalizedPath } from "@/functions/i18n/get-localized-path";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { cache } from "react";

export const getAppSession = cache(() => getServerSession(authOptions));

export async function requireAuth() {
  const session = await getAppSession();

  if (!session?.user?.id || !session.user.email) {
    redirect(getLocalizedPath(await getLocale(), "/login"));
  }

  return session;
}

export async function requireAdmin() {
  const session = await requireAuth();

  if (session.user?.role !== "ADMIN") {
    redirect(getLocalizedPath(await getLocale(), "/profile"));
  }

  return session;
}

export async function getApiAdmin() {
  const session = await getAppSession();
  return session?.user?.role === "ADMIN" ? session.user : null;
}
