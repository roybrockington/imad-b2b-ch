import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n';
import Footer from '@/components/Footer';
import CookieBanner from '@/components/CookieBanner';
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "iMAD AG International Marketing and Distribution",
  description: "Willkommen bei iMAD, Ihrem Schweizer Vertrieb für Musikinstrumente und -elektronik.",
  icons: {
    icon: '//media.sound-service.eu/imad/images/imad-touch-icon-32.png',
    shortcut: '//media.sound-service.eu/imad/images/imad-touch-icon-32.png',
    apple: [
      { url: '//media.sound-service.eu/imad/images/imad-touch-icon-57.png', sizes: '57x57' },
      { url: '//media.sound-service.eu/imad/images/imad-touch-icon-72.png', sizes: '72x72' },
      { url: '//media.sound-service.eu/imad/images/imad-touch-icon-114.png', sizes: '114x114' },
      { url: '//media.sound-service.eu/imad/images/imad-touch-icon-144.png', sizes: '144x144' },
    ],
  },
  alternates: {
    canonical: 'https://imadag.com/',
    languages: {
      'de': 'https://imadag.com/de',
      'fr': 'https://imadag.com/fr',
    },
  },
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <CartProvider>
              {children}
              <Footer />
              <CookieBanner />
            </CartProvider>
          </AuthProvider>
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
