import "server-only";

import { prisma } from "@/lib/prisma";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";

import {
  MAGIC_LINK_MAX_AGE_MINUTES,
  MAGIC_LINK_MAX_AGE_SECONDS,
} from "@/constants/auth";
import { escapeHtml } from "@/functions/auth/escape-html";
import { getResend } from "@/functions/auth/get-resend";
import { requireEnv } from "@/lib/env";

export const authOptions: NextAuthOptions = {
  secret: requireEnv("AUTH_SECRET"),
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      from: process.env.EMAIL_FROM,
      maxAge: MAGIC_LINK_MAX_AGE_SECONDS,
      async sendVerificationRequest({ identifier, url }) {
        const from = requireEnv("EMAIL_FROM");
        const { error } = await getResend().emails.send({
          from,
          to: identifier,
          subject: "Accedi alla piattaforma",
          text: `Apri questo link per accedere (valido ${MAGIC_LINK_MAX_AGE_MINUTES} minuti): ${url}`,
          html: `
            <p>Apri il link qui sotto per accedere. È valido per ${MAGIC_LINK_MAX_AGE_MINUTES} minuti.</p>
            <p><a href="${escapeHtml(url)}">Accedi alla piattaforma</a></p>
          `,
        });

        if (error) {
          throw new Error(`Unable to send verification email: ${error.message}`);
        }
      },
    }),
  ],
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
