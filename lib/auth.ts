import "server-only";

import { prisma } from "@/lib/prisma";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";

import {
  MAGIC_LINK_MAX_AGE_MINUTES,
  MAGIC_LINK_MAX_AGE_SECONDS,
} from "@/constants/auth";
import { getMagicLinkEmail } from "@/functions/auth/get-magic-link-email";
import { getResend } from "@/functions/auth/get-resend";
import { getLocaleFromUrl } from "@/functions/i18n/get-locale-from-url";
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
        const message = getMagicLinkEmail(
          getLocaleFromUrl(url),
          url,
          MAGIC_LINK_MAX_AGE_MINUTES
        );
        const { error } = await getResend().emails.send({
          from,
          to: identifier,
          ...message,
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
