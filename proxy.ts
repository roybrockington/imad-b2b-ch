import { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// Extend NextRequest to include Vercel's geo property
interface VercelRequest extends NextRequest {
  geo?: {
    country?: string;
    region?: string;
    city?: string;
    latitude?: string;
    longitude?: string;
  };
}

// Map countries to locales based on primary language
const countryToLocale: Record<string, string> = {
  // German-speaking countries
  'DE': 'de', // Germany
  'AT': 'de', // Austria
  'CH': 'de', // Switzerland (also fr, but de is more common)
  'LI': 'de', // Liechtenstein

  // French-speaking countries
  'FR': 'fr', // France
  'BE': 'fr', // Belgium (also nl, but fr is more common)
  'MC': 'fr', // Monaco
  'LU': 'fr', // Luxembourg

  // Dutch-speaking countries
  'NL': 'nl', // Netherlands

  // Polish-speaking countries
  'PL': 'pl', // Poland

  // English is the default fallback for all other countries
};

export default function proxy(request: VercelRequest) {
  const { pathname } = request.nextUrl;

  // Handle artikel redirects for disabled locales (pl, nl, fr)
  // Match pattern: /[locale]/artikel/[article_number]
  const artikelMatch = pathname.match(/^\/([a-z]{2})\/artikel\/(\d+)$/);
  if (artikelMatch) {
    const [, locale, article] = artikelMatch;

    // If the locale is not enabled, redirect to English version
    if (!routing.locales.includes(locale as any)) {
      const url = request.nextUrl.clone();
      url.pathname = `/artikel/${article}`;
      return NextResponse.redirect(url, 301);
    }
  }

  // Check if the pathname already has a locale prefix (de, fr, nl, pl)
  const pathnameHasLocale = routing.locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // Get the user's country from Vercel's geo data
  const country = request.geo?.country;
  const detectedLocale = country ? countryToLocale[country] : null;

  // Only redirect if:
  // 1. We detected a locale from geo data
  // 2. The detected locale is not the default (en)
  // 3. The pathname doesn't already have a locale prefix
  if (detectedLocale && detectedLocale !== 'en' && !pathnameHasLocale) {
    const url = request.nextUrl.clone();
    url.pathname = `/${detectedLocale}${pathname}`;
    return NextResponse.redirect(url);
  }

  // Use the default next-intl middleware for all other cases
  const intlMiddleware = createIntlMiddleware(routing);
  return intlMiddleware(request);
}

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(de|fr|nl|pl)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
};
