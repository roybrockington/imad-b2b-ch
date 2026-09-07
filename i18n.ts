import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

// Can be imported from a shared config
// Temporarily disabled: 'nl', 'pl' until translations are complete
// English kept enabled here as the fallback/default locale even though it is
// temporarily hidden from the nav menu (see components/Navigation.tsx)
export const locales = ['en', 'de', 'fr', 'it'] as const;
export const defaultLocale = 'en' as const;

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that a valid locale is used
  if (!locale || !locales.includes(locale as any)) {
    locale = defaultLocale;
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});
