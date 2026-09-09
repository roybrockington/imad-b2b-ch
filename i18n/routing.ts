import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  // A list of all locales that are supported
  // Temporarily disabled: 'nl', 'pl' until translations are complete
  // English kept enabled here even though it is
  // temporarily hidden from the nav menu (see components/Navigation.tsx)
  locales: ['en', 'de', 'fr', 'it'],

  // Used when no locale matches
  defaultLocale: 'de',

  // Don't use a locale prefix for the default locale
  localePrefix: 'as-needed'
});

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
