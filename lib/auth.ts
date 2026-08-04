import "server-only";

import { prisma } from "@/lib/prisma";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { Resend } from "resend";

import { requireEnv } from "@/lib/env";

let resendClient: Resend | undefined;

function getResend() {
  resendClient ??= new Resend(requireEnv("RESEND_API_KEY"));
  return resendClient;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export const authOptions: NextAuthOptions = {
  secret: requireEnv("AUTH_SECRET"),
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      from: process.env.EMAIL_FROM,
      async sendVerificationRequest({ identifier, url }) {
        const from = requireEnv("EMAIL_FROM");
        const { error } = await getResend().emails.send({
          from,
          to: identifier,
          subject: "Accedi alla piattaforma",
          text: `Apri questo link per accedere: ${url}`,
          html: `
            <p>Apri il link qui sotto per accedere:</p>
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
