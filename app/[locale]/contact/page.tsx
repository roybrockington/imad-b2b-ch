import Navigation from "@/components/Navigation";
import { useTranslations, useLocale } from 'next-intl';

export default function ContactPage() {
  const t = useTranslations('contact');
  const locale = useLocale();

  // Build the embed URL based on locale
  // English uses /support/, other languages use /{locale}/support/
  const embedUrl = locale === 'en'
    ? 'https://blog.sound-service.eu/support/'
    : `https://blog.sound-service.eu/${locale}/support/`;

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('title')}
          </h1>

        <embed src={embedUrl} className="w-full min-h-[1320px]" />
          <div className="text-center text-sm text-gray-500">
            <p>{t('subtitle')}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
