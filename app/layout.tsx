import { Navbar } from "@/components/navbar";
import { StoreInitializer } from "@/components/store-initializer";
import { authOptions } from "@/lib/auth";
import type { Metadata } from "next";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import { getServerSession } from "next-auth";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Umberto Iglina",
  description: "La tua piattaforma di apprendimento personalizzata",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  const user = session?.user
    ? { name: session.user.name, email: session.user.email }
    : null;

  return (
    <html
      lang="it"
      className={`${montserrat.variable} ${cormorant.variable} h-full`}>
      <body
        className="min-h-full flex flex-col"
        style={{ background: "var(--color-bg)" }}>
        <StoreInitializer user={user} />
        <Navbar />
        <div className="flex-1">{children}</div>
      </body>
    </html>
  );
}
