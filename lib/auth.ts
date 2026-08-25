import "server-only";

import { prisma } from "@/lib/prisma";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";

import { createResendEmailProvider } from "@/functions/auth/create-resend-email-provider";
import { requireEnv } from "@/lib/env";

export const authOptions: NextAuthOptions = {
  secret: requireEnv("AUTH_SECRET"),
  adapter: PrismaAdapter(prisma),
  providers: [createResendEmailProvider()],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.role = user.role ?? "USER";
      }

      return session;
    },
  },
  pages: {
    signIn: "/login",
    verifyRequest: "/verify-request",
  },
};
