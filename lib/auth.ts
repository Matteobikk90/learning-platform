import { prisma } from "@/lib/prisma";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      from: process.env.EMAIL_FROM,
      async sendVerificationRequest({ identifier, url }) {
        await resend.emails.send({
          from: process.env.EMAIL_FROM!,
          to: identifier,
          subject: "Sign in to Learning Platform",
          html: `
            <p>Click the link below to sign in:</p>
            <p><a href="${url}">Sign in</a></p>
          `,
        });
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
