import { AuthProvider } from "@/components/auth-provider";
import { Navbar } from "@/components/navbar";
import { isSupportedLocale } from "@/functions/i18n/is-supported-locale";
import { routing } from "@/i18n/routing";
import type { LocalizedLayoutProps } from "@/types/routes";
import type { Metadata } from "next";
import { Inter, Space_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  style: ["normal", "italic"],
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-space-mono",
  weight: ["400", "700"],
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: Pick<LocalizedLayoutProps, "params">): Promise<Metadata> {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) notFound();

  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: {
      default: "Umberto Iglina",
      template: "%s | Umberto Iglina",
    },
    description: t("description"),
  };
}

export default function RootLayout({ children, params }: LocalizedLayoutProps) {
  return <LocaleLayout params={params}>{children}</LocaleLayout>;
}

async function LocaleLayout({
  children,
  params,
}: LocalizedLayoutProps) {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) notFound();

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${spaceMono.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <Navbar />
            <div className="flex-1">{children}</div>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
