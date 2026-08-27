'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Navigation from '@/components/Navigation';
import Link from 'next/link';

export default function ReturnsPage() {
  const locale = useLocale();
  const t = useTranslations('returns');
  const [isUK, setIsUK] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Convert locale to uppercase for the 4sellers API
  const lang = locale.toUpperCase();
  const ukFrame = "POUNGLIROQ";
  const euFrame = "RGUOWCGNIS";


const returnsFixed = true

  useEffect(() => {
    // Detect user's country via geolocation API
    const detectCountry = async () => {
      try {
        // Use ipapi.co for geolocation (free tier allows 1000 requests/day)
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();

        // Check if country is UK or GB
        const countryCode = data.country_code?.toLowerCase();
        setIsUK(countryCode === 'gb' || countryCode === 'uk');
      } catch (error) {
        console.error('Failed to detect country:', error);
        // Default to EU frame on error
        setIsUK(false);
      } finally {
        setIsLoading(false);
      }
    };

    detectCountry();
    
  }, []);

  // Select frame based on geolocation
  const frameKey = isUK ? ukFrame : euFrame;

  return (
    <div className="flex-1 bg-white">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{t('pageTitle')}</h1>
                {!returnsFixed &&
                <div className="prose prose-lg max-w-none">
                    <p className="text-gray-600 mb-6">
                        {t('temporaryMessage')}
                    </p>
                    <p className="text-gray-600 mb-6">
                        {t('contactFormMessage')} <Link href={`/${locale}/contact`} className='text-brand hover:underline'>{t('contactFormLink')}</Link>.
                    </p>
                </div>
                }
        {returnsFixed && isLoading ? (
          <div className="flex items-center justify-center h-96">
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : (
          <iframe
            className={`embed-responsive-item lazyload w-full px-8 h-screen ${returnsFixed ? '' : 'hidden'}`}
            src={`https://return.4sellers.de/?key=${frameKey}&displayMode=1&lang=${lang}`}
          ></iframe>
        )}
      </main>
    </div>
  );
}
